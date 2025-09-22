import { IsNumber, IsArray, IsOptional, IsEnum, ValidateNested, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export class CreateOrderItemDto {
  @IsNumber()
  inventory_id: number;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsNumber()
  unit_price?: number;
}

export class CreateOrderDto {
  @IsNumber()
  table_id: number;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus = OrderStatus.PENDING;

  @IsOptional()
  notes?: string;
}

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  notes?: string;
}

export class UpdateOrderItemDto {
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsNumber()
  unit_price?: number;
}