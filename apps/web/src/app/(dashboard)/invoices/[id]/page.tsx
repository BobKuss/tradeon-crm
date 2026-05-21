'use client';

import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import { apiGetInvoice, apiSubmitVeriFactu } from '@/lib/api';
import type { EstadoVeriFactu, Invoice, InvoiceStatus, TipoFactura } from '@/lib/types';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageSpinner } from '@/components/ui/Spinner';

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmt(n: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(n);
}
function fmtDate(s: string | null | undefined): string {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtDateTime(s: string | null | undefined): string {
  if (!s) return '—';
  return new Date(s).toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ─── Label maps ───────────────────────────────────────────────────────────────

const TIPO_LABELS: Record<TipoFactura, string> = {
  F1: 'F1 – Factura completa',
  F2: 'F2 – Factura simplificada',
  R1: 'R1 – Rectificativa (error en derecho)',
  R2: 'R2 – Rectificativa (art. 80.2)',
  R3: 'R3 – Rectificativa (art. 80.3)',
  R4: 'R4 – Rectificativa (art. 80.4)',
  R5: 'R5 – Rectificativa (sin sustitución)',
};

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  issued: 'Emitida', paid: 'Pagada', overdue: 'Vencida', disputed: 'Disputada',
};
const STATUS_STYLES: Record<InvoiceStatus, string> = {
  issued:   'bg-blue-50 text-blue-700 border border-blue-200',
  paid:     'bg-green-50 text-green-700 border border-green-200',
  overdue:  'bg-red-50 text-red-700 border border-red-200',
  disputed: 'bg-orange-50 text-orange-700 border border-orange-200',
};

const VF_LABELS: Record<EstadoVeriFactu, string> = {
  pendiente: 'Pendiente de envío',
  enviada:   'Enviada a AEAT',
  aceptada:  'Aceptada por AEAT',
  rechazada: 'Rechazada por AEAT',
  error:     'Error técnico',
};
const VF_STYLES: Record<EstadoVeriFactu, string> = {
  pendiente: 'bg-gray-100 text-gray-700 border border-gray-200',
  enviada:   'bg-blue-50 text-blue-700 border border-blue-200',
  aceptada:  'bg-emerald-50 text-emerald-700 border border-emerald-200',
  rechazada: 'bg-red-50 text-red-700 border border-red-200',
  error:     'bg-orange-50 text-orange-700 border border-orange-200',
};
const VF_DOT: Record<EstadoVeriFactu, string> = {
  pendiente: 'bg-gray-400', enviada: 'bg-blue-500', aceptada: 'bg-emerald-500',
  rechazada: 'bg-red-500',  error: 'bg-orange-500',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const [inv,       setInv]       = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg,  setSubmitMsg]  = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      setInv(await apiGetInvoice(params.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar la factura');
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit() {
    if (!inv) return;
    setSubmitting(true);
    setSubmitMsg('');
    try {
      const updated = await apiSubmitVeriFactu(inv.id);
      setInv(updated);
      setSubmitMsg(updated.estadoVeriFactu === 'aceptada'
        ? `Aceptada. CSV: ${updated.csvAeat}`
        : `Estado: ${updated.estadoVeriFactu}`);
    } catch (e) {
      setSubmitMsg(e instanceof Error ? e.message : 'Error al enviar');
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) return <PageSpinner />;
  if (error || !inv) return <ErrorState message={error || 'Factura no encontrada'} onRetry={load} />;

  const canSubmit = inv.estadoVeriFactu === 'pendiente' || inv.estadoVeriFactu === 'rechazada' || inv.estadoVeriFactu === 'error';
  const aeatUrl   = inv.csvAeat
    ? `https://www2.agenciatributaria.gob.es/wlpl/AVDT-SVDT/FacturaVeri?csv=${inv.csvAeat}`
    : null;

  return (
    <div className="space-y-5 max-w-4xl">

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <Link href="/invoices" className="hover:text-brand-red">Facturas</Link>
        <span>/</span>
        <span className="font-mono text-gray-600">{inv.id}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-brand-dark font-mono">{inv.id}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{inv.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[inv.status]}`}>
              {STATUS_LABELS[inv.status]}
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-500">{TIPO_LABELS[inv.tipoFactura]}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-brand-dark tabular-nums">
            {fmt(Number(inv.amount), inv.currency)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Base {fmt(Number(inv.baseImponible), inv.currency)} + {inv.tipoIVA}% IVA {fmt(Number(inv.cuotaIVA), inv.currency)}
          </p>
        </div>
      </div>

      {/* VeriFactu status card */}
      <div className={`rounded-xl border-2 p-5 ${inv.estadoVeriFactu === 'aceptada' ? 'border-emerald-200 bg-emerald-50' : inv.estadoVeriFactu === 'rechazada' ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${VF_DOT[inv.estadoVeriFactu]}`} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Estado VeriFactu</p>
              <p className={`mt-0.5 font-semibold text-sm ${VF_STYLES[inv.estadoVeriFactu].split(' ')[1]}`}>
                {VF_LABELS[inv.estadoVeriFactu]}
              </p>
            </div>
          </div>
          {canSubmit && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-md bg-brand-red px-4 py-2 text-xs font-semibold text-white hover:bg-brand-red/90 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Enviando…' : 'Enviar a AEAT'}
            </button>
          )}
          {aeatUrl && (
            <a
              href={aeatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-emerald-300 bg-white px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
            >
              Verificar en AEAT →
            </a>
          )}
        </div>

        {submitMsg && (
          <p className="mt-3 text-xs text-gray-700 bg-white rounded-md border border-gray-200 px-3 py-2">
            {submitMsg}
          </p>
        )}

        {/* VeriFactu fields */}
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-xs sm:grid-cols-3">
          <Field label="CSV AEAT"       value={inv.csvAeat ?? '—'} mono />
          <Field label="Fecha envío"    value={fmtDateTime(inv.fechaEnvioAeat)} />
          <Field label="Serie / Número" value={`${inv.serie} / ${inv.numero}`} mono />
          <Field label="Huella SHA-256" value={inv.huella ? inv.huella.slice(0, 16) + '…' : '—'} mono title={inv.huella ?? ''} />
          <Field label="Huella anterior" value={inv.huellaAnterior ? inv.huellaAnterior.slice(0, 16) + '…' : '—'} mono title={inv.huellaAnterior ?? ''} />
        </div>

        {/* Respuesta AEAT si hay error */}
        {inv.respuestaAeat && (inv.estadoVeriFactu === 'rechazada' || inv.estadoVeriFactu === 'error') && (
          <div className="mt-3 rounded-md border border-red-200 bg-white p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-red-600 mb-1">Respuesta AEAT</p>
            <pre className="text-xs text-red-700 whitespace-pre-wrap font-mono">
              {JSON.stringify(inv.respuestaAeat, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Two-column detail */}
      <div className="grid gap-4 sm:grid-cols-2">

        {/* Emisor */}
        <Section title="Emisor">
          <Field label="NIF"         value={inv.nifEmisor}    mono />
          <Field label="Razón social" value={inv.nombreEmisor} />
        </Section>

        {/* Destinatario */}
        <Section title="Destinatario">
          <Field label="NIF"         value={inv.nifDestinatario    ?? '—'} mono />
          <Field label="Razón social" value={inv.nombreDestinatario ?? '—'} />
          {inv.company && (
            <Field label="Cliente CRM" value={
              <Link href={`/customers/${inv.company.id}`} className="text-brand-red hover:underline">
                {inv.company.name}
              </Link>
            } />
          )}
        </Section>

        {/* Importes */}
        <Section title="Importes">
          <Field label="Base imponible" value={fmt(Number(inv.baseImponible), inv.currency)} mono />
          <Field label={`Cuota IVA (${inv.tipoIVA}%)`} value={fmt(Number(inv.cuotaIVA), inv.currency)} mono />
          <Field label="Total"          value={fmt(Number(inv.amount), inv.currency)} mono />
          <Field label="Moneda"         value={inv.currency} mono />
        </Section>

        {/* Fechas */}
        <Section title="Fechas">
          <Field label="Fecha de emisión"    value={fmtDate(inv.issuedAt)} />
          <Field label="Fecha de vencimiento" value={fmtDate(inv.dueAt)} />
          <Field label="Fecha de pago"        value={fmtDate(inv.paidAt)} />
          {inv.deal && (
            <Field label="Deal asociado" value={
              <Link href={`/deals/${inv.deal.id}`} className="text-brand-red hover:underline">
                {inv.deal.subject}
              </Link>
            } />
          )}
        </Section>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Field({
  label, value, mono, title,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  title?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-2 text-xs">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span
        className={`text-right text-gray-800 ${mono ? 'font-mono' : ''} truncate`}
        title={title}
      >
        {value}
      </span>
    </div>
  );
}
