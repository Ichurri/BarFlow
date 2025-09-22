import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  CLEANING = 'cleaning',
  OUT_OF_SERVICE = 'out_of_service'
}

export class CreateTableDto {
  @IsString()
  qr_code: string;

  @IsNumber()
  waiter_id: number;

  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus = TableStatus.AVAILABLE;

  @IsOptional()
  @IsNumber()
  capacity?: number;

  @IsOptional()
  @IsString()
  location?: string;
}

export class UpdateTableDto {
  @IsOptional()
  @IsString()
  qr_code?: string;

  @IsOptional()
  @IsNumber()
  waiter_id?: number;

  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus;

  @IsOptional()
  @IsNumber()
  capacity?: number;

  @IsOptional()
  @IsString()
  location?: string;
}