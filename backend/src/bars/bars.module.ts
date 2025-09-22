import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bar } from './bar.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bar])],
  exports: [TypeOrmModule],
})
export class BarsModule {}