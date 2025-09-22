import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Bar } from '../bars/bar.entity';
import { Table } from '../tables/table.entity';
import { Order } from '../orders/order.entity';

@Entity('waiters')
export class Waiter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  user_id: number;

  @Column()
  bar_id: number;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @OneToOne(() => User, user => user.waiter)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Bar, bar => bar.waiters)
  @JoinColumn({ name: 'bar_id' })
  bar: Bar;

  @OneToMany(() => Table, table => table.waiter)
  tables: Table[];

  @OneToMany(() => Order, order => order.waiter)
  orders: Order[];
}