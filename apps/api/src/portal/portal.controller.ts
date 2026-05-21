import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CurrentPortalUser } from '../portal-auth/decorators/current-portal-user.decorator';
import { PortalJwtGuard } from '../portal-auth/guards/portal-jwt.guard';
import { PortalAccessPayload } from '../portal-auth/portal-auth.service';
import { PortalService } from './portal.service';

@Controller({ path: 'portal', version: '1' })
@UseGuards(PortalJwtGuard)
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  /**
   * GET /api/v1/portal/account
   * Company overview, KPIs, and contact info for the logged-in portal user.
   */
  @Get('account')
  getAccount(@CurrentPortalUser() user: PortalAccessPayload) {
    return this.portalService.getAccount(user.sub, user.companyId);
  }

  /**
   * GET /api/v1/portal/invoices
   * All invoices belonging to the portal user's company.
   */
  @Get('invoices')
  getInvoices(@CurrentPortalUser() user: PortalAccessPayload) {
    return this.portalService.getInvoices(user.sub, user.companyId);
  }

  /**
   * GET /api/v1/portal/inquiries
   * All deals/inquiries belonging to the portal user's company.
   */
  @Get('inquiries')
  getInquiries(@CurrentPortalUser() user: PortalAccessPayload) {
    return this.portalService.getInquiries(user.sub, user.companyId);
  }

  /**
   * GET /api/v1/portal/inquiries/:id
   * Detail view of a single inquiry (with interaction thread).
   * Returns 403 if the deal belongs to a different company.
   */
  @Get('inquiries/:id')
  getInquiry(
    @CurrentPortalUser() user: PortalAccessPayload,
    @Param('id') dealId: string,
  ) {
    return this.portalService.getInquiry(user.sub, user.companyId, dealId);
  }
}
