import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditParams {
  /** Staff user id — omit for unauthenticated events (e.g. failed login). */
  actorId?: string;
  /** Denormalised email — retained even if the user is later deleted. */
  actorEmail: string;
  /** Verb describing what happened: login | logout | create | update | delete | status_change */
  action: string;
  /** Logical entity category: customer | contact | deal | task | user */
  entityType?: string;
  /** PK of the affected record. */
  entityId?: string;
  /** Extra context: old/new values, diffs, labels, etc. */
  metadata?: Record<string, unknown>;
  /** Request origin. Defaults to 'staff_ui'. */
  source?: 'staff_ui' | 'portal' | 'system';
  ipAddress?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Append an immutable audit record.
   * Failures are swallowed with a warning — audit must never block business logic.
   */
  async log(params: AuditParams): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action:     params.action,
          entityType: params.entityType,
          entityId:   params.entityId,
          metadata:   params.metadata as object ?? undefined,
          source:     params.source ?? 'staff_ui',
          ipAddress:  params.ipAddress,
          actorEmail: params.actorEmail,
          actorId:    params.actorId,
        },
      });
    } catch (err) {
      // Log but never propagate — audit failure must not break the request.
      this.logger.warn(`audit.log failed: ${String(err)}`);
    }
  }
}
