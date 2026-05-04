import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { CompanySegment, CompanyStatus } from '@prisma/client';

export class CreateOrganizationDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  country: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(CompanyStatus)
  status?: CompanyStatus;

  @IsEnum(CompanySegment)
  segment: CompanySegment;

  @IsOptional()
  @IsString()
  assignedUserId?: string;
}
