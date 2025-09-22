import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Waiter } from './waiter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Waiter])],
  exports: [TypeOrmModule],
})
export class WaitersModule {}