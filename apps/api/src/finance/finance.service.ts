import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MarginQualityScore } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateDealProfitabilityDto } from './dto/deal-profitability.dto';

export interface Actor {
  id: string;
  email: string;
  ip?: string;
}

// All numeric cost inputs; undefined / null → treated as 0
interface CostInputs {
  purchasePriceNet:      number;
  salePriceNet:          number;
  purchaseTransportCost: number;
  salesTransportCost:    number;
  preparationCost:       number;
  workshopCost:          number;
  documentsCost:         number;
  registrationCost:      number;
  importExportCost:      number;
  warrantyRiskCost:      number;
  bankCost:              number;
  marketplaceCost:       number;
  otherPurchaseCosts:    number;
  otherSalesCosts:       number;
}

interface CalculatedResult {
  profitBeforeCommission:   number;
  marginPercent:            number;
  marginQualityScore:       MarginQualityScore;
  commissionPoolPercentage: number;
  commissionPoolAmount:     number;
  buyerCommissionAmount:    number;
  sellerCommissionAmount:   number;
  totalCommissionAmount:    number;
  finalNetProfit:           number;
  finalMarginPercent:       number;
  approvalRequired:         boolean;
  approvalReason:           string | null;
}

// Select shape returned to the client — Decimals serialised as numbers by Prisma
const PROFITABILITY_SELECT = {
  id:                      true,
  dealId:                  true,
  purchasePriceNet:        true,
  salePriceNet:            true,
  purchaseTransportCost:   true,
  salesTransportCost:      true,
  preparationCost:         true,
  workshopCost:            true,
  documentsCost:           true,
  registrationCost:        true,
  importExportCost:        true,
  warrantyRiskCost:        true,
  bankCost:                true,
  marketplaceCost:         true,
  otherPurchaseCosts:      true,
  otherSalesCosts:         true,
  buyerUserId:             true,
  sellerUserId:            true,
  buyerUser:  { select: { id: true, name: true, initials: true, color: true } },
  sellerUser: { select: { id: true, name: true, initials: true, color: true } },
  profitBeforeCommission:   true,
  marginPercent:            true,
  marginQualityScore:       true,
  commissionPoolPercentage: true,
  commissionPoolAmount:     true,
  buyerCommissionAmount:    true,
  sellerCommissionAmount:   true,
  totalCommissionAmount:    true,
  finalNetProfit:           true,
  finalMarginPercent:       true,
  approvalRequired:         true,
  approvalReason:           true,
  createdAt:                true,
  updatedAt:                true,
} as const;

@Injectable()
export class FinanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ─── Staff users list (for buyer/seller dropdowns) ────────────────────────

  getStaffUsers() {
    return this.prisma.user.findMany({
      where:   { deletedAt: null },
      select:  { id: true, name: true, email: true, initials: true, color: true, authRole: true },
      orderBy: { name: 'asc' },
    });
  }

  // ─── GET — return existing record or a zeroed default ─────────────────────

  async getDealProfitability(dealId: string) {
    await this.assertDealExists(dealId);

    const existing = await this.prisma.dealProfitability.findUnique({
      where:  { dealId },
      select: PROFITABILITY_SELECT,
    });

    if (existing) return existing;

    // Return a zeroed default so the UI can render the empty form.
    // Nothing is written to the database here.
    return this.buildDefault(dealId);
  }

  // ─── PATCH — upsert costs + people, then recalculate ─────────────────────

  async updateDealProfitability(
    dealId: string,
    dto: UpdateDealProfitabilityDto,
    actor: Actor,
  ) {
    await this.assertDealExists(dealId);

    // Validate buyer/seller exist if provided
    if (dto.buyerUserId)  await this.assertUserExists(dto.buyerUserId);
    if (dto.sellerUserId) await this.assertUserExists(dto.sellerUserId);

    // Load existing record (or seed defaults)
    const existing = await this.prisma.dealProfitability.findUnique({
      where: { dealId },
    });

    const merged = this.mergeWithDefaults(existing, dto);
    const calc   = this.calculate(merged);

    const upserted = await this.prisma.dealProfitability.upsert({
      where:  { dealId },
      create: {
        dealId,
        ...this.toDecimalFields(merged),
        buyerUserId:  dto.buyerUserId  ?? existing?.buyerUserId  ?? null,
        sellerUserId: dto.sellerUserId ?? existing?.sellerUserId ?? null,
        ...this.toDecimalCalc(calc),
      },
      update: {
        ...this.toDecimalFields(merged),
        buyerUserId:  'buyerUserId'  in dto ? dto.buyerUserId  : undefined,
        sellerUserId: 'sellerUserId' in dto ? dto.sellerUserId : undefined,
        ...this.toDecimalCalc(calc),
      },
      select: PROFITABILITY_SELECT,
    });

    await this.audit.log({
      actorId:    actor.id,
      actorEmail: actor.email,
      action:     'update',
      entityType: 'deal_profitability',
      entityId:   dealId,
      metadata:   { approvalRequired: calc.approvalRequired, score: calc.marginQualityScore },
      ipAddress:  actor.ip,
    });

    return upserted;
  }

  // ─── POST recalculate — re-runs calculation without changing inputs ───────

  async recalculateDealProfitability(dealId: string, actor: Actor) {
    await this.assertDealExists(dealId);

    const existing = await this.prisma.dealProfitability.findUnique({
      where: { dealId },
    });
    if (!existing) {
      throw new NotFoundException('No profitability record found. Save costs first.');
    }

    const inputs = this.extractInputs(existing);
    const calc   = this.calculate(inputs);

    const updated = await this.prisma.dealProfitability.update({
      where:  { dealId },
      data:   this.toDecimalCalc(calc),
      select: PROFITABILITY_SELECT,
    });

    await this.audit.log({
      actorId:    actor.id,
      actorEmail: actor.email,
      action:     'update',
      entityType: 'deal_profitability',
      entityId:   dealId,
      metadata:   { recalculate: true, score: calc.marginQualityScore },
      ipAddress:  actor.ip,
    });

    return updated;
  }

  // ─── Finance overview — all deals with their profitability ────────────────

  async listDealProfitabilities() {
    return this.prisma.dealProfitability.findMany({
      select: {
        ...PROFITABILITY_SELECT,
        deal: {
          select: {
            id: true, subject: true, status: true, priority: true,
            company: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  // ─── Calculation engine ───────────────────────────────────────────────────

  private calculate(inputs: CostInputs): CalculatedResult {
    const {
      purchasePriceNet, salePriceNet,
      purchaseTransportCost, salesTransportCost,
      preparationCost, workshopCost, documentsCost,
      registrationCost, importExportCost, warrantyRiskCost,
      bankCost, marketplaceCost, otherPurchaseCosts, otherSalesCosts,
    } = inputs;

    const totalCosts =
      purchaseTransportCost + salesTransportCost +
      preparationCost       + workshopCost       +
      documentsCost         + registrationCost   +
      importExportCost      + warrantyRiskCost   +
      bankCost              + marketplaceCost    +
      otherPurchaseCosts    + otherSalesCosts;

    const profitBeforeCommission = this.round2(salePriceNet - purchasePriceNet - totalCosts);

    const marginPercent = salePriceNet > 0
      ? this.round2((profitBeforeCommission / salePriceNet) * 100)
      : 0;

    const { score, poolPct } = this.scoreAndPool(marginPercent);

    let commissionPoolPercentage = poolPct;
    let commissionPoolAmount     = 0;
    let buyerCommissionAmount    = 0;
    let sellerCommissionAmount   = 0;
    let approvalRequired         = false;
    let approvalReason: string | null = null;

    if (profitBeforeCommission <= 0) {
      approvalRequired         = true;
      approvalReason           = 'Negative or zero profit';
      commissionPoolPercentage = 0;
    } else if (profitBeforeCommission < 1000) {
      approvalRequired         = true;
      approvalReason           = 'Minimum profit not reached';
      commissionPoolPercentage = 0;
    } else {
      commissionPoolAmount   = this.round2(profitBeforeCommission * commissionPoolPercentage / 100);
      buyerCommissionAmount  = this.round2(commissionPoolAmount * 0.5);
      sellerCommissionAmount = this.round2(commissionPoolAmount * 0.5);
    }

    const totalCommissionAmount = this.round2(buyerCommissionAmount + sellerCommissionAmount);
    const finalNetProfit        = this.round2(profitBeforeCommission - totalCommissionAmount);
    const finalMarginPercent    = salePriceNet > 0
      ? this.round2((finalNetProfit / salePriceNet) * 100)
      : 0;

    return {
      profitBeforeCommission,
      marginPercent,
      marginQualityScore:       score,
      commissionPoolPercentage,
      commissionPoolAmount,
      buyerCommissionAmount,
      sellerCommissionAmount,
      totalCommissionAmount,
      finalNetProfit,
      finalMarginPercent,
      approvalRequired,
      approvalReason,
    };
  }

  private scoreAndPool(marginPercent: number): { score: MarginQualityScore; poolPct: number } {
    if (marginPercent < 3)  return { score: MarginQualityScore.CRITICAL,  poolPct: 0  };
    if (marginPercent < 5)  return { score: MarginQualityScore.LOW,       poolPct: 8  };
    if (marginPercent < 8)  return { score: MarginQualityScore.MEDIUM,    poolPct: 12 };
    if (marginPercent < 12) return { score: MarginQualityScore.GOOD,      poolPct: 16 };
    return                         { score: MarginQualityScore.EXCELLENT, poolPct: 20 };
  }

  private round2(n: number): number {
    return Math.round(n * 100) / 100;
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async assertDealExists(dealId: string) {
    const deal = await this.prisma.deal.findFirst({
      where:  { id: dealId, deletedAt: null },
      select: { id: true },
    });
    if (!deal) throw new NotFoundException('Deal not found');
  }

  private async assertUserExists(userId: string) {
    const user = await this.prisma.user.findFirst({
      where:  { id: userId, deletedAt: null },
      select: { id: true },
    });
    if (!user) throw new BadRequestException(`User ${userId} not found`);
  }

  private n(v: unknown): number {
    if (v === null || v === undefined) return 0;
    const f = parseFloat(String(v));
    return isNaN(f) ? 0 : f;
  }

  private extractInputs(record: Record<string, unknown>): CostInputs {
    return {
      purchasePriceNet:      this.n(record['purchasePriceNet']),
      salePriceNet:          this.n(record['salePriceNet']),
      purchaseTransportCost: this.n(record['purchaseTransportCost']),
      salesTransportCost:    this.n(record['salesTransportCost']),
      preparationCost:       this.n(record['preparationCost']),
      workshopCost:          this.n(record['workshopCost']),
      documentsCost:         this.n(record['documentsCost']),
      registrationCost:      this.n(record['registrationCost']),
      importExportCost:      this.n(record['importExportCost']),
      warrantyRiskCost:      this.n(record['warrantyRiskCost']),
      bankCost:              this.n(record['bankCost']),
      marketplaceCost:       this.n(record['marketplaceCost']),
      otherPurchaseCosts:    this.n(record['otherPurchaseCosts']),
      otherSalesCosts:       this.n(record['otherSalesCosts']),
    };
  }

  private mergeWithDefaults(
    existing: Record<string, unknown> | null,
    dto: UpdateDealProfitabilityDto,
  ): CostInputs {
    const base = existing ? this.extractInputs(existing) : this.zeroInputs();
    return {
      purchasePriceNet:      dto.purchasePriceNet      ?? base.purchasePriceNet,
      salePriceNet:          dto.salePriceNet          ?? base.salePriceNet,
      purchaseTransportCost: dto.purchaseTransportCost ?? base.purchaseTransportCost,
      salesTransportCost:    dto.salesTransportCost    ?? base.salesTransportCost,
      preparationCost:       dto.preparationCost       ?? base.preparationCost,
      workshopCost:          dto.workshopCost          ?? base.workshopCost,
      documentsCost:         dto.documentsCost         ?? base.documentsCost,
      registrationCost:      dto.registrationCost      ?? base.registrationCost,
      importExportCost:      dto.importExportCost      ?? base.importExportCost,
      warrantyRiskCost:      dto.warrantyRiskCost      ?? base.warrantyRiskCost,
      bankCost:              dto.bankCost              ?? base.bankCost,
      marketplaceCost:       dto.marketplaceCost       ?? base.marketplaceCost,
      otherPurchaseCosts:    dto.otherPurchaseCosts    ?? base.otherPurchaseCosts,
      otherSalesCosts:       dto.otherSalesCosts       ?? base.otherSalesCosts,
    };
  }

  private zeroInputs(): CostInputs {
    return {
      purchasePriceNet: 0, salePriceNet: 0, purchaseTransportCost: 0,
      salesTransportCost: 0, preparationCost: 0, workshopCost: 0,
      documentsCost: 0, registrationCost: 0, importExportCost: 0,
      warrantyRiskCost: 0, bankCost: 0, marketplaceCost: 0,
      otherPurchaseCosts: 0, otherSalesCosts: 0,
    };
  }

  private toDecimalFields(inputs: CostInputs) {
    return {
      purchasePriceNet:      inputs.purchasePriceNet,
      salePriceNet:          inputs.salePriceNet,
      purchaseTransportCost: inputs.purchaseTransportCost,
      salesTransportCost:    inputs.salesTransportCost,
      preparationCost:       inputs.preparationCost,
      workshopCost:          inputs.workshopCost,
      documentsCost:         inputs.documentsCost,
      registrationCost:      inputs.registrationCost,
      importExportCost:      inputs.importExportCost,
      warrantyRiskCost:      inputs.warrantyRiskCost,
      bankCost:              inputs.bankCost,
      marketplaceCost:       inputs.marketplaceCost,
      otherPurchaseCosts:    inputs.otherPurchaseCosts,
      otherSalesCosts:       inputs.otherSalesCosts,
    };
  }

  private toDecimalCalc(calc: CalculatedResult) {
    return {
      profitBeforeCommission:   calc.profitBeforeCommission,
      marginPercent:            calc.marginPercent,
      marginQualityScore:       calc.marginQualityScore,
      commissionPoolPercentage: calc.commissionPoolPercentage,
      commissionPoolAmount:     calc.commissionPoolAmount,
      buyerCommissionAmount:    calc.buyerCommissionAmount,
      sellerCommissionAmount:   calc.sellerCommissionAmount,
      totalCommissionAmount:    calc.totalCommissionAmount,
      finalNetProfit:           calc.finalNetProfit,
      finalMarginPercent:       calc.finalMarginPercent,
      approvalRequired:         calc.approvalRequired,
      approvalReason:           calc.approvalReason,
    };
  }

  private buildDefault(dealId: string) {
    return {
      id:                      null,
      dealId,
      purchasePriceNet:        0, salePriceNet:          0,
      purchaseTransportCost:   0, salesTransportCost:    0,
      preparationCost:         0, workshopCost:          0,
      documentsCost:           0, registrationCost:      0,
      importExportCost:        0, warrantyRiskCost:      0,
      bankCost:                0, marketplaceCost:       0,
      otherPurchaseCosts:      0, otherSalesCosts:       0,
      buyerUserId:             null, sellerUserId:        null,
      buyerUser:               null, sellerUser:          null,
      profitBeforeCommission:  0, marginPercent:         0,
      marginQualityScore:      MarginQualityScore.CRITICAL,
      commissionPoolPercentage:0, commissionPoolAmount:  0,
      buyerCommissionAmount:   0, sellerCommissionAmount:0,
      totalCommissionAmount:   0, finalNetProfit:        0,
      finalMarginPercent:      0,
      approvalRequired:        false, approvalReason:    null,
      createdAt:               null,  updatedAt:         null,
    };
  }
}
