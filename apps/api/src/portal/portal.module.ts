import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PortalAuthModule } from '../portal-auth/portal-auth.module';
import { PortalController } from './portal.controller';
import { PortalService } from './portal.service';

@Module({
  imports: [PrismaModule, PortalAuthModule],
  controllers: [PortalController],
  providers: [PortalService],
})
export class PortalModule {}
