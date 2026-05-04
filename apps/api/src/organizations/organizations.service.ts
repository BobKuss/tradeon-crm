import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import type { Actor } from '../crm/crm.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  findAll() {
    return this.prisma.customerCompany.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const org = await this.prisma.customerCompany.findFirst({
      where: { id, deletedAt: null },
    });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async create(dto: CreateOrganizationDto, actor: Actor) {
    const org = await this.prisma.customerCompany.create({
      data: {
        name:           dto.name,
        country:        dto.country,
        city:           dto.city,
        status:         dto.status ?? 'active',
        segment:        dto.segment,
        assignedUserId: dto.assignedUserId,
      },
    });

    await this.audit.log({
      actorId:    actor.id,
      actorEmail: actor.email,
      action:     'create',
      entityType: 'organization',
      entityId:   org.id,
      metadata:   { name: org.name, country: org.country, segment: org.segment },
      ipAddress:  actor.ip,
    });

    return org;
  }
}
