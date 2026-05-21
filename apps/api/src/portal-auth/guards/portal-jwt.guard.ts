import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class PortalJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Record<string, unknown>>();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing portal access token');
    }

    try {
      // Verify with the portal-specific secret — staff tokens will fail here.
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.config.get<string>('portal.jwt.secret'),
      });
      request['portalUser'] = payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired portal access token');
    }

    return true;
  }

  private extractBearerToken(request: Record<string, unknown>): string | undefined {
    const headers = request['headers'] as Record<string, string> | undefined;
    const auth = headers?.['authorization'] ?? '';
    const [type, token] = auth.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
