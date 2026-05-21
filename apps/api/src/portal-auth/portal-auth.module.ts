import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { PortalAuthController } from './portal-auth.controller';
import { PortalAuthService } from './portal-auth.service';
import { PortalJwtGuard } from './guards/portal-jwt.guard';

@Module({
  imports: [
    PrismaModule,
    // No default secret — each sign/verify call passes its own secret via ConfigService.
    JwtModule.register({}),
  ],
  controllers: [PortalAuthController],
  providers: [PortalAuthService, PortalJwtGuard],
  exports: [PortalAuthService, PortalJwtGuard, JwtModule],
})
export class PortalAuthModule {}
