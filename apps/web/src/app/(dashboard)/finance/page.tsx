'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGetFinanceDealList } from '@/lib/api';
import { ft } from '@/lib/finance-translations';
import type { DealProfitability } from '@/lib/types';
import { PageSpinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { MarginQualityBadge } from '@/components/finance/MarginQualityBadge';

function fmt(n: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n);
}

function pct(n: number): string {
  return `${n.toFixed(2)} %`;
}

// Extended shape with deal info (from listDealProfitabilities endpoint)
interface ProfWithDeal extends DealProfitability {
  deal?: {
    id: string;
    subject: string;
    status: string;
    priority: string;
    company?: { id: string; name: string } | null;
  } | null;
}

export default function FinancePage() {
  const [rows,      setRows]      = useState<ProfWithDeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await apiGetFinanceDealList() as ProfWithDeal[];
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load finance data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-dark">{ft.title}</h1>
          <p className="text-xs text-gray-400 mt-0.5">{ft.subtitle}</p>
        </div>
        <span className="text-xs text-gray-400">{rows.length} deals</span>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : rows.length === 0 ? (
        <EmptyState />
      ) : (
        <FinanceTable rows={rows} />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-16 text-center">
      <p className="text-sm text-gray-400">{ft.noData}</p>
      <Link href="/deals" className="mt-3 text-xs font-medium text-brand-red hover:underline">
        Open a deal and add profitability data
      </Link>
    </div>
  );
}

function FinanceTable({ rows }: { rows: ProfWithDeal[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-100 text-sm">
        <thead className="bg-gray-50 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          <tr>
            <th className="py-3 pl-4 pr-3 text-left">Deal</th>
            <th className="px-3 py-3 text-left">Company</th>
            <th className="px-3 py-3 text-right">{ft.salePriceNet}</th>
            <th className="px-3 py-3 text-right">{ft.profitBeforeCommission}</th>
            <th className="px-3 py-3 text-right">{ft.marginPercent}</th>
            <th className="px-3 py-3 text-center">{ft.marginQualityScore}</th>
            <th className="px-3 py-3 text-right">{ft.totalCommission}</th>
            <th className="px-3 py-3 text-right">{ft.finalNetProfit}</th>
            <th className="px-3 py-3 text-center">Approval</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map(row => (
            <FinanceRow key={row.dealId} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FinanceRow({ row }: { row: ProfWithDeal }) {
  const profitColor   = Number(row.profitBeforeCommission) < 0 ? 'text-red-600' : '';
  const finalColor    = Number(row.finalNetProfit)         < 0 ? 'text-red-600' : 'text-green-700';

  return (
    <tr className="hover:bg-gray-50">
      <td className="py-3 pl-4 pr-3">
        <Link href={`/deals/${row.dealId}?tab=finance`} className="font-medium text-brand-dark hover:text-brand-red transition-colors">
          {row.deal?.subject ?? row.dealId}
        </Link>
      </td>
      <td className="px-3 py-3 text-gray-500">
        {row.deal?.company ? (
          <Link href={`/customers/${row.deal.company.id}`} className="hover:text-brand-red">
            {row.deal.company.name}
          </Link>
        ) : '—'}
      </td>
      <td className="px-3 py-3 text-right font-mono tabular-nums text-gray-700">
        {fmt(Number(row.salePriceNet))}
      </td>
      <td className={`px-3 py-3 text-right font-mono tabular-nums ${profitColor}`}>
        {fmt(Number(row.profitBeforeCommission))}
      </td>
      <td className="px-3 py-3 text-right font-mono tabular-nums text-gray-700">
        {pct(Number(row.marginPercent))}
      </td>
      <td className="px-3 py-3 text-center">
        <MarginQualityBadge score={row.marginQualityScore} size="sm" />
      </td>
      <td className="px-3 py-3 text-right font-mono tabular-nums text-gray-700">
        {fmt(Number(row.totalCommissionAmount))}
      </td>
      <td className={`px-3 py-3 text-right font-mono tabular-nums font-semibold ${finalColor}`}>
        {fmt(Number(row.finalNetProfit))}
      </td>
      <td className="px-3 py-3 text-center">
        {row.approvalRequired ? (
          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
            Required
          </span>
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </td>
    </tr>
  );
}
