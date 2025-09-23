import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Order } from '../orders/order.entity';
import { User } from '../users/user.entity';
import { PaymentLog } from './payment-log.entity';

export enum PaymentMethod {
  QR = 'qr',
  CASH = 'cash',
}

export enum PaymentStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  order_id: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  method: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ nullable: true })
  transaction_id: string;

  @Column({ nullable: true })
  verified_by: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToOne(() => Order, order => order.payment)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'verified_by' })
  verifiedBy: User;

  @OneToMany(() => PaymentLog, paymentLog => paymentLog.payment)
  logs: PaymentLog[];
}