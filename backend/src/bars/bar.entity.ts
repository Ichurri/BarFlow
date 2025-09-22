import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Waiter } from '../waiters/waiter.entity';
import { Order } from '../orders/order.entity';

@Entity('bars')
export class Bar {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @OneToMany(() => Waiter, waiter => waiter.bar)
  waiters: Waiter[];

  @OneToMany(() => Order, order => order.bar)
  orders: Order[];
}