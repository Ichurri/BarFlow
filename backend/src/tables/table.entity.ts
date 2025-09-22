import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Waiter } from '../waiters/waiter.entity';
import { Order } from '../orders/order.entity';

export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  CLEANING = 'cleaning',
  OUT_OF_SERVICE = 'out_of_service'
}

@Entity('tables')
export class Table {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  qr_code: string;

  @Column()
  waiter_id: number;

  @Column({
    type: 'enum',
    enum: TableStatus,
    default: TableStatus.AVAILABLE
  })
  status: TableStatus;

  @Column({ nullable: true })
  capacity: number;

  @Column({ nullable: true })
  location: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Waiter, waiter => waiter.tables)
  @JoinColumn({ name: 'waiter_id' })
  waiter: Waiter;

  @OneToMany(() => Order, order => order.table)
  orders: Order[];
}