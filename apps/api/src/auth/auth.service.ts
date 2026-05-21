import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';

interface AccessPayload {
  sub: string;
  email: string;
  role: Role;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
  ) {}

  // ─── Public methods ──────────────────────────────────────────────────────────

  async login(email: string, password: string, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.audit.log({
      actorId: user.id, actorEmail: user.email,
      action: 'login', source: 'staff_ui', ipAddress,
    });

    return this.issueTokenPair(user);
  }

  async refresh(refreshToken: string) {
    // 1. Verify the JWT signature and expiry
    let payload: { sub: string };
    try {
      payload = await this.jwtService.verifyAsync<{ sub: string }>(refreshToken, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // 2. Confirm the stored hash matches (supports single-session revocation)
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user?.refreshTokenHash) {
      throw new UnauthorizedException('Session expired — please log in again');
    }

    const incoming = this.sha256(refreshToken);
    if (incoming !== user.refreshTokenHash) {
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    // 3. Rotate: issue a new pair
    return this.issueTokenPair(user);
  }

  async logout(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
    if (user) {
      await this.audit.log({
        actorId: userId, actorEmail: user.email,
        action: 'logout', source: 'staff_ui',
      });
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        initials: true,
        role: true,
        authRole: true,
        color: true,
        createdAt: true,
      },
    });

    if (!user) throw new UnauthorizedException();
    return user;
  }

  // ─── Private helpers ─────────────────────────────────────────────────────────

  private async issueTokenPair(user: { id: string; email: string; authRole: Role }) {
    const accessPayload: AccessPayload = {
      sub: user.id,
      email: user.email,
      role: user.authRole,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.config.get<string>('jwt.secret'),
        expiresIn: this.config.get<string>('jwt.expiresIn', '15m'),
      }),
      this.jwtService.signAsync(
        { sub: user.id },
        {
          secret: this.config.get<string>('jwt.refreshSecret'),
          expiresIn: this.config.get<string>('jwt.refreshExpiresIn', '7d'),
        },
      ),
    ]);

    // Persist refresh token hash (SHA-256 — JWT already provides signing security)
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: this.sha256(refreshToken) },
    });

    return { accessToken, refreshToken };
  }

  private sha256(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex');
  }
}
