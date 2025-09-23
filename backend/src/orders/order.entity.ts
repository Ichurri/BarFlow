import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Table } from '../tables/table.entity';
import { Waiter } from '../waiters/waiter.entity';
import { Bar } from '../bars/bar.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from '../payments/payment.entity';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  DELIVERED = 'delivered',
  PAYMENT_PENDING = 'payment_pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  table_id: number;

  @Column()
  waiter_id: number;

  @Column()
  bar_id: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  total_amount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Table, table => table.orders)
  @JoinColumn({ name: 'table_id' })
  table: Table;

  @ManyToOne(() => Waiter, waiter => waiter.orders)
  @JoinColumn({ name: 'waiter_id' })
  waiter: Waiter;

  @ManyToOne(() => Bar, bar => bar.orders)
  @JoinColumn({ name: 'bar_id' })
  bar: Bar;

  @OneToMany(() => OrderItem, orderItem => orderItem.order, { cascade: true })
  orderItems: OrderItem[];

  @OneToOne(() => Payment, payment => payment.order)
  payment: Payment;
}