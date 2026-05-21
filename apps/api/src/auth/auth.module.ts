import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    PrismaModule,
    // Registered without defaults — each sign/verify call passes its own
    // secret and options via ConfigService, keeping access and refresh
    // secrets fully separate.
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, RolesGuard],
  // Export guards so other modules can apply them with @UseGuards() without
  // needing to import AuthModule directly everywhere.
  // Re-export JwtModule so any module that imports AuthModule can resolve
  // JwtService (needed by JwtAuthGuard when used via @UseGuards()).
  exports: [AuthService, JwtAuthGuard, RolesGuard, JwtModule],
})
export class AuthModule {}
