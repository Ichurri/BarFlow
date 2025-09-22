import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './inventory.entity';
import { CreateInventoryDto, UpdateInventoryDto } from './dto/inventory.dto';
import { UserRole } from '../users/user.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
  ) {}

  async create(createInventoryDto: CreateInventoryDto): Promise<Inventory> {
    const inventory = this.inventoryRepository.create(createInventoryDto);
    return this.inventoryRepository.save(inventory);
  }

  async findAll(userRole?: UserRole): Promise<Inventory[]> {
    const items = await this.inventoryRepository.find();
    
    // Hide cost_price from non-admin users
    if (userRole !== UserRole.ADMIN) {
      return items.map(item => {
        const { cost_price, ...itemWithoutCost } = item;
        return itemWithoutCost as Inventory;
      });
    }
    
    return items;
  }

  async findOne(id: number, userRole?: UserRole): Promise<Inventory> {
    const item = await this.inventoryRepository.findOne({ where: { id } });
    
    if (!item) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }

    // Hide cost_price from non-admin users
    if (userRole !== UserRole.ADMIN) {
      const { cost_price, ...itemWithoutCost } = item;
      return itemWithoutCost as Inventory;
    }

    return item;
  }

  async update(id: number, updateInventoryDto: UpdateInventoryDto): Promise<Inventory> {
    const item = await this.findOne(id, UserRole.ADMIN); // Admin access for updates
    
    Object.assign(item, updateInventoryDto);
    return this.inventoryRepository.save(item);
  }

  async remove(id: number): Promise<void> {
    const item = await this.findOne(id, UserRole.ADMIN);
    await this.inventoryRepository.remove(item);
  }

  async findLowStock(): Promise<Inventory[]> {
    return this.inventoryRepository
      .createQueryBuilder('inventory')
      .where('inventory.stock <= inventory.min_stock')
      .getMany();
  }

  async updateStock(id: number, quantity: number): Promise<Inventory> {
    const item = await this.findOne(id, UserRole.ADMIN);
    item.stock += quantity; // Can be negative for reducing stock
    
    if (item.stock < 0) {
      item.stock = 0; // Prevent negative stock
    }
    
    return this.inventoryRepository.save(item);
  }

  async reduceStock(id: number, quantity: number): Promise<Inventory> {
    return this.updateStock(id, -quantity);
  }

  async findByCategory(category: string, userRole?: UserRole): Promise<Inventory[]> {
    const items = await this.inventoryRepository.find({ 
      where: { category } 
    });
    
    // Hide cost_price from non-admin users
    if (userRole !== UserRole.ADMIN) {
      return items.map(item => {
        const { cost_price, ...itemWithoutCost } = item;
        return itemWithoutCost as Inventory;
      });
    }
    
    return items;
  }

  async getAvailableItems(userRole?: UserRole): Promise<Inventory[]> {
    const items = await this.inventoryRepository
      .createQueryBuilder('inventory')
      .where('inventory.stock > 0')
      .getMany();
    
    // Hide cost_price from non-admin users
    if (userRole !== UserRole.ADMIN) {
      return items.map(item => {
        const { cost_price, ...itemWithoutCost } = item;
        return itemWithoutCost as Inventory;
      });
    }
    
    return items;
  }
}