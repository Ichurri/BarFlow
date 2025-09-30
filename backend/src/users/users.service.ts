import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Waiter } from '../waiters/waiter.entity';
import { Table } from '../tables/table.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Waiter)
    private waitersRepository: Repository<Waiter>,
    @InjectRepository(Table)
    private tablesRepository: Repository<Table>,
  ) {}

  async findByUsername(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findById(id: number): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'username', 'role', 'created_at']
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ 
      where: { id },
      select: ['id', 'username', 'role', 'created_at']
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if username already exists
    const existingUser = await this.findByUsername(createUserDto.username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword
    });
    
    const savedUser = await this.usersRepository.save(user);
    
    // Return user without password
    const { password, ...result } = savedUser;
    return result as User;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    
    // Check if username is being changed and already exists
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.findByUsername(updateUserDto.username);
      if (existingUser) {
        throw new ConflictException('Username already exists');
      }
    }

    // Hash password if provided
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    await this.usersRepository.update(id, updateUserDto);
    
    const updatedUser = await this.findOne(id);
    return updatedUser;
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async validatePassword(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }

  async getWaiterInfo(userId: number): Promise<{ waiter: Waiter | null; tables: Table[] }> {
    const user = await this.findOne(userId);
    
    if (user.role !== 'waiter') {
      return { waiter: null, tables: [] };
    }

    // Find the waiter record for this user
    const waiter = await this.waitersRepository.findOne({
      where: { user_id: userId },
      relations: ['bar']
    });

    if (!waiter) {
      return { waiter: null, tables: [] };
    }

    // Find all tables assigned to this waiter
    const tables = await this.tablesRepository.find({
      where: { waiter_id: waiter.id },
      order: { qr_code: 'ASC' }
    });

    return { waiter, tables };
  }

  async assignTablesToWaiter(userId: number, tableIds: number[]): Promise<void> {
    const user = await this.findOne(userId);
    
    if (user.role !== 'waiter') {
      throw new ConflictException('User is not a waiter');
    }

    // Find or create waiter record
    let waiter = await this.waitersRepository.findOne({
      where: { user_id: userId }
    });

    if (!waiter) {
      // Create waiter record if it doesn't exist
      // For now, assign to the first bar (you may want to make this configurable)
      waiter = this.waitersRepository.create({
        user_id: userId,
        bar_id: 1 // Default to first bar
      });
      waiter = await this.waitersRepository.save(waiter);
    }

    // First, unassign all current tables from this waiter
    await this.tablesRepository.update(
      { waiter_id: waiter.id },
      { waiter_id: null }
    );

    // Then assign the new tables
    if (tableIds.length > 0) {
      await this.tablesRepository
        .createQueryBuilder()
        .update(Table)
        .set({ waiter_id: waiter.id })
        .where('id IN (:...ids)', { ids: tableIds })
        .execute();
    }
  }
}