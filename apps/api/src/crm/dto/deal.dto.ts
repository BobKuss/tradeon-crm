import {
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { DealChannel, DealPriority, DealStatus } from '@prisma/client';

export class CreateDealDto {
  @IsString()
  subject: string;

  @IsEnum(DealChannel)
  channel: DealChannel;

  @IsOptional()
  @IsEnum(DealStatus)
  status?: DealStatus;

  @IsOptional()
  @IsEnum(DealPriority)
  priority?: DealPriority;

  /** Optional vehicle FK. Business rules are enforced in the service layer. */
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsString()
  companyId: string;

  @IsOptional()
  @IsString()
  contactId?: string;

  @IsOptional()
  @IsString()
  assignedUserId?: string;
}

export class UpdateDealDto {
  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsEnum(DealChannel)
  channel?: DealChannel;

  @IsOptional()
  @IsEnum(DealPriority)
  priority?: DealPriority;

  @IsOptional()
  @IsString()
  contactId?: string;

  @IsOptional()
  @IsString()
  assignedUserId?: string;
}

export class ChangeDealStatusDto {
  @IsEnum(DealStatus)
  status: DealStatus;
}

/** Body for PATCH /deals/:id/vehicle */
export class LinkVehicleDto {
  @IsString()
  vehicleId: string;
}

