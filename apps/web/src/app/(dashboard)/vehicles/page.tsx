'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGetVehicles, apiChangeVehicleStatus } from '@/lib/api';
import type { Vehicle, VehicleStatus } from '@/lib/types';
import { PageSpinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat('en-EU', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price);
}

function formatMileage(km: number) {
  return new Intl.NumberFormat('en-EU').format(km) + ' km';
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<VehicleStatus, string> = {
  draft:     'bg-gray-100 text-gray-600',
  available: 'bg-green-100 text-green-700',
  reserved:  'bg-amber-100 text-amber-700',
  sold:      'bg-blue-100 text-blue-700',
  archived:  'bg-red-50 text-red-500',
};

function StatusBadge({ status }: { status: VehicleStatus }) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

// ─── Fuel badge ───────────────────────────────────────────────────────────────

const FUEL_LABEL: Record<string, string> = {
  petrol: 'Petrol', diesel: 'Diesel', electric: 'Electric',
  hybrid: 'Hybrid', phev: 'PHEV', lpg: 'LPG', other: 'Other',
};

// ─── Filter bar ───────────────────────────────────────────────────────────────

const STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: 'all',       label: 'All' },
  { value: 'available', label: 'Available' },
  { value: 'reserved',  label: 'Reserved' },
  { value: 'sold',      label: 'Sold' },
  { value: 'draft',     label: 'Draft' },
  { value: 'archived',  label: 'Archived' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VehiclesPage() {
  const [vehicles,  setVehicles]  = useState<Vehicle[]>([]);
  const [total,     setTotal]     = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState('');
  const [search,    setSearch]    = useState('');
  const [status,    setStatus]    = useState('all');
  const [page,      setPage]      = useState(1);

  const LIMIT = 25;

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await apiGetVehicles({
        search: search || undefined,
        status: status !== 'all' ? status as VehicleStatus : undefined,
        page,
        limit: LIMIT,
      });
      setVehicles(res.data);
      setTotal(res.meta.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vehicles');
    } finally {
      setIsLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => { load(); }, [load]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, status]);

  async function handleArchive(vehicle: Vehicle) {
    if (!confirm(`Archive "${vehicle.make} ${vehicle.model}" (${vehicle.stockNumber})?`)) return;
    try {
      await apiChangeVehicleStatus(vehicle.id, 'archived');
      load();
    } catch {
      alert('Failed to archive vehicle');
    }
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-brand-dark">Vehicle Inventory</h1>
          <p className="text-sm text-gray-400">Manage stock — create, edit, and track vehicle status.</p>
        </div>
        <Link
          href="/vehicles/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-brand-red px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add vehicle
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search by stock no., make or model…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="h-9 w-72 rounded border border-gray-300 px-3 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
        />
        <div className="flex gap-1">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                status === f.value
                  ? 'bg-brand-red text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-gray-400">{total} vehicles</span>
      </div>

      {/* Content */}
      {isLoading ? (
        <PageSpinner />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : vehicles.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-gray-400">
          <p>No vehicles found.</p>
          {status === 'all' && !search && (
            <Link href="/vehicles/new" className="text-brand-red hover:underline text-xs">
              Add the first vehicle →
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="py-3 pl-4 pr-3 text-left">Stock #</th>
                  <th className="px-3 py-3 text-left">Vehicle</th>
                  <th className="px-3 py-3 text-left">Year</th>
                  <th className="px-3 py-3 text-left">Fuel</th>
                  <th className="px-3 py-3 text-right">Mileage</th>
                  <th className="px-3 py-3 text-right">Price</th>
                  <th className="px-3 py-3 text-left">Location</th>
                  <th className="px-3 py-3 text-left">Status</th>
                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vehicles.map(v => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="py-3 pl-4 pr-3 font-mono text-xs text-gray-500">{v.stockNumber}</td>
                    <td className="px-3 py-3">
                      <Link
                        href={`/vehicles/${v.id}`}
                        className="font-medium text-brand-dark hover:text-brand-red hover:underline"
                      >
                        {v.make} {v.model}
                      </Link>
                      {v.variant && <span className="ml-1 text-xs text-gray-400">{v.variant}</span>}
                    </td>
                    <td className="px-3 py-3 text-gray-600">{v.year}</td>
                    <td className="px-3 py-3 text-gray-600">{FUEL_LABEL[v.fuelType] ?? v.fuelType}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-gray-600">{formatMileage(v.mileage)}</td>
                    <td className="px-3 py-3 text-right tabular-nums font-medium text-gray-800">{formatPrice(v.price, v.currency)}</td>
                    <td className="px-3 py-3 text-gray-500 text-xs">{v.location}</td>
                    <td className="px-3 py-3"><StatusBadge status={v.status} /></td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/vehicles/${v.id}/edit`}
                          className="text-xs text-gray-500 hover:text-brand-red"
                        >
                          Edit
                        </Link>
                        {v.status !== 'archived' && (
                          <button
                            onClick={() => handleArchive(v)}
                            className="text-xs text-gray-400 hover:text-red-500"
                          >
                            Archive
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded border border-gray-200 px-3 py-1 text-xs hover:bg-gray-50 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded border border-gray-200 px-3 py-1 text-xs hover:bg-gray-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
