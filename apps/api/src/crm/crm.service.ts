import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import { CreateContactDto, UpdateContactDto } from './dto/contact.dto';
import { ChangeDealStatusDto, CreateDealDto, LinkVehicleDto, UpdateDealDto } from './dto/deal.dto';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

// Minimal actor shape passed from the controller
export interface Actor {
  id: string;
  email: string;
  role: Role;
  ip?: string;
}

@Injectable()
export class CrmService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ─── Companies ───────────────────────────────────────────────────────────────

  findAllCompanies() {
    return this.prisma.customerCompany.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      select: {
        id: true, name: true, country: true, city: true,
        status: true, segment: true, creditLimit: true, balance: true,
        lastActivityAt: true, createdAt: true,
        assignedUser: { select: { id: true, name: true } },
      },
    });
  }

  findOneCompany(id: string) {
    return this.prisma.customerCompany.findFirst({
      where: { id, deletedAt: null },
      include: {
        contacts:     { where: { deletedAt: null } },
        assignedUser: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async createCompany(dto: CreateCompanyDto, actor: Actor) {
    const company = await this.prisma.customerCompany.create({
      data: {
        name:           dto.name,
        country:        dto.country,
        city:           dto.city,
        status:         dto.status,
        segment:        dto.segment,
        creditLimit:    dto.creditLimit ?? 0,
        assignedUserId: dto.assignedUserId,
      },
    });
    await this.audit.log({
      actorId: actor.id, actorEmail: actor.email,
      action: 'create', entityType: 'customer', entityId: company.id,
      metadata: { name: company.name },
      ipAddress: actor.ip,
    });
    return company;
  }

  async updateCompany(id: string, dto: UpdateCompanyDto, actor: Actor) {
    const existing = await this.prisma.customerCompany.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException('Company not found');

    const company = await this.prisma.customerCompany.update({
      where: { id },
      data: dto,
    });
    await this.audit.log({
      actorId: actor.id, actorEmail: actor.email,
      action: 'update', entityType: 'customer', entityId: id,
      metadata: { changes: dto },
      ipAddress: actor.ip,
    });
    return company;
  }

  async deleteCompany(id: string, actor: Actor) {
    const existing = await this.prisma.customerCompany.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException('Company not found');

    await this.prisma.customerCompany.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    await this.audit.log({
      actorId: actor.id, actorEmail: actor.email,
      action: 'delete', entityType: 'customer', entityId: id,
      metadata: { name: existing.name },
      ipAddress: actor.ip,
    });
  }

  // ─── Contacts ────────────────────────────────────────────────────────────────

  findAllContacts(companyId?: string) {
    return this.prisma.contact.findMany({
      where: { deletedAt: null, ...(companyId ? { companyId } : {}) },
      orderBy: [{ isPrimary: 'desc' }, { name: 'asc' }],
    });
  }

  async createContact(dto: CreateContactDto, actor: Actor) {
    const contact = await this.prisma.contact.create({ data: dto });
    await this.audit.log({
      actorId: actor.id, actorEmail: actor.email,
      action: 'create', entityType: 'contact', entityId: contact.id,
      metadata: { name: contact.name, companyId: contact.companyId },
      ipAddress: actor.ip,
    });
    return contact;
  }

  async updateContact(id: string, dto: UpdateContactDto, actor: Actor) {
    const existing = await this.prisma.contact.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException('Contact not found');

    const contact = await this.prisma.contact.update({ where: { id }, data: dto });
    await this.audit.log({
      actorId: actor.id, actorEmail: actor.email,
      action: 'update', entityType: 'contact', entityId: id,
      metadata: { changes: dto },
      ipAddress: actor.ip,
    });
    return contact;
  }

  async deleteContact(id: string, actor: Actor) {
    const existing = await this.prisma.contact.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException('Contact not found');

    await this.prisma.contact.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.audit.log({
      actorId: actor.id, actorEmail: actor.email,
      action: 'delete', entityType: 'contact', entityId: id,
      metadata: { name: existing.name },
      ipAddress: actor.ip,
    });
  }

  // ─── Deals ───────────────────────────────────────────────────────────────────

  findOneDeal(id: string) {
    return this.prisma.deal.findFirst({
      where: { id, deletedAt: null },
      include: {
        company:      { select: { id: true, name: true, country: true } },
        contact:      { select: { id: true, name: true, email: true } },
        assignedUser: { select: { id: true, name: true, initials: true, color: true } },
        vehicle: {
          select: {
            id: true, stockNumber: true, make: true, model: true,
            variant: true, year: true, price: true, status: true,
          },
        },
      },
    });
  }

  findAllDeals(companyId?: string) {
    return this.prisma.deal.findMany({
      where: { deletedAt: null, ...(companyId ? { companyId } : {}) },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, subject: true, status: true, priority: true,
        channel: true, createdAt: true, updatedAt: true,
        company:      { select: { id: true, name: true } },
        contact:      { select: { id: true, name: true } },
        assignedUser: { select: { id: true, name: true } },
        vehicle: {
          select: {
            id: true, stockNumber: true, make: true, model: true,
            variant: true, year: true, price: true, status: true,
          },
        },
      },
    });
  }

  async createDeal(dto: CreateDealDto, actor: Actor) {
    // Business rule: can't link a vehicle that is already reserved in another active deal
    if (dto.vehicleId) {
      await this.assertVehicleAvailable(dto.vehicleId, null);
    }

    const deal = await this.prisma.deal.create({
      data: {
        subject:        dto.subject,
        channel:        dto.channel,
        status:         dto.status,
        priority:       dto.priority,
        companyId:      dto.companyId,
        contactId:      dto.contactId,
        assignedUserId: dto.assignedUserId,
        vehicleId:      dto.vehicleId ?? null,
      },
    });
    await this.audit.log({
      actorId: actor.id, actorEmail: actor.email,
      action: 'create', entityType: 'deal', entityId: deal.id,
      metadata: { subject: deal.subject, companyId: deal.companyId, vehicleId: deal.vehicleId },
      ipAddress: actor.ip,
    });
    return deal;
  }

  async updateDeal(id: string, dto: UpdateDealDto, actor: Actor) {
    const existing = await this.prisma.deal.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException('Deal not found');

    const deal = await this.prisma.deal.update({ where: { id }, data: dto });
    await this.audit.log({
      actorId: actor.id, actorEmail: actor.email,
      action: 'update', entityType: 'deal', entityId: id,
      metadata: { changes: dto },
      ipAddress: actor.ip,
    });
    return deal;
  }

  async changeDealStatus(id: string, dto: ChangeDealStatusDto, actor: Actor) {
    const existing = await this.prisma.deal.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException('Deal not found');

    const deal = await this.prisma.deal.update({
      where: { id },
      data:  { status: dto.status },
    });
    await this.audit.log({
      actorId: actor.id, actorEmail: actor.email,
      action: 'status_change', entityType: 'deal', entityId: id,
      metadata: { from: existing.status, to: dto.status },
      ipAddress: actor.ip,
    });
    return deal;
  }

  async deleteDeal(id: string, actor: Actor) {
    const existing = await this.prisma.deal.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException('Deal not found');

    // Only admin or assignee may delete
    if (actor.role !== Role.admin && existing.assignedUserId !== actor.id) {
      throw new ForbiddenException('Only the assigned user or an admin may delete this deal');
    }

    await this.prisma.deal.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.audit.log({
      actorId: actor.id, actorEmail: actor.email,
      action: 'delete', entityType: 'deal', entityId: id,
      metadata: { subject: existing.subject },
      ipAddress: actor.ip,
    });
  }

  // ─── Vehicle–Deal linking ─────────────────────────────────────────────────────

  /**
   * Link a vehicle to a deal.
   * Rules:
   *   - Vehicle must exist and not be archived.
   *   - Vehicle must not be reserved in another active deal.
   *   - Sold vehicles (linked to a resolved deal only) can be re-linked.
   */
  async linkVehicle(dealId: string, dto: LinkVehicleDto, actor: Actor) {
    const deal = await this.prisma.deal.findFirst({ where: { id: dealId, deletedAt: null } });
    if (!deal) throw new NotFoundException('Deal not found');

    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: dto.vehicleId } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    if (vehicle.status === 'archived') {
      throw new BadRequestException('Archived vehicles cannot be linked to a deal');
    }

    await this.assertVehicleAvailable(dto.vehicleId, dealId);

    const updated = await this.prisma.deal.update({
      where: { id: dealId },
      data:  { vehicleId: dto.vehicleId },
      include: { vehicle: true },
    });

    await this.audit.log({
      actorId: actor.id, actorEmail: actor.email,
      action: 'update', entityType: 'deal', entityId: dealId,
      metadata: { vehicleLinked: dto.vehicleId, make: vehicle.make, model: vehicle.model },
      ipAddress: actor.ip,
    });

    return updated;
  }

  /**
   * Remove the vehicle link from a deal.
   * Resolved deals keep their historical link — only staff can explicitly clear it.
   */
  async unlinkVehicle(dealId: string, actor: Actor) {
    const deal = await this.prisma.deal.findFirst({ where: { id: dealId, deletedAt: null } });
    if (!deal) throw new NotFoundException('Deal not found');
    if (!deal.vehicleId) return deal; // already unlinked

    const updated = await this.prisma.deal.update({
      where: { id: dealId },
      data:  { vehicleId: null },
    });

    await this.audit.log({
      actorId: actor.id, actorEmail: actor.email,
      action: 'update', entityType: 'deal', entityId: dealId,
      metadata: { vehicleUnlinked: deal.vehicleId },
      ipAddress: actor.ip,
    });

    return updated;
  }

  /**
   * Checks that a vehicle is not reserved (active) in another deal.
   * Throws BadRequestException if blocked.
   */
  private async assertVehicleAvailable(vehicleId: string, currentDealId: string | null) {
    const blocking = await this.prisma.deal.findFirst({
      where: {
        vehicleId,
        status: { in: ['new', 'in_progress', 'awaiting'] },
        deletedAt: null,
        ...(currentDealId ? { id: { not: currentDealId } } : {}),
      },
      select: { id: true },
    });

    if (blocking) {
      throw new BadRequestException(
        `Vehicle is already reserved in deal ${blocking.id}.`,
      );
    }
  }

  // ─── Tasks ───────────────────────────────────────────────────────────────────

  findAllTasks(dealId?: string, assignedUserId?: string) {
    return this.prisma.task.findMany({
      where: {
        deletedAt: null,
        ...(dealId         ? { dealId }         : {}),
        ...(assignedUserId ? { assignedUserId } : {}),
      },
      orderBy: [{ status: 'asc' }, { dueAt: 'asc' }],
      select: {
        id: true, title: true, description: true, status: true, dueAt: true,
        createdAt: true, updatedAt: true,
        deal:         { select: { id: true, subject: true } },
        assignedUser: { select: { id: true, name: true } },
      },
    });
  }

  async createTask(dto: CreateTaskDto, actor: Actor) {
    const task = await this.prisma.task.create({
      data: {
        title:          dto.title,
        description:    dto.description,
        status:         dto.status ?? 'open',
        dueAt:          dto.dueAt ? new Date(dto.dueAt) : undefined,
        dealId:         dto.dealId,
        assignedUserId: dto.assignedUserId,
      },
    });
    await this.audit.log({
      actorId: actor.id, actorEmail: actor.email,
      action: 'create', entityType: 'task', entityId: task.id,
      metadata: { title: task.title, dealId: task.dealId },
      ipAddress: actor.ip,
    });
    return task;
  }

  async updateTask(id: string, dto: UpdateTaskDto, actor: Actor) {
    const existing = await this.prisma.task.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException('Task not found');

    const oldStatus = existing.status;
    const task = await this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
      },
    });

    // Record status changes separately so they're easy to filter in the audit log
    const action = dto.status && dto.status !== oldStatus ? 'status_change' : 'update';
    await this.audit.log({
      actorId: actor.id, actorEmail: actor.email,
      action, entityType: 'task', entityId: id,
      metadata: action === 'status_change'
        ? { from: oldStatus, to: dto.status }
        : { changes: dto },
      ipAddress: actor.ip,
    });
    return task;
  }

  async deleteTask(id: string, actor: Actor) {
    const existing = await this.prisma.task.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException('Task not found');

    await this.prisma.task.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.audit.log({
      actorId: actor.id, actorEmail: actor.email,
      action: 'delete', entityType: 'task', entityId: id,
      metadata: { title: existing.title },
      ipAddress: actor.ip,
    });
  }
}
