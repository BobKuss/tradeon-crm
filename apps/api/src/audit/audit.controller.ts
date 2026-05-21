import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PrismaService } from '../prisma/prisma.service';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';

/**
 * GET /api/v1/audit-logs
 * Read-only, admin-only view of the staff audit trail.
 * Portal users have no access — they authenticate via a separate JWT audience.
 */
@Controller({ path: 'audit-logs', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin)
export class AuditController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll(@Query() q: QueryAuditLogDto) {
    const where: Prisma.AuditLogWhereInput = {};

    if (q.action)      where.action      = q.action;
    if (q.entityType)  where.entityType  = q.entityType;
    if (q.entityId)    where.entityId    = q.entityId;
    if (q.source)      where.source      = q.source;

    if (q.actorEmail) {
      where.actorEmail = { contains: q.actorEmail, mode: 'insensitive' };
    }

    if (q.from || q.to) {
      where.createdAt = {};
      if (q.from) where.createdAt.gte = new Date(q.from);
      if (q.to)   where.createdAt.lte = new Date(q.to);
    }

    const limit  = q.limit  ?? 50;
    const offset = q.offset ?? 0;

    const [total, rows] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip:    offset,
        take:    limit,
        select: {
          id:         true,
          action:     true,
          entityType: true,
          entityId:   true,
          metadata:   true,
          source:     true,
          ipAddress:  true,
          actorEmail: true,
          actorId:    true,
          createdAt:  true,
          actor: { select: { name: true, role: true } },
        },
      }),
    ]);

    return { total, limit, offset, rows };
  }
}
