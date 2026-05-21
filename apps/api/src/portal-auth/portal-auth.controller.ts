import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CurrentPortalUser } from './decorators/current-portal-user.decorator';
import { PortalLoginDto } from './dto/portal-login.dto';
import { PortalRefreshDto } from './dto/portal-refresh.dto';
import { PortalJwtGuard } from './guards/portal-jwt.guard';
import { PortalAccessPayload, PortalAuthService } from './portal-auth.service';

@Controller({ path: 'portal/auth', version: '1' })
export class PortalAuthController {
  constructor(private readonly portalAuthService: PortalAuthService) {}

  /**
   * POST /api/v1/portal/auth/login
   * Authenticates a portal user. Returns access + refresh tokens and profile.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: PortalLoginDto, @Req() req: Record<string, unknown>) {
    const headers = req['headers'] as Record<string, string> | undefined;
    const ip = (headers?.['x-forwarded-for'] ?? headers?.['x-real-ip'] ?? '') as string;
    return this.portalAuthService.login(dto.email, dto.password, ip || undefined);
  }

  /**
   * POST /api/v1/portal/auth/refresh
   * Rotates the refresh token and issues a new access token.
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: PortalRefreshDto) {
    return this.portalAuthService.refresh(dto.refreshToken);
  }

  /**
   * POST /api/v1/portal/auth/logout
   * Invalidates the stored refresh token.
   */
  @Post('logout')
  @UseGuards(PortalJwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@CurrentPortalUser() user: PortalAccessPayload) {
    return this.portalAuthService.logout(user.sub);
  }

  /**
   * GET /api/v1/portal/auth/me
   * Returns the profile of the currently authenticated portal user.
   */
  @Get('me')
  @UseGuards(PortalJwtGuard)
  me(@CurrentPortalUser() user: PortalAccessPayload) {
    return this.portalAuthService.getProfile(user.sub);
  }
}
