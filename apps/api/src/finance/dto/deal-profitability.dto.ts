import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateDealProfitabilityDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  purchasePriceNet?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salePriceNet?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  purchaseTransportCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salesTransportCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  preparationCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  workshopCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  documentsCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  registrationCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  importExportCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  warrantyRiskCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bankCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  marketplaceCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  otherPurchaseCosts?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  otherSalesCosts?: number;

  // null explicitly allowed to clear the assignment
  @IsOptional()
  @IsString()
  buyerUserId?: string | null;

  @IsOptional()
  @IsString()
  sellerUserId?: string | null;
}
