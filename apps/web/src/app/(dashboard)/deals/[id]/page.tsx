'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiGetDeal } from '@/lib/api';
import type { Deal } from '@/lib/types';
import { PageSpinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { PriorityBadge } from '@/components/ui/Badge';
import { DealProfitabilityCard } from '@/components/finance/DealProfitabilityCard';

type Tab = 'overview' | 'finance';

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  new:         { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-400'   },
  in_progress: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-400' },
  awaiting:    { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-400' },
  resolved:    { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-400'  },
  cancelled:   { bg: 'bg-gray-50',   text: 'text-gray-500',   dot: 'bg-gray-400'   },
};

const STATUS_LABELS: Record<string, string> = {
  new: 'New', in_progress: 'In Progress', awaiting: 'Awaiting',
  resolved: 'Resolved', cancelled: 'Cancelled',
};

export default function DealDetailPage() {
  const params         = useParams<{ id: string }>();
  const dealId         = params.id;
  const [deal, setDeal]         = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState('');
  const [tab, setTab]             = useState<Tab>('overview');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const d = await apiGetDeal(dealId);
      setDeal(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load deal');
    } finally {
      setIsLoading(false);
    }
  }, [dealId]);

  useEffect(() => { load(); }, [load]);

  if (isLoading) return <PageSpinner />;
  if (error)     return <ErrorState message={error} onRetry={load} />;
  if (!deal)     return <ErrorState message="Deal not found" onRetry={load} />;

  const st    = STATUS_STYLES[deal.status] ?? STATUS_STYLES['new'];
  const stLbl = STATUS_LABELS[deal.status] ?? deal.status;

  return (
    <div className="space-y-4">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400">
        <Link href="/deals" className="hover:text-brand-red transition-colors">Deals</Link>
        <span>/</span>
        <span className="text-gray-600 truncate max-w-xs">{deal.subject}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-brand-dark leading-tight">{deal.subject}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium ${st.bg} ${st.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
              {stLbl}
            </span>
            <PriorityBadge priority={deal.priority} />
            {deal.company && (
              <Link
                href={`/customers/${deal.companyId}`}
                className="text-xs font-medium text-brand-red hover:underline"
              >
                {deal.company.name}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {(['overview', 'finance'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t
                ? 'border-brand-red text-brand-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t === 'overview' ? 'Overview' : 'Finance'}
            {t === 'finance' && (
              <span className="ml-1.5 rounded-full bg-brand-red/10 px-1.5 py-0.5 text-[10px] font-semibold text-brand-red">
                P&L
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && <OverviewTab deal={deal} />}
      {tab === 'finance'  && <DealProfitabilityCard dealId={dealId} />}
    </div>
  );
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({ deal }: { deal: Deal }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

      <InfoCard title="Deal Details">
        <InfoRow label="Channel"  value={deal.channel} />
        <InfoRow label="Status"   value={STATUS_LABELS[deal.status] ?? deal.status} />
        <InfoRow label="Priority" value={deal.priority} />
        <InfoRow label="Created"  value={new Date(deal.createdAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })} />
        <InfoRow label="Updated"  value={new Date(deal.updatedAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })} />
      </InfoCard>

      {deal.company && (
        <InfoCard title="Company">
          <InfoRow label="Name"    value={deal.company.name} />
        </InfoCard>
      )}

      {deal.contact && (
        <InfoCard title="Contact">
          <InfoRow label="Name"  value={deal.contact.name} />
        </InfoCard>
      )}

      {deal.assignedUser && (
        <InfoCard title="Assigned To">
          <InfoRow label="Name"  value={deal.assignedUser.name ?? '—'} />
        </InfoCard>
      )}

    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-medium text-gray-800 capitalize">{value ?? '—'}</span>
    </div>
  );
}
