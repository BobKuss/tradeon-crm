import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { EstadoVeriFactu, InvoiceStatus, TipoFactura } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto, QueryInvoicesDto, UpdateInvoiceDto } from './dto/invoice.dto';

// NIF y razón social del emisor (TradEon) — en producción vendrían de configuración
const EMISOR_NIF    = 'B-12345678';
const EMISOR_NOMBRE = 'TradEon Europe SL';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Listado ───────────────────────────────────────────────────────────────

  async findAll(query: QueryInvoicesDto) {
    const page  = Number(query.page  ?? 1);
    const limit = Number(query.limit ?? 25);
    const skip  = (page - 1) * limit;

    const where = {
      ...(query.companyId       ? { companyId:       query.companyId }                                   : {}),
      ...(query.status          ? { status:          query.status as InvoiceStatus }                      : {}),
      ...(query.estadoVeriFactu ? { estadoVeriFactu: query.estadoVeriFactu as EstadoVeriFactu }           : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { issuedAt: 'desc' },
        include: {
          company: { select: { id: true, name: true, country: true } },
          deal:    { select: { id: true, subject: true } },
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─── Detalle ───────────────────────────────────────────────────────────────

  async findOne(id: string) {
    const inv = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        company: { select: { id: true, name: true, country: true, city: true } },
        deal:    { select: { id: true, subject: true, status: true } },
      },
    });
    if (!inv) throw new NotFoundException(`Invoice ${id} not found`);
    return inv;
  }

  // ─── Creación ──────────────────────────────────────────────────────────────

  async create(dto: CreateInvoiceDto) {
    const serie       = dto.serie ?? 'A';
    const tipoFactura = (dto.tipoFactura ?? 'F1') as TipoFactura;
    const tipoIVA     = dto.tipoIVA;
    const baseImponible = dto.baseImponible;
    const cuotaIVA    = Math.round(baseImponible * tipoIVA) / 100;
    const amount      = baseImponible + cuotaIVA;

    // Próximo número de serie
    const last = await this.prisma.invoice.findFirst({
      where:   { serie },
      orderBy: { numero: 'desc' },
      select:  { numero: true },
    });
    const numero = (last?.numero ?? 0) + 1;

    // ID legible: SERIE-YEAR-NUMERO
    const year = new Date(dto.issuedAt).getFullYear();
    const id   = `INV-${serie}-${year}-${String(numero).padStart(4, '0')}`;

    // Huella anterior (última de la misma serie)
    const prevInv = await this.prisma.invoice.findFirst({
      where:   { serie },
      orderBy: { numero: 'desc' },
      select:  { huella: true },
    });
    const huellaAnterior =
      prevInv?.huella ?? '0000000000000000000000000000000000000000000000000000000000000000';

    // Compute SHA-256 huella
    const huella = this.computeHuella({
      nifEmisor:    EMISOR_NIF,
      serie,
      numero,
      fechaExpedicion: dto.issuedAt.slice(0, 10).replace(/-/g, ''),
      tipoFactura,
      cuotaIVA,
      importeTotal: amount,
      huellaAnterior,
    });

    return this.prisma.invoice.create({
      data: {
        id,
        companyId:          dto.companyId,
        dealId:             dto.dealId ?? null,
        description:        dto.description,
        amount,
        currency:           (dto.currency ?? 'EUR') as any,
        status:             'issued',
        issuedAt:           new Date(dto.issuedAt),
        dueAt:              new Date(dto.dueAt),
        serie,
        numero,
        tipoFactura,
        baseImponible,
        tipoIVA,
        cuotaIVA,
        nifEmisor:          EMISOR_NIF,
        nombreEmisor:       EMISOR_NOMBRE,
        nifDestinatario:    dto.nifDestinatario  ?? null,
        nombreDestinatario: dto.nombreDestinatario ?? null,
        huella,
        huellaAnterior,
        estadoVeriFactu:    'pendiente',
      },
      include: {
        company: { select: { id: true, name: true } },
        deal:    { select: { id: true, subject: true } },
      },
    });
  }

  // ─── Actualización ────────────────────────────────────────────────────────

  async update(id: string, dto: UpdateInvoiceDto) {
    await this.findOne(id);
    return this.prisma.invoice.update({
      where: { id },
      data: {
        ...(dto.status    ? { status: dto.status as InvoiceStatus }         : {}),
        ...(dto.paidAt    ? { paidAt: new Date(dto.paidAt) }                : {}),
        ...(dto.description ? { description: dto.description }              : {}),
      },
    });
  }

  // ─── Envío a AEAT (simulado) ──────────────────────────────────────────────

  async submitToAeat(id: string) {
    const inv = await this.findOne(id);

    if (inv.estadoVeriFactu === 'aceptada') {
      throw new BadRequestException('La factura ya está aceptada por AEAT');
    }

    // Simulación: rechazamos facturas con NIF extranjero no identificable
    const nif = inv.nifDestinatario ?? '';
    const esRechazada = nif.startsWith('FR40') || nif === '';

    if (esRechazada) {
      const respuesta = {
        codigoError: '1105',
        descripcionError: 'NIF del destinatario no identificado en el censo de la AEAT',
        timestamp: new Date().toISOString(),
      };
      return this.prisma.invoice.update({
        where: { id },
        data: {
          estadoVeriFactu: 'rechazada',
          fechaEnvioAeat:  new Date(),
          respuestaAeat:   respuesta as any,
        },
      });
    }

    // Aceptación: generar CSV simulado
    const csv = `CSV-${inv.serie}${inv.numero}-${new Date().getFullYear()}-${this.randomAlphaNum(7)}`;
    const respuesta = {
      codigoRespuesta: '0000',
      descripcionRespuesta: 'Registro aceptado correctamente',
      csv,
      timestamp: new Date().toISOString(),
    };

    return this.prisma.invoice.update({
      where: { id },
      data: {
        estadoVeriFactu: 'aceptada',
        fechaEnvioAeat:  new Date(),
        csvAeat:         csv,
        respuestaAeat:   respuesta as any,
      },
    });
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private computeHuella(fields: {
    nifEmisor:       string;
    serie:           string;
    numero:          number;
    fechaExpedicion: string;
    tipoFactura:     string;
    cuotaIVA:        number;
    importeTotal:    number;
    huellaAnterior:  string;
  }): string {
    const input = [
      fields.nifEmisor,
      `${fields.serie}${fields.numero}`,
      fields.fechaExpedicion,
      fields.tipoFactura,
      fields.cuotaIVA.toFixed(2),
      fields.importeTotal.toFixed(2),
      fields.huellaAnterior,
    ].join('|');

    return createHash('sha256').update(input, 'utf8').digest('hex');
  }

  private randomAlphaNum(len: number): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  // ─── URL pública de verificación AEAT (enlace real de la AEAT) ────────────

  getUrlVerificacion(csv: string): string {
    return `https://www2.agenciatributaria.gob.es/wlpl/AVDT-SVDT/FacturaVeri?csv=${csv}`;
  }
}
