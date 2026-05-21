import { Transform } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryAuditLogDto {
  /** Filter by action verb (login, logout, create, update, delete, status_change) */
  @IsOptional()
  @IsString()
  action?: string;

  /** Filter by entity category (customer, contact, deal, task, user) */
  @IsOptional()
  @IsString()
  entityType?: string;

  /** Filter by a specific entity id */
  @IsOptional()
  @IsString()
  entityId?: string;

  /** Filter by actor email (partial match) */
  @IsOptional()
  @IsString()
  actorEmail?: string;

  /** Filter by source (staff_ui, portal, system) */
  @IsOptional()
  @IsString()
  source?: string;

  /** Earliest createdAt (ISO 8601) */
  @IsOptional()
  @IsDateString()
  from?: string;

  /** Latest createdAt (ISO 8601) */
  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value as string, 10))
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 50;

  @IsOptional()
  @Transform(({ value }) => parseInt(value as string, 10))
  @IsInt()
  @Min(0)
  offset?: number = 0;
}
