import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { OrderItem } from '../orders/order-item.entity';

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  category: string;

  @Column('decimal', { precision: 10, scale: 2 })
  cost_price: number;

  @Column('decimal', { precision: 10, scale: 2 })
  sale_price: number;

  @Column({ nullable: true })
  photo_url: string;

  @Column('int')
  stock: number;

  @Column('int')
  min_stock: number;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @OneToMany(() => OrderItem, orderItem => orderItem.inventory)
  orderItems: OrderItem[];

  // Virtual property to check if stock is low
  get isLowStock(): boolean {
    return this.stock <= this.min_stock;
  }
}