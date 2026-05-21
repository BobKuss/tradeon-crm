'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { apiGetInvoices } from '@/lib/api';
import type { EstadoVeriFactu, Invoice, InvoiceStatus } from '@/lib/types';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageSpinner } from '@/components/ui/Spinner';

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmt(n: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(n);
}

function fmtDate(s: string): string {
  return new Date(s).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Badges ───────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  issued:   'bg-blue-50 text-blue-700',
  paid:     'bg-green-50 text-green-700',
  overdue:  'bg-red-50 text-red-700',
  disputed: 'bg-orange-50 text-orange-700',
};
const STATUS_LABELS: Record<InvoiceStatus, string> = {
  issued: 'Emitida', paid: 'Pagada', overdue: 'Vencida', disputed: 'Disputada',
};

const VF_STYLES: Record<EstadoVeriFactu, string> = {
  pendiente: 'bg-gray-100 text-gray-600',
  enviada:   'bg-blue-50 text-blue-700',
  aceptada:  'bg-emerald-50 text-emerald-700',
  rechazada: 'bg-red-50 text-red-700',
  error:     'bg-orange-50 text-orange-700',
};
const VF_LABELS: Record<EstadoVeriFactu, string> = {
  pendiente: 'Pendiente', enviada: 'Enviada', aceptada: 'Aceptada', rechazada: 'Rechazada', error: 'Error',
};
const VF_ICONS: Record<EstadoVeriFactu, string> = {
  pendiente: '○', enviada: '↑', aceptada: '✓', rechazada: '✗', error: '!',
};

