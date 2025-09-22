import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Waiter } from '../waiters/waiter.entity';
import { Order } from '../orders/order.entity';

@Entity('tables')
export class Table {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  qr_code: string;

  @Column()
  waiter_id: number;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Waiter, waiter => waiter.tables)
  @JoinColumn({ name: 'waiter_id' })
  waiter: Waiter;

  @OneToMany(() => Order, order => order.table)
  orders: Order[];
}