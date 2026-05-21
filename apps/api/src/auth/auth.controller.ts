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
import { Role } from '@prisma/client';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

interface JwtUser {
  sub: string;
  email: string;
  role: Role;
}

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/v1/auth/login
   * Returns an access token (15 min) and a refresh token (7 days).
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto, @Req() req: Record<string, unknown>) {
    const headers = req['headers'] as Record<string, string> | undefined;
    const ip = (headers?.['x-forwarded-for'] ?? headers?.['x-real-ip'] ?? '') as string;
    return this.authService.login(dto.email, dto.password, ip || undefined);
  }

  /**
   * POST /api/v1/auth/refresh
   * Rotates the refresh token and issues a new access token.
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  /**
   * POST /api/v1/auth/logout
   * Invalidates the stored refresh token hash.
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@CurrentUser() user: JwtUser) {
    return this.authService.logout(user.sub);
  }

  /**
   * GET /api/v1/auth/me
   * Returns the profile of the currently authenticated user.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: JwtUser) {
    return this.authService.getProfile(user.sub);
  }

  /**
   * GET /api/v1/auth/admin-only
   * Example of a role-protected route (admin only).
   */
  @Get('admin-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  adminOnlyExample(@CurrentUser() user: JwtUser) {
    return { message: `Hello admin ${user.email}` };
  }
}