function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function VeriFactuBadge({ estado }: { estado: EstadoVeriFactu }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${VF_STYLES[estado]}`}>
      <span>{VF_ICONS[estado]}</span>
      {VF_LABELS[estado]}
    </span>
  );
}

// ─── Filters ──────────────────────────────────────────────────────────────────

type StatusFilter   = '' | InvoiceStatus;
type VFFilter       = '' | EstadoVeriFactu;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InvoicesPage() {
  const [invoices,  setInvoices]  = useState<Invoice[]>([]);
  const [total,     setTotal]     = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState('');
  const [statusF,   setStatusF]   = useState<StatusFilter>('');
  const [vfF,       setVfF]       = useState<VFFilter>('');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await apiGetInvoices({
        status:          statusF  || undefined,
        estadoVeriFactu: vfF      || undefined,
        limit: 50,
      });
      setInvoices(res.data);
      setTotal(res.meta.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar facturas');
    } finally {
      setIsLoading(false);
    }
  }, [statusF, vfF]);

  useEffect(() => { load(); }, [load]);

  // KPIs
  const pendientes  = invoices.filter(i => i.estadoVeriFactu === 'pendiente').length;
  const rechazadas  = invoices.filter(i => i.estadoVeriFactu === 'rechazada').length;
  const totalPendCobro = invoices
    .filter(i => i.status === 'issued' || i.status === 'overdue')
    .reduce((s, i) => s + Number(i.amount), 0);

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-dark">Facturas · VeriFactu</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Registro de facturas con trazabilidad AEAT — Reglamento VeriFactu
          </p>
        </div>
        <span className="text-xs text-gray-400">{total} facturas</span>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-3">
        <KpiCard label="Pendientes AEAT"    value={String(pendientes)}              accent={pendientes  > 0 ? 'orange' : 'green'} />
        <KpiCard label="Rechazadas AEAT"    value={String(rechazadas)}              accent={rechazadas  > 0 ? 'red'    : 'green'} />
        <KpiCard label="Pendiente de cobro" value={fmt(totalPendCobro)}             accent="blue" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={statusF}
          onChange={e => setStatusF(e.target.value as StatusFilter)}
          className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-red"
        >
          <option value="">Todos los estados</option>
          <option value="issued">Emitida</option>
          <option value="paid">Pagada</option>
          <option value="overdue">Vencida</option>
          <option value="disputed">Disputada</option>
        </select>
        <select
          value={vfF}
          onChange={e => setVfF(e.target.value as VFFilter)}
          className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-red"
        >
          <option value="">Todos los estados AEAT</option>
          <option value="pendiente">Pendiente</option>
          <option value="enviada">Enviada</option>
          <option value="aceptada">Aceptada</option>
          <option value="rechazada">Rechazada</option>
          <option value="error">Error</option>
        </select>
        {(statusF || vfF) && (
          <button
            onClick={() => { setStatusF(''); setVfF(''); }}
            className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <PageSpinner />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : invoices.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="py-3 pl-4 pr-3 text-left">Factura</th>
                <th className="px-3 py-3 text-left">Cliente</th>
                <th className="px-3 py-3 text-left">Descripción</th>
                <th className="px-3 py-3 text-right">Base</th>
                <th className="px-3 py-3 text-right">IVA %</th>
                <th className="px-3 py-3 text-right">Total</th>
                <th className="px-3 py-3 text-left">Emisión</th>
                <th className="px-3 py-3 text-left">Vencimiento</th>
                <th className="px-3 py-3 text-center">Estado</th>
                <th className="px-3 py-3 text-center">AEAT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map(inv => (
                <InvoiceRow key={inv.id} inv={inv} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, accent }: { label: string; value: string; accent: 'green' | 'orange' | 'red' | 'blue' }) {
  const ring: Record<string, string> = {
    green: 'border-l-green-500', orange: 'border-l-orange-400', red: 'border-l-red-500', blue: 'border-l-blue-500',
  };
  return (
    <div className={`rounded-lg border border-gray-200 border-l-4 bg-white px-4 py-3 ${ring[accent]}`}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-brand-dark">{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-16 text-center">
      <p className="text-sm text-gray-400">No hay facturas con esos filtros</p>
    </div>
  );
}

function InvoiceRow({ inv }: { inv: Invoice }) {
  const isOverdue = inv.status === 'overdue';
  return (
    <tr className="hover:bg-gray-50">
      <td className="py-3 pl-4 pr-3 font-mono text-xs font-medium">
        <Link href={`/invoices/${inv.id}`} className="text-brand-red hover:underline">
          {inv.id}
        </Link>
        <span className="ml-1.5 text-gray-400">{inv.serie}{inv.numero}</span>
      </td>
      <td className="px-3 py-3 text-gray-700">
        {inv.company?.name ?? inv.companyId}
        {inv.nifDestinatario && (
          <span className="ml-1.5 font-mono text-[10px] text-gray-400">{inv.nifDestinatario}</span>
        )}
      </td>
      <td className="px-3 py-3 text-gray-500 max-w-[180px] truncate">{inv.description}</td>
      <td className="px-3 py-3 text-right font-mono tabular-nums text-gray-700 text-xs">
        {fmt(Number(inv.baseImponible), inv.currency)}
      </td>
      <td className="px-3 py-3 text-right font-mono tabular-nums text-gray-500 text-xs">
        {inv.tipoIVA === 0 ? <span className="text-blue-600 font-semibold">0% IC</span> : `${inv.tipoIVA}%`}
      </td>
      <td className="px-3 py-3 text-right font-mono tabular-nums font-semibold text-gray-800 text-xs">
        {fmt(Number(inv.amount), inv.currency)}
      </td>
      <td className="px-3 py-3 text-xs text-gray-500">{fmtDate(inv.issuedAt)}</td>
      <td className={`px-3 py-3 text-xs ${isOverdue ? 'font-semibold text-red-600' : 'text-gray-500'}`}>
        {fmtDate(inv.dueAt)}
      </td>
      <td className="px-3 py-3 text-center">
        <StatusBadge status={inv.status} />
      </td>
      <td className="px-3 py-3 text-center">
        <VeriFactuBadge estado={inv.estadoVeriFactu} />
      </td>
    </tr>
  );
}
