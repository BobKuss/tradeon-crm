import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

export interface PortalAccessPayload {
  sub: string;       // portalUser.id
  email: string;
  companyId: string;
  aud: 'portal';     // audience — prevents staff tokens being used here
}

@Injectable()
export class PortalAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ─── Public methods ──────────────────────────────────────────────────────────

  async login(email: string, password: string, ipAddress?: string) {
    const user = await this.prisma.portalUser.findUnique({
      where: { email },
      include: {
        company: { select: { id: true, name: true, country: true, city: true, segment: true } },
        contact: { select: { id: true, name: true, role: true, phone: true } },
      },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Audit: log the login event
    await this.audit(user.id, 'login', undefined, undefined, ipAddress);

    const tokens = await this.issueTokenPair(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        companyId: user.companyId,
        company: user.company,
        contact: user.contact,
      },
    };
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string };
    try {
      payload = await this.jwtService.verifyAsync<{ sub: string }>(refreshToken, {
        secret: this.config.get<string>('portal.jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.portalUser.findUnique({ where: { id: payload.sub } });
    if (!user?.refreshTokenHash || user.deletedAt) {
      throw new UnauthorizedException('Session expired — please log in again');
    }

    const incoming = this.sha256(refreshToken);
    if (incoming !== user.refreshTokenHash) {
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    return this.issueTokenPair(user);
  }

  async logout(portalUserId: string): Promise<void> {
    const user = await this.prisma.portalUser.findUnique({
      where: { id: portalUserId },
      select: { email: true },
    });
    await this.prisma.portalUser.update({
      where: { id: portalUserId },
      data: { refreshTokenHash: null },
    });
    if (user) {
      await this.audit(portalUserId, 'logout');
    }
  }

  async getProfile(portalUserId: string) {
    const user = await this.prisma.portalUser.findUnique({
      where: { id: portalUserId },
      select: {
        id: true,
        email: true,
        name: true,
        companyId: true,
        mfaEnabled: true,
        createdAt: true,
        company: { select: { id: true, name: true, country: true, city: true, segment: true } },
        contact: { select: { id: true, name: true, role: true, phone: true } },
      },
    });

    if (!user || user === null) throw new UnauthorizedException();
    return user;
  }

  // ─── Audit helper ────────────────────────────────────────────────────────────

  async audit(
    portalUserId: string,
    event: string,
    entityType?: string,
    entityId?: string,
    ipAddress?: string,
  ) {
    await this.prisma.portalAuditLog.create({
      data: { portalUserId, event, entityType, entityId, ipAddress },
    });
  }

  // ─── Private helpers ─────────────────────────────────────────────────────────

  private async issueTokenPair(user: { id: string; email: string; companyId: string }) {
    const accessPayload: PortalAccessPayload = {
      sub: user.id,
      email: user.email,
      companyId: user.companyId,
      aud: 'portal',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.config.get<string>('portal.jwt.secret'),
        expiresIn: this.config.get<string>('portal.jwt.expiresIn', '15m'),
      }),
      this.jwtService.signAsync(
        { sub: user.id },
        {
          secret: this.config.get<string>('portal.jwt.refreshSecret'),
          expiresIn: this.config.get<string>('portal.jwt.refreshExpiresIn', '7d'),
        },
      ),
    ]);

    await this.prisma.portalUser.update({
      where: { id: user.id },
      data: { refreshTokenHash: this.sha256(refreshToken) },
    });

    return { accessToken, refreshToken };
  }

  private sha256(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex');
  }
}
