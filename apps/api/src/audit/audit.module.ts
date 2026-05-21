import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';

/**
 * Global module — AuditService is injectable in every other module
 * without having to import AuditModule explicitly.
 *
 * The read endpoint (AuditController) lives in AuditAdminModule to
 * avoid a circular initialisation chain:
 *   AuditModule → AuthModule → AuthService(AuditService) → AuditModule
 */
@Global()
@Module({
  providers: [AuditService],
  exports:   [AuditService],
})
export class AuditModule {}
