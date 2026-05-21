'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGetCompanies } from '@/lib/api';
import { getStaffById } from '@/lib/mock-data';
import type { Company } from '@/lib/types';
import { CompanyStatusBadge, SegmentBadge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { Avatar } from '@/components/ui/Avatar';

const STATUS_OPTIONS = ['all', 'active', 'inactive', 'prospect'] as const;

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

function formatDate(s?: string) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function CustomersPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [status, setStatus]       = useState('all');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await apiGetCompanies({ search: search || undefined, status: status !== 'all' ? status : undefined });
      setCompanies(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  }, [search, status]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search by name or country…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="h-9 w-64 rounded border border-gray-300 px-3 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
        />
        <div className="flex gap-1">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                status === s
                  ? 'bg-brand-red text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-gray-400">{companies.length} companies</span>
      </div>

      {/* Content */}
      {isLoading ? (
        <PageSpinner />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : companies.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-sm text-gray-400">No companies found.</div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="py-3 pl-4 pr-3 text-left">Company</th>
                <th className="px-3 py-3 text-left">Location</th>
                <th className="px-3 py-3 text-left">Segment</th>
                <th className="px-3 py-3 text-left">Status</th>
                <th className="px-3 py-3 text-right">Credit Limit</th>
                <th className="px-3 py-3 text-right">Balance</th>
                <th className="px-3 py-3 text-left">Assigned</th>
                <th className="px-3 py-3 text-left">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {companies.map(c => {
                const assigned = c.assignedUserId ? getStaffById(c.assignedUserId) : undefined;
                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="py-3 pl-4 pr-3 font-medium text-brand-dark">
                      <Link href={`/customers/${c.id}`} className="hover:text-brand-red hover:underline">
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-gray-600">
                      {c.city ? `${c.city}, ` : ''}{c.country}
                    </td>
                    <td className="px-3 py-3">
                      <SegmentBadge segment={c.segment} />
                    </td>
                    <td className="px-3 py-3">
                      <CompanyStatusBadge status={c.status} />
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-gray-700">
                      {formatCurrency(c.creditLimit)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-gray-700">
                      {formatCurrency(c.balance)}
                    </td>
                    <td className="px-3 py-3">
                      {assigned ? (
                        <Avatar initials={assigned.initials} color={assigned.color} size="sm" title={assigned.name} />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-gray-500">
                      {formatDate(c.lastActivityAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
