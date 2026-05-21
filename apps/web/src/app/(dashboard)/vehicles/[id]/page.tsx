'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiGetVehicle, apiChangeVehicleStatus } from '@/lib/api';
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

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
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
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium capitalize ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

// ─── Status transition options ────────────────────────────────────────────────

const STATUS_TRANSITIONS: Record<VehicleStatus, VehicleStatus[]> = {
  draft:     ['available'],
  available: ['reserved', 'sold', 'archived'],
  reserved:  ['available', 'sold', 'archived'],
  sold:      [],
  archived:  [],
};

const FUEL_LABEL: Record<string, string> = {
  petrol: 'Petrol', diesel: 'Diesel', electric: 'Electric',
  hybrid: 'Hybrid', phev: 'PHEV', lpg: 'LPG', other: 'Other',
};

const TRANSMISSION_LABEL: Record<string, string> = {
  manual: 'Manual', automatic: 'Automatic', semi_automatic: 'Semi-automatic',
};

// ─── Field helper ─────────────────────────────────────────────────────────────

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-800">{value ?? <span className="text-gray-300">—</span>}</dd>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VehicleDetailPage() {
  const params   = useParams();
  const router   = useRouter();
  const id       = params.id as string;

  const [vehicle,   setVehicle]   = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState('');
  const [changing,  setChanging]  = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setError('');
    apiGetVehicle(id)
      .then(setVehicle)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load vehicle'))
      .finally(() => setIsLoading(false));
  }, [id]);

  async function handleStatusChange(newStatus: VehicleStatus) {
    if (!vehicle) return;
    const verb = newStatus === 'archived' ? 'archive' : `mark as ${newStatus}`;
    if (!confirm(`Are you sure you want to ${verb} this vehicle?`)) return;
    setChanging(true);
    try {
      const updated = await apiChangeVehicleStatus(id, newStatus);
      setVehicle(updated);
    } catch {
      alert('Status change failed. Please try again.');
    } finally {
      setChanging(false);
    }
  }

  if (isLoading) return <PageSpinner />;
  if (error)     return <ErrorState message={error} onRetry={() => router.refresh()} />;
  if (!vehicle)  return null;

  const transitions = STATUS_TRANSITIONS[vehicle.status] ?? [];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/vehicles" className="hover:text-brand-red">Vehicles</Link>
        <span>/</span>
        <span className="text-gray-600">{vehicle.stockNumber}</span>
      </nav>

      {/* Header card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-brand-dark">
                {vehicle.make} {vehicle.model}
              </h1>
              <StatusBadge status={vehicle.status} />
            </div>
            {vehicle.variant && (
              <p className="mt-0.5 text-sm text-gray-500">{vehicle.variant}</p>
            )}
            <p className="mt-1 font-mono text-xs text-gray-400">{vehicle.stockNumber}</p>
          </div>

          <div className="flex items-center gap-2">
            {transitions.map(s => (
              <button
                key={s}
                disabled={changing}
                onClick={() => handleStatusChange(s)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60 ${
                  s === 'archived'
                    ? 'border border-red-200 text-red-500 hover:bg-red-50'
                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {s === 'archived' ? 'Archive' : `Mark ${s}`}
              </button>
            ))}
            <Link
              href={`/vehicles/${id}/edit`}
              className="rounded-md bg-brand-red px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors"
            >
              Edit vehicle
            </Link>
          </div>
        </div>

        {/* Price highlight */}
        <div className="mt-4 border-t border-gray-100 pt-4">
          <span className="text-3xl font-bold text-brand-dark">
            {formatPrice(vehicle.price, vehicle.currency)}
          </span>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main spec */}
        <div className="col-span-2 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Specifications</h2>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
            <Field label="Make"         value={vehicle.make} />
            <Field label="Model"        value={vehicle.model} />
            <Field label="Variant"      value={vehicle.variant} />
            <Field label="Year"         value={vehicle.year} />
            <Field label="Mileage"      value={formatMileage(vehicle.mileage)} />
            <Field label="Fuel type"    value={FUEL_LABEL[vehicle.fuelType] ?? vehicle.fuelType} />
            <Field label="Transmission" value={TRANSMISSION_LABEL[vehicle.transmission] ?? vehicle.transmission} />
            <Field label="Color"        value={vehicle.color} />
            <Field label="Location"     value={vehicle.location} />
          </dl>
        </div>

        {/* Metadata */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Record info</h2>
          <dl className="space-y-4">
            <Field label="VIN"        value={vehicle.vin} />
            <Field label="Stock #"    value={vehicle.stockNumber} />
            <Field label="Currency"   value={vehicle.currency} />
            <Field label="Created"    value={formatDate(vehicle.createdAt)} />
            <Field label="Updated"    value={formatDate(vehicle.updatedAt)} />
          </dl>
        </div>
      </div>

      {/* Description */}
      {vehicle.description && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Description</h2>
          <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{vehicle.description}</p>
        </div>
      )}
    </div>
  );
}
