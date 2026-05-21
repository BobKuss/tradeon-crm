import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditAdminModule } from './audit/audit-admin.module';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import configuration from './config/configuration';
import { CrmModule } from './crm/crm.module';
import { HealthModule } from './health/health.module';
import { PortalAuthModule } from './portal-auth/portal-auth.module';
import { PortalModule } from './portal/portal.module';
import { PrismaModule } from './prisma/prisma.module';
import { FinanceModule } from './finance/finance.module';
import { InvoicesModule } from './invoices/invoices.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { VehiclesModule } from './vehicles/vehicles.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    PrismaModule,
    // Global audit service — registered before any module that injects AuditService
    AuditModule,
    HealthModule,
    // Internal staff auth & CRM modules
    AuthModule,
    // Admin endpoint for the audit trail — separate module avoids circular init
    AuditAdminModule,
    CrmModule,
    // B2B customer portal (separate auth + data, strict tenant isolation)
    PortalAuthModule,
    PortalModule,
    // Vehicle inventory
    VehiclesModule,
    // Organizations (CustomerCompany vertical slice)
    OrganizationsModule,
    // Deal profitability & margin quality engine
    FinanceModule,
    // VeriFactu-compliant invoice management
    InvoicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
