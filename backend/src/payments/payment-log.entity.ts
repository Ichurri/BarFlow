import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Payment } from './payment.entity';
import { User } from '../users/user.entity';

export enum PaymentLogAction {
  CREATED = 'created',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

@Entity('payment_logs')
export class PaymentLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  payment_id: number;

  @Column({
    type: 'enum',
    enum: PaymentLogAction,
  })
  action: PaymentLogAction;

  @Column()
  user_id: number;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Payment, payment => payment.logs)
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}