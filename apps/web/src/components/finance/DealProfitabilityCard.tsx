'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  apiGetDealProfitability,
  apiGetStaffUsers,
  apiRecalculateDealProfitability,
  apiUpdateDealProfitability,
} from '@/lib/api';
import { ft } from '@/lib/finance-translations';
import type { DealProfitability, MarginQualityScore, StaffUser } from '@/lib/types';
import { MarginQualityBadge } from './MarginQualityBadge';

// ─── Local calculation (mirrors backend logic) ────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function scoreAndPool(mp: number): { score: MarginQualityScore; poolPct: number } {
  if (mp < 3)  return { score: 'CRITICAL',  poolPct: 0  };
  if (mp < 5)  return { score: 'LOW',       poolPct: 8  };
  if (mp < 8)  return { score: 'MEDIUM',    poolPct: 12 };
  if (mp < 12) return { score: 'GOOD',      poolPct: 16 };
  return             { score: 'EXCELLENT', poolPct: 20 };
}

function calculate(f: FormState): Calc {
  const n = (v: string) => parseFloat(v) || 0;

  const purchasePriceNet = n(f.purchasePriceNet);
  const salePriceNet     = n(f.salePriceNet);

  const totalCosts =
    n(f.purchaseTransportCost) + n(f.salesTransportCost) +
    n(f.preparationCost)       + n(f.workshopCost)       +
    n(f.documentsCost)         + n(f.registrationCost)   +
    n(f.importExportCost)      + n(f.warrantyRiskCost)   +
    n(f.bankCost)              + n(f.marketplaceCost)    +
    n(f.otherPurchaseCosts)    + n(f.otherSalesCosts);

  const profitBeforeCommission = round2(salePriceNet - purchasePriceNet - totalCosts);
  const marginPercent = salePriceNet > 0
    ? round2((profitBeforeCommission / salePriceNet) * 100)
    : 0;

  const { score, poolPct } = scoreAndPool(marginPercent);

  let commissionPoolPercentage = poolPct;
  let commissionPoolAmount     = 0;
  let buyerCommissionAmount    = 0;
  let sellerCommissionAmount   = 0;
  let approvalRequired         = false;
  let approvalReason           = '';

  if (profitBeforeCommission <= 0) {
    approvalRequired         = true;
    approvalReason           = ft.negativeProfit;
    commissionPoolPercentage = 0;
  } else if (profitBeforeCommission < 1000) {
    approvalRequired         = true;
    approvalReason           = ft.minimumProfitNotReached;
    commissionPoolPercentage = 0;
  } else {
    commissionPoolAmount   = round2(profitBeforeCommission * commissionPoolPercentage / 100);
    buyerCommissionAmount  = round2(commissionPoolAmount * 0.5);
    sellerCommissionAmount = round2(commissionPoolAmount * 0.5);
  }

  const totalCommissionAmount = round2(buyerCommissionAmount + sellerCommissionAmount);
  const finalNetProfit        = round2(profitBeforeCommission - totalCommissionAmount);
  const finalMarginPercent    = salePriceNet > 0
    ? round2((finalNetProfit / salePriceNet) * 100)
    : 0;

  const isDoubleCommission = !!f.buyerUserId && f.buyerUserId === f.sellerUserId;
  const displayTotalForPerson = isDoubleCommission
    ? round2(buyerCommissionAmount + sellerCommissionAmount)
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
    isDoubleCommission,
    displayTotalForPerson,
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────

type FormState = {
  purchasePriceNet:      string;
  salePriceNet:          string;
  purchaseTransportCost: string;
  salesTransportCost:    string;
  preparationCost:       string;
  workshopCost:          string;
  documentsCost:         string;
  registrationCost:      string;
  importExportCost:      string;
  warrantyRiskCost:      string;
  bankCost:              string;
  marketplaceCost:       string;
  otherPurchaseCosts:    string;
  otherSalesCosts:       string;
  buyerUserId:           string;
  sellerUserId:          string;
};

type Calc = {
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
  approvalReason:           string;
  isDoubleCommission:       boolean;
  displayTotalForPerson:    number;
};

function toFormState(p: DealProfitability): FormState {
  const s = (v: number | null | undefined) => (v == null ? '' : String(v));
  return {
    purchasePriceNet:      s(p.purchasePriceNet),
    salePriceNet:          s(p.salePriceNet),
    purchaseTransportCost: s(p.purchaseTransportCost),
    salesTransportCost:    s(p.salesTransportCost),
    preparationCost:       s(p.preparationCost),
    workshopCost:          s(p.workshopCost),
    documentsCost:         s(p.documentsCost),
    registrationCost:      s(p.registrationCost),
    importExportCost:      s(p.importExportCost),
    warrantyRiskCost:      s(p.warrantyRiskCost),
    bankCost:              s(p.bankCost),
    marketplaceCost:       s(p.marketplaceCost),
    otherPurchaseCosts:    s(p.otherPurchaseCosts),
    otherSalesCosts:       s(p.otherSalesCosts),
    buyerUserId:           p.buyerUserId  ?? '',
    sellerUserId:          p.sellerUserId ?? '',
  };
}

const EMPTY_FORM: FormState = {
  purchasePriceNet: '', salePriceNet: '',
  purchaseTransportCost: '', salesTransportCost: '',
  preparationCost: '', workshopCost: '', documentsCost: '',
  registrationCost: '', importExportCost: '', warrantyRiskCost: '',
  bankCost: '', marketplaceCost: '', otherPurchaseCosts: '', otherSalesCosts: '',
  buyerUserId: '', sellerUserId: '',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n);
}

function pct(n: number): string {
  return `${n.toFixed(2)} %`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
      {label}
    </h3>
  );
}

function CostField({
  label, name, value, onChange,
}: {
  label: string;
  name: keyof FormState;
  value: string;
  onChange: (name: keyof FormState, val: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-xs text-gray-400">€</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={e => onChange(name, e.target.value)}
          placeholder="0.00"
          className="w-full rounded border border-gray-200 bg-white py-1.5 pl-6 pr-2 text-sm text-gray-900 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
        />
      </div>
    </div>
  );
}

function ResultRow({
  label, value, bold, colorClass,
}: {
  label: string;
  value: string;
  bold?: boolean;
  colorClass?: string;
}) {
  return (
    <div className={`flex items-center justify-between gap-4 py-1.5 border-b border-gray-100 last:border-0 ${bold ? 'font-semibold' : ''}`}>
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-sm font-mono tabular-nums ${colorClass ?? 'text-gray-900'}`}>{value}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  dealId: string;
}

export function DealProfitabilityCard({ dealId }: Props) {
  const [form,         setForm]         = useState<FormState>(EMPTY_FORM);
  const [staffUsers,   setStaffUsers]   = useState<StaffUser[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [isSaving,     setIsSaving]     = useState(false);
  const [saveStatus,   setSaveStatus]   = useState<'idle' | 'saved' | 'error'>('idle');
  const [errorMsg,     setErrorMsg]     = useState('');

  // Live-calculated result (no round-trip needed for preview)
  const calc = calculate(form);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [prof, users] = await Promise.all([
        apiGetDealProfitability(dealId),
        apiGetStaffUsers(),
      ]);
      setForm(toFormState(prof));
      setStaffUsers(users);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : ft.error);
    } finally {
      setIsLoading(false);
    }
  }, [dealId]);

  useEffect(() => { load(); }, [load]);

  function handleField(name: keyof FormState, val: string) {
    setForm(prev => ({ ...prev, [name]: val }));
    setSaveStatus('idle');
  }

  async function handleSave() {
    setIsSaving(true);
    setSaveStatus('idle');
    setErrorMsg('');
    try {
      const n = (v: string) => v === '' ? 0 : parseFloat(v) || 0;
      await apiUpdateDealProfitability(dealId, {
        purchasePriceNet:      n(form.purchasePriceNet),
        salePriceNet:          n(form.salePriceNet),
        purchaseTransportCost: n(form.purchaseTransportCost),
        salesTransportCost:    n(form.salesTransportCost),
        preparationCost:       n(form.preparationCost),
        workshopCost:          n(form.workshopCost),
        documentsCost:         n(form.documentsCost),
        registrationCost:      n(form.registrationCost),
        importExportCost:      n(form.importExportCost),
        warrantyRiskCost:      n(form.warrantyRiskCost),
        bankCost:              n(form.bankCost),
        marketplaceCost:       n(form.marketplaceCost),
        otherPurchaseCosts:    n(form.otherPurchaseCosts),
        otherSalesCosts:       n(form.otherSalesCosts),
        buyerUserId:           form.buyerUserId  || null,
        sellerUserId:          form.sellerUserId || null,
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : ft.error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRecalculate() {
    setIsSaving(true);
    setErrorMsg('');
    try {
      const updated = await apiRecalculateDealProfitability(dealId);
      setForm(toFormState(updated));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : ft.error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-gray-400">
        Loading…
      </div>
    );
  }

  const profitColor = calc.finalNetProfit < 0 ? 'text-red-600' : 'text-green-700';

  return (
    <div className="space-y-6">

      {/* Approval warning */}
      {calc.approvalRequired && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3">
          <p className="text-sm font-semibold text-orange-700">{ft.approvalRequired}</p>
          <p className="mt-0.5 text-xs text-orange-600">{calc.approvalReason}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">

        {/* ── A: Purchase Costs ── */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <SectionHeader label={ft.purchaseCosts} />
          <div className="space-y-3">
            <CostField label={ft.purchasePriceNet}   name="purchasePriceNet"      value={form.purchasePriceNet}      onChange={handleField} />
            <CostField label={ft.purchaseTransport}  name="purchaseTransportCost" value={form.purchaseTransportCost} onChange={handleField} />
            <CostField label={ft.preparation}        name="preparationCost"       value={form.preparationCost}       onChange={handleField} />
            <CostField label={ft.workshop}           name="workshopCost"          value={form.workshopCost}          onChange={handleField} />
            <CostField label={ft.documents}          name="documentsCost"         value={form.documentsCost}         onChange={handleField} />
            <CostField label={ft.registration}       name="registrationCost"      value={form.registrationCost}      onChange={handleField} />
            <CostField label={ft.importExport}       name="importExportCost"      value={form.importExportCost}      onChange={handleField} />
            <CostField label={ft.otherPurchaseCosts} name="otherPurchaseCosts"    value={form.otherPurchaseCosts}    onChange={handleField} />
          </div>
        </div>

        {/* ── B: Sales Costs ── */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <SectionHeader label={ft.salesCosts} />
          <div className="space-y-3">
            <CostField label={ft.salePriceNet}      name="salePriceNet"       value={form.salePriceNet}       onChange={handleField} />
            <CostField label={ft.salesTransport}    name="salesTransportCost" value={form.salesTransportCost} onChange={handleField} />
            <CostField label={ft.warrantyRisk}      name="warrantyRiskCost"   value={form.warrantyRiskCost}   onChange={handleField} />
            <CostField label={ft.bankCosts}         name="bankCost"           value={form.bankCost}           onChange={handleField} />
            <CostField label={ft.marketplaceCosts}  name="marketplaceCost"    value={form.marketplaceCost}    onChange={handleField} />
            <CostField label={ft.otherSalesCosts}   name="otherSalesCosts"    value={form.otherSalesCosts}    onChange={handleField} />
          </div>
        </div>

        {/* ── C: People & Commission ── */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <SectionHeader label={ft.peopleCommission} />
          <div className="space-y-4">

            {/* Buyer */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{ft.buyerUser}</label>
              <select
                value={form.buyerUserId}
                onChange={e => handleField('buyerUserId', e.target.value)}
                className="w-full rounded border border-gray-200 bg-white py-1.5 px-2 text-sm text-gray-900 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
              >
                <option value="">{ft.selectUser}</option>
                {staffUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-400">{ft.buyerShare}: 50 %</p>
            </div>

            {/* Seller */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{ft.sellerUser}</label>
              <select
                value={form.sellerUserId}
                onChange={e => handleField('sellerUserId', e.target.value)}
                className="w-full rounded border border-gray-200 bg-white py-1.5 px-2 text-sm text-gray-900 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
              >
                <option value="">{ft.selectUser}</option>
                {staffUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-400">{ft.sellerShare}: 50 %</p>
            </div>

            {/* Double Commission badge */}
            {calc.isDoubleCommission && (
              <div className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700">
                {ft.doubleCommission} — {fmt(calc.displayTotalForPerson)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── D: Result ── */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between mb-4">
          <SectionHeader label={ft.result} />
          <MarginQualityBadge score={calc.marginQualityScore} />
        </div>

        <div className="grid gap-x-8 gap-y-0 sm:grid-cols-2">
          <div>
            <ResultRow label={ft.profitBeforeCommission}
              value={fmt(calc.profitBeforeCommission)}
              colorClass={calc.profitBeforeCommission < 0 ? 'text-red-600' : 'text-gray-900'}
              bold
            />
            <ResultRow label={ft.marginPercent}            value={pct(calc.marginPercent)} />
            <ResultRow label={ft.commissionPool}           value={`${calc.commissionPoolPercentage} %`} />
            <ResultRow label={ft.commissionPoolAmount}     value={fmt(calc.commissionPoolAmount)} />
            <ResultRow label={ft.buyerCommission}          value={fmt(calc.buyerCommissionAmount)} />
          </div>
          <div>
            <ResultRow label={ft.sellerCommission}         value={fmt(calc.sellerCommissionAmount)} />
            <ResultRow label={ft.totalCommission}          value={fmt(calc.totalCommissionAmount)} />
            <ResultRow
              label={ft.finalNetProfit}
              value={fmt(calc.finalNetProfit)}
              colorClass={profitColor}
              bold
            />
            <ResultRow
              label={ft.finalMarginPercent}
              value={pct(calc.finalMarginPercent)}
              colorClass={profitColor}
              bold
            />
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded bg-brand-red px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {isSaving ? ft.saving : ft.save}
        </button>
        <button
          onClick={handleRecalculate}
          disabled={isSaving}
          className="rounded border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {ft.recalculate}
        </button>

        {saveStatus === 'saved' && (
          <span className="text-xs font-medium text-green-600">{ft.saved}</span>
        )}
        {saveStatus === 'error' && errorMsg && (
          <span className="text-xs font-medium text-red-600">{errorMsg}</span>
        )}
      </div>

    </div>
  );
}
