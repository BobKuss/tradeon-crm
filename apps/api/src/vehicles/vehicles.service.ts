import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import type { Actor } from '../crm/crm.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  ChangeVehicleStatusDto,
  CreateVehicleDto,
  QueryVehicleDto,
  UpdateVehicleDto,
} from './dto/vehicle.dto';

const DEFAULT_PAGE  = 1;
const DEFAULT_LIMIT = 25;

@Injectable()
export class VehiclesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: QueryVehicleDto) {
    const page  = query.page  ?? DEFAULT_PAGE;
    const limit = query.limit ?? DEFAULT_LIMIT;
    const skip  = (page - 1) * limit;

    const where: Prisma.VehicleWhereInput = {};

    if (query.status) where.status = query.status;
    if (query.make)   where.make   = { equals: query.make, mode: 'insensitive' };
    if (query.model)  where.model  = { equals: query.model, mode: 'insensitive' };
    if (query.year)   where.year   = query.year;

    if (query.search) {
      const q = query.search;
      where.OR = [
        { stockNumber: { contains: q, mode: 'insensitive' } },
        { make:        { contains: q, mode: 'insensitive' } },
        { model:       { contains: q, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return vehicle;
  }

  async create(dto: CreateVehicleDto, actor: Actor) {
    const vehicle = await this.prisma.vehicle.create({
      data: {
        stockNumber:  dto.stockNumber,
        vin:          dto.vin,
        make:         dto.make,
        model:        dto.model,
        variant:      dto.variant,
        year:         dto.year,
        mileage:      dto.mileage,
        fuelType:     dto.fuelType,
        transmission: dto.transmission,
        color:        dto.color,
        price:        dto.price,
        currency:     dto.currency ?? 'EUR',
        status:       dto.status   ?? 'draft',
        location:     dto.location,
        description:  dto.description,
      },
    });

    await this.audit.log({
      actorId: actor.id, actorEmail: actor.email,
      action: 'create', entityType: 'vehicle', entityId: vehicle.id,
      metadata: { stockNumber: vehicle.stockNumber, make: vehicle.make, model: vehicle.model },
      ipAddress: actor.ip,
    });

    return vehicle;
  }

  async update(id: string, dto: UpdateVehicleDto, actor: Actor) {
    await this.findOne(id);

    const vehicle = await this.prisma.vehicle.update({
      where: { id },
      data: dto,
    });

    await this.audit.log({
      actorId: actor.id, actorEmail: actor.email,
      action: 'update', entityType: 'vehicle', entityId: id,
      metadata: { changes: dto },
      ipAddress: actor.ip,
    });

    return vehicle;
  }

  async changeStatus(id: string, dto: ChangeVehicleStatusDto, actor: Actor) {
    const existing = await this.findOne(id);

    const vehicle = await this.prisma.vehicle.update({
      where: { id },
      data:  { status: dto.status },
    });

    await this.audit.log({
      actorId: actor.id, actorEmail: actor.email,
      action: 'status_change', entityType: 'vehicle', entityId: id,
      metadata: { from: existing.status, to: dto.status },
      ipAddress: actor.ip,
    });

    return vehicle;
  }
}
