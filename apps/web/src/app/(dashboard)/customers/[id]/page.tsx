'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { apiGetCompany } from '@/lib/api';
import { getStaffById } from '@/lib/mock-data';
import type { Company, Contact, Deal } from '@/lib/types';
import { CompanyStatusBadge, DealStatusBadge, PriorityBadge, SegmentBadge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { Avatar } from '@/components/ui/Avatar';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

function formatDate(s?: string) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

interface PageData extends Company {
  contacts: Contact[];
  deals: Deal[];
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData]       = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    setIsLoading(true);
    setError('');
    apiGetCompany(id)
      .then(setData)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load company'))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <PageSpinner />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  const assigned = data.assignedUserId ? getStaffById(data.assignedUserId) : undefined;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/customers" className="hover:text-brand-red">Customers</Link>
        <span>/</span>
        <span className="text-brand-dark font-medium">{data.name}</span>
      </nav>

      {/* Company header */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-brand-dark">{data.name}</h2>
              <CompanyStatusBadge status={data.status} />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {data.city ? `${data.city}, ` : ''}{data.country}
            </p>
          </div>
          {assigned && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-gray-400">Account manager</span>
              <Avatar initials={assigned.initials} color={assigned.color} size="sm" />
              <span>{assigned.name}</span>
            </div>
          )}
        </div>

        {/* KPI row */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Segment">
            <SegmentBadge segment={data.segment} />
          </Stat>
          <Stat label="Credit Limit">
            <span className="font-semibold tabular-nums">{formatCurrency(data.creditLimit)}</span>
          </Stat>
          <Stat label="Open Balance">
            <span className={`font-semibold tabular-nums ${data.balance > 0 ? 'text-amber-600' : 'text-gray-700'}`}>
              {formatCurrency(data.balance)}
            </span>
          </Stat>
          <Stat label="Last Activity">
            <span>{formatDate(data.lastActivityAt)}</span>
          </Stat>
        </div>
      </div>

      {/* Contacts */}
      <Section title="Contacts" count={data.contacts.length}>
        {data.contacts.length === 0 ? (
          <EmptyRow>No contacts on file.</EmptyRow>
        ) : (
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="py-2.5 pl-4 pr-3 text-left">Name</th>
                <th className="px-3 py-2.5 text-left">Role</th>
                <th className="px-3 py-2.5 text-left">Email</th>
                <th className="px-3 py-2.5 text-left">Phone</th>
                <th className="px-3 py-2.5 text-left">Primary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.contacts.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="py-2.5 pl-4 pr-3 font-medium text-brand-dark">{c.name}</td>
                  <td className="px-3 py-2.5 text-gray-500">{c.role ?? '—'}</td>
                  <td className="px-3 py-2.5">
                    <a href={`mailto:${c.email}`} className="text-brand-red hover:underline">{c.email}</a>
                  </td>
                  <td className="px-3 py-2.5 text-gray-500">{c.phone ?? '—'}</td>
                  <td className="px-3 py-2.5">
                    {c.isPrimary && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Primary
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      {/* Recent deals */}
      <Section title="Deals" count={data.deals.length}>
        {data.deals.length === 0 ? (
          <EmptyRow>No deals yet.</EmptyRow>
        ) : (
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="py-2.5 pl-4 pr-3 text-left">Reference</th>
                <th className="px-3 py-2.5 text-left">Subject</th>
                <th className="px-3 py-2.5 text-left">Status</th>
                <th className="px-3 py-2.5 text-left">Priority</th>
                <th className="px-3 py-2.5 text-left">Vehicle</th>
                <th className="px-3 py-2.5 text-left">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.deals.map(d => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="py-2.5 pl-4 pr-3 font-mono text-xs text-gray-500">{d.id}</td>
                  <td className="px-3 py-2.5 text-brand-dark">{d.subject}</td>
                  <td className="px-3 py-2.5"><DealStatusBadge status={d.status} /></td>
                  <td className="px-3 py-2.5"><PriorityBadge priority={d.priority} /></td>
                  <td className="px-3 py-2.5 text-gray-500">{d.vehicleRef || '—'}</td>
                  <td className="px-3 py-2.5 text-gray-500">{formatDate(d.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>
    </div>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded border border-gray-100 bg-gray-50 px-4 py-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <div className="text-sm text-brand-dark">{children}</div>
    </div>
  );
}

function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
        <h3 className="text-sm font-semibold text-brand-dark">{title}</h3>
        {count !== undefined && (
          <span className="text-xs text-gray-400">{count}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function EmptyRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 py-8 text-center text-sm text-gray-400">{children}</div>
  );
}
