import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne } from 'typeorm';
import { Waiter } from '../waiters/waiter.entity';

export enum UserRole {
  ADMIN = 'admin',
  BAR = 'bar',
  WAITER = 'waiter',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @OneToOne(() => Waiter, waiter => waiter.user)
  waiter: Waiter;
}