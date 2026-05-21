'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGetDeals } from '@/lib/api';
import { getStaffById } from '@/lib/mock-data';
import type { Deal, DealStatus } from '@/lib/types';
import { PriorityBadge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { Avatar } from '@/components/ui/Avatar';

// ─── Pipeline column config ───────────────────────────────────────────────────

interface Column {
  status: DealStatus;
  label: string;
  headerColor: string;
  dotColor: string;
}

const COLUMNS: Column[] = [
  { status: 'new',         label: 'New',         headerColor: 'bg-blue-50 text-blue-700',   dotColor: 'bg-blue-400' },
  { status: 'in_progress', label: 'In Progress',  headerColor: 'bg-yellow-50 text-yellow-700', dotColor: 'bg-yellow-400' },
  { status: 'awaiting',    label: 'Awaiting',     headerColor: 'bg-orange-50 text-orange-700', dotColor: 'bg-orange-400' },
  { status: 'resolved',    label: 'Resolved',     headerColor: 'bg-green-50 text-green-700',  dotColor: 'bg-green-400' },
];

const CHANNEL_ICONS: Record<string, string> = {
  email:     '✉',
  portal:    '🌐',
  phone:     '📞',
  in_person: '🤝',
};

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export default function DealsPage() {
  const [deals, setDeals]         = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState('');
  const [view, setView]           = useState<'pipeline' | 'list'>('pipeline');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await apiGetDeals({ limit: 100 });
      setDeals(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deals');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const dealsByStatus = (status: DealStatus) => deals.filter(d => d.status === status);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400">{deals.length} deals</span>
        <div className="ml-auto flex rounded border border-gray-200 bg-white overflow-hidden">
          <button
            onClick={() => setView('pipeline')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === 'pipeline' ? 'bg-brand-red text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Pipeline
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === 'list' ? 'bg-brand-red text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            List
          </button>
        </div>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : view === 'pipeline' ? (
        <PipelineView dealsByStatus={dealsByStatus} />
      ) : (
        <ListView deals={deals} />
      )}
    </div>
  );
}

// ─── Pipeline (Kanban) view ───────────────────────────────────────────────────

function PipelineView({ dealsByStatus }: { dealsByStatus: (s: DealStatus) => Deal[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {COLUMNS.map(col => {
        const cards = dealsByStatus(col.status);
        return (
          <div key={col.status} className="flex flex-col gap-2">
            {/* Column header */}
            <div className={`flex items-center gap-2 rounded px-3 py-2 text-xs font-semibold ${col.headerColor}`}>
              <span className={`h-2 w-2 rounded-full ${col.dotColor}`} />
              {col.label}
              <span className="ml-auto rounded bg-white/70 px-1.5 py-0.5 font-bold">{cards.length}</span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2 min-h-[4rem]">
              {cards.length === 0 && (
                <div className="rounded border-2 border-dashed border-gray-200 py-6 text-center text-xs text-gray-400">
                  No deals
                </div>
              )}
              {cards.map(deal => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DealCard({ deal }: { deal: Deal }) {
  const assigned = deal.assignedUserId ? getStaffById(deal.assignedUserId) : undefined;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:border-gray-300 hover:shadow transition-all">
      <div className="flex items-start justify-between gap-2 mb-2">
        <PriorityBadge priority={deal.priority} />
        <span className="text-sm" title={deal.channel}>{CHANNEL_ICONS[deal.channel] ?? '—'}</span>
      </div>

      {deal.company?.name && (
        <Link href={`/customers/${deal.companyId}`} className="text-xs font-semibold text-brand-red hover:underline block mb-1">
          {deal.company.name}
        </Link>
      )}

      <Link href={`/deals/${deal.id}`} className="block">
        <p className="text-sm text-brand-dark leading-snug hover:text-brand-red transition-colors">{deal.subject}</p>
      </Link>

      {deal.vehicleRef && (
        <p className="mt-1.5 text-xs text-gray-400">{deal.vehicleRef}</p>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-400">{new Date(deal.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
        {assigned && <Avatar initials={assigned.initials} color={assigned.color} size="sm" title={assigned.name} />}
      </div>
    </div>
  );
}

// ─── List view ────────────────────────────────────────────────────────────────

function ListView({ deals }: { deals: Deal[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-100 text-sm">
        <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
          <tr>
            <th className="py-3 pl-4 pr-3 text-left">Reference</th>
            <th className="px-3 py-3 text-left">Subject</th>
            <th className="px-3 py-3 text-left">Company</th>
            <th className="px-3 py-3 text-left">Status</th>
            <th className="px-3 py-3 text-left">Priority</th>
            <th className="px-3 py-3 text-left">Channel</th>
            <th className="px-3 py-3 text-left">Assigned</th>
            <th className="px-3 py-3 text-left">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {deals.map(d => {
            const assigned = d.assignedUserId ? getStaffById(d.assignedUserId) : undefined;
            const col = COLUMNS.find(c => c.status === d.status);
            return (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="py-3 pl-4 pr-3 font-mono text-xs text-gray-400">{d.id}</td>
                <td className="px-3 py-3 max-w-xs truncate">
                  <Link href={`/deals/${d.id}`} className="text-brand-dark hover:text-brand-red transition-colors">
                    {d.subject}
                  </Link>
                </td>
                <td className="px-3 py-3">
                  {d.company ? (
                    <Link href={`/customers/${d.companyId}`} className="text-brand-red hover:underline">
                      {d.company.name}
                    </Link>
                  ) : '—'}
                </td>
                <td className="px-3 py-3">
                  <span className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium ${col?.headerColor ?? ''}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${col?.dotColor ?? 'bg-gray-400'}`} />
                    {col?.label ?? d.status}
                  </span>
                </td>
                <td className="px-3 py-3"><PriorityBadge priority={d.priority} /></td>
                <td className="px-3 py-3 text-gray-500">
                  {CHANNEL_ICONS[d.channel] ?? ''} {d.channel}
                </td>
                <td className="px-3 py-3">
                  {assigned ? <Avatar initials={assigned.initials} color={assigned.color} size="sm" title={assigned.name} /> : '—'}
                </td>
                <td className="px-3 py-3 text-gray-500">{formatDate(d.createdAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
