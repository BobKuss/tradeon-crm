'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CreateVehiclePayload, Vehicle, VehicleStatus } from '@/lib/types';

// ─── Field options ────────────────────────────────────────────────────────────

const FUEL_OPTIONS = [
  { value: 'petrol',   label: 'Petrol' },
  { value: 'diesel',   label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid',   label: 'Hybrid' },
  { value: 'phev',     label: 'PHEV (Plug-in Hybrid)' },
  { value: 'lpg',      label: 'LPG' },
  { value: 'other',    label: 'Other' },
];

const TRANSMISSION_OPTIONS = [
  { value: 'manual',        label: 'Manual' },
  { value: 'automatic',     label: 'Automatic' },
  { value: 'semi_automatic', label: 'Semi-automatic' },
];

const STATUS_OPTIONS: Array<{ value: VehicleStatus; label: string }> = [
  { value: 'draft',     label: 'Draft' },
  { value: 'available', label: 'Available' },
  { value: 'reserved',  label: 'Reserved' },
  { value: 'sold',      label: 'Sold' },
  { value: 'archived',  label: 'Archived' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  initial?: Partial<Vehicle>;
  onSubmit: (payload: CreateVehiclePayload) => Promise<void>;
  submitLabel: string;
}

// ─── Input helpers ────────────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-medium text-gray-600">
      {children}{required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red disabled:bg-gray-50 ${props.className ?? ''}`}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red ${props.className ?? ''}`}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={4}
      {...props}
      className={`mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red resize-none ${props.className ?? ''}`}
    />
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────

export function VehicleForm({ initial, onSubmit, submitLabel }: Props) {
  const router = useRouter();

  const [values, setValues] = useState<CreateVehiclePayload>({
    stockNumber:  initial?.stockNumber  ?? '',
    vin:          initial?.vin          ?? '',
    make:         initial?.make         ?? '',
    model:        initial?.model        ?? '',
    variant:      initial?.variant      ?? '',
    year:         initial?.year         ?? new Date().getFullYear(),
    mileage:      initial?.mileage      ?? 0,
    fuelType:     initial?.fuelType     ?? 'diesel',
    transmission: initial?.transmission ?? 'automatic',
    color:        initial?.color        ?? '',
    price:        initial?.price        ?? 0,
    currency:     initial?.currency     ?? 'EUR',
    status:       initial?.status       ?? 'draft',
    location:     initial?.location     ?? '',
    description:  initial?.description  ?? '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error,    setError]    = useState('');

  function set<K extends keyof CreateVehiclePayload>(key: K, value: CreateVehiclePayload[K]) {
    setValues(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save vehicle');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Identity */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Identity</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label required>Stock number</Label>
            <Input
              required
              value={values.stockNumber}
              onChange={e => set('stockNumber', e.target.value)}
              placeholder="STO-2024-001"
            />
          </div>
          <div>
            <Label>VIN</Label>
            <Input
              value={values.vin ?? ''}
              onChange={e => set('vin', e.target.value || undefined)}
              placeholder="Optional"
            />
          </div>
          <div>
            <Label required>Status</Label>
            <Select
              required
              value={values.status}
              onChange={e => set('status', e.target.value as VehicleStatus)}
            >
              {STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Vehicle details */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Vehicle details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label required>Make</Label>
            <Input
              required
              value={values.make}
              onChange={e => set('make', e.target.value)}
              placeholder="BMW"
            />
          </div>
          <div>
            <Label required>Model</Label>
            <Input
              required
              value={values.model}
              onChange={e => set('model', e.target.value)}
              placeholder="5 Series"
            />
          </div>
          <div>
            <Label>Variant</Label>
            <Input
              value={values.variant ?? ''}
              onChange={e => set('variant', e.target.value || undefined)}
              placeholder="520d xDrive"
            />
          </div>
          <div>
            <Label required>Year</Label>
            <Input
              required
              type="number"
              min={1900}
              max={2100}
              value={values.year}
              onChange={e => set('year', parseInt(e.target.value, 10))}
            />
          </div>
          <div>
            <Label required>Mileage (km)</Label>
            <Input
              required
              type="number"
              min={0}
              value={values.mileage}
              onChange={e => set('mileage', parseInt(e.target.value, 10))}
            />
          </div>
          <div>
            <Label required>Color</Label>
            <Input
              required
              value={values.color}
              onChange={e => set('color', e.target.value)}
              placeholder="Alpine White"
            />
          </div>
          <div>
            <Label required>Fuel type</Label>
            <Select
              required
              value={values.fuelType}
              onChange={e => set('fuelType', e.target.value as CreateVehiclePayload['fuelType'])}
            >
              {FUEL_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label required>Transmission</Label>
            <Select
              required
              value={values.transmission}
              onChange={e => set('transmission', e.target.value as CreateVehiclePayload['transmission'])}
            >
              {TRANSMISSION_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label required>Location</Label>
            <Input
              required
              value={values.location}
              onChange={e => set('location', e.target.value)}
              placeholder="Madrid Depot"
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Pricing</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label required>Price</Label>
            <Input
              required
              type="number"
              min={0}
              step={100}
              value={values.price}
              onChange={e => set('price', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <Label required>Currency</Label>
            <Select
              required
              value={values.currency}
              onChange={e => set('currency', e.target.value)}
            >
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — British Pound</option>
              <option value="SEK">SEK — Swedish Krona</option>
              <option value="PLN">PLN — Polish Zloty</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Description</h2>
        <Textarea
          value={values.description ?? ''}
          onChange={e => set('description', e.target.value || undefined)}
          placeholder="Features, condition, service history…"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-brand-red px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
        >
          {isSaving ? 'Saving…' : submitLabel}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-200 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
