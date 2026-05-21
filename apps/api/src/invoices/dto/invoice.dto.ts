import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export enum TipoFacturaDto {
  F1 = 'F1',
  F2 = 'F2',
  R1 = 'R1',
  R2 = 'R2',
  R3 = 'R3',
  R4 = 'R4',
  R5 = 'R5',
}

export class CreateInvoiceDto {
  @IsString()
  companyId: string;

  @IsString()
  @IsOptional()
  dealId?: string;

  @IsString()
  description: string;

  @IsNumber()
  @IsPositive()
  baseImponible: number;

  @IsNumber()
  @Min(0)
  @Max(21)
  tipoIVA: number;

  @IsEnum(['EUR', 'GBP', 'SEK', 'PLN'])
  @IsOptional()
  currency?: string;

  @IsEnum(TipoFacturaDto)
  @IsOptional()
  tipoFactura?: TipoFacturaDto;

  @IsString()
  @IsOptional()
  serie?: string;

  @IsDateString()
  issuedAt: string;

  @IsDateString()
  dueAt: string;

  @IsString()
  @IsOptional()
  nifDestinatario?: string;

  @IsString()
  @IsOptional()
  nombreDestinatario?: string;
}

export class UpdateInvoiceDto {
  @IsEnum(['issued', 'paid', 'overdue', 'disputed'])
  @IsOptional()
  status?: string;

  @IsDateString()
  @IsOptional()
  paidAt?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class QueryInvoicesDto {
  @IsString()
  @IsOptional()
  companyId?: string;

  @IsEnum(['issued', 'paid', 'overdue', 'disputed'])
  @IsOptional()
  status?: string;

  @IsEnum(['pendiente', 'enviada', 'aceptada', 'rechazada', 'error'])
  @IsOptional()
  estadoVeriFactu?: string;

  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;
}
