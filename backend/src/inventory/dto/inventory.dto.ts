import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateInventoryDto {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsNumber()
  @Min(0)
  cost_price: number;

  @IsNumber()
  @Min(0)
  sale_price: number;

  @IsOptional()
  @IsString()
  photo_url?: string;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsNumber()
  @Min(0)
  min_stock: number;
}

export class UpdateInventoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost_price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sale_price?: number;

  @IsOptional()
  @IsString()
  photo_url?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  min_stock?: number;
}