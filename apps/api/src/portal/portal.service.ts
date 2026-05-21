import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PortalAuthService } from '../portal-auth/portal-auth.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PortalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly portalAuth: PortalAuthService,
  ) {}

  // ─── Account overview ────────────────────────────────────────────────────────

  async getAccount(portalUserId: string, companyId: string) {
    await this.portalAuth.audit(portalUserId, 'view_account');

    const [company, portalUser, openDeals, invoices] = await Promise.all([
      this.prisma.customerCompany.findUnique({
        where: { id: companyId },
        select: {
          id: true,
          name: true,
          country: true,
          city: true,
          segment: true,
          creditLimit: true,
          balance: true,
          lastActivityAt: true,
          assignedUser: { select: { name: true, email: true, role: true } },
          contacts: {
            where: { deletedAt: null },
            select: { id: true, name: true, role: true, email: true, phone: true, isPrimary: true },
            orderBy: [{ isPrimary: 'desc' }, { name: 'asc' }],
          },
        },
      }),
      this.prisma.portalUser.findUnique({
        where: { id: portalUserId },
        select: { contact: { select: { id: true, name: true, role: true, email: true, phone: true } } },
      }),
      this.prisma.deal.count({
        where: {
          companyId,
          deletedAt: null,
          status: { in: ['new', 'in_progress', 'awaiting'] },
        },
      }),
      this.prisma.invoice.findMany({
        where: { companyId },
        select: { amount: true, status: true },
      }),
    ]);

    if (!company) throw new NotFoundException('Company not found');

    const totalPaid = invoices
      .filter((i) => i.status === 'paid')
      .reduce((sum, i) => sum + Number(i.amount), 0);

    const outstanding = invoices
      .filter((i) => i.status === 'issued' || i.status === 'overdue')
      .reduce((sum, i) => sum + Number(i.amount), 0);

    return {
      company,
      contact: portalUser?.contact ?? null,
      kpis: {
        openInquiries: openDeals,
        totalPaid,
        outstanding,
      },
    };
  }

  // ─── Invoices ─────────────────────────────────────────────────────────────────

  async getInvoices(portalUserId: string, companyId: string) {
    await this.portalAuth.audit(portalUserId, 'view_invoices');

    return this.prisma.invoice.findMany({
      where: { companyId },
      orderBy: { issuedAt: 'desc' },
    });
  }

  // ─── Inquiries (deals) ───────────────────────────────────────────────────────

  async getInquiries(portalUserId: string, companyId: string) {
    await this.portalAuth.audit(portalUserId, 'view_inquiries');

    return this.prisma.deal.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        subject: true,
        status: true,
        priority: true,
        channel: true,
        vehicle: { select: { make: true, model: true, variant: true } },
        createdAt: true,
        updatedAt: true,
        contact: { select: { name: true } },
      },
    });
  }

  // ─── Inquiry detail ───────────────────────────────────────────────────────────

  async getInquiry(portalUserId: string, companyId: string, dealId: string) {
    await this.portalAuth.audit(portalUserId, 'view_inquiry', 'deal', dealId);

    const deal = await this.prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        contact: { select: { id: true, name: true, role: true } },
        interactions: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            type: true,
            direction: true,
            subject: true,
            body: true,
            createdAt: true,
            author: { select: { name: true, role: true } },
          },
        },
      },
    });

    if (!deal || deal.deletedAt) throw new NotFoundException('Inquiry not found');

    // Strict tenant isolation — reject if this deal belongs to another company
    if (deal.companyId !== companyId) {
      throw new ForbiddenException('Access denied');
    }

    return deal;
  }
}
