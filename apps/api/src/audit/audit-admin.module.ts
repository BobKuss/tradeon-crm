import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AuditController } from './audit.controller';

/**
 * Registers the admin-only GET /audit-logs endpoint.
 * Kept separate from AuditModule to avoid a circular initialisation chain:
 * AuditModule is @Global and must initialise before AuthModule, but
 * AuthService depends on AuditService — importing AuthModule inside AuditModule
 * would create a deadlock. AuditAdminModule breaks the cycle by importing
 * AuthModule only after both are registered in AppModule.
 *
 * AuditService is available here via @Global() without an explicit import.
 * AuthModule exports JwtAuthGuard + RolesGuard so the controller's @UseGuards
 * work without re-registering JwtModule here.
 */
@Module({
  imports:     [AuthModule],
  controllers: [AuditController],
})
export class AuditAdminModule {}
