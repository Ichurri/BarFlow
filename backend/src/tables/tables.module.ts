import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Table } from './table.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Table])],
  exports: [TypeOrmModule],
})
export class TablesModule {}