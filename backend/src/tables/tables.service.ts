import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Table, TableStatus } from './table.entity';
import { CreateTableDto, UpdateTableDto } from './dto/table.dto';
import { UserRole } from '../users/user.entity';

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(Table)
    private tablesRepository: Repository<Table>,
  ) {}

  async create(createTableDto: CreateTableDto): Promise<Table> {
    const table = this.tablesRepository.create(createTableDto);
    return await this.tablesRepository.save(table);
  }

  async findAll(userRole: UserRole, userId: number): Promise<Table[]> {
    const queryBuilder = this.tablesRepository.createQueryBuilder('table')
      .leftJoinAndSelect('table.waiter', 'waiter')
      .leftJoinAndSelect('waiter.user', 'user');

    // Si es mesero, solo ve sus mesas
    if (userRole === UserRole.WAITER) {
      queryBuilder.where('waiter.user_id = :userId', { userId });
    }

    return await queryBuilder.getMany();
  }

  async getTablesByWaiter(userId: number): Promise<Table[]> {
    return await this.tablesRepository.createQueryBuilder('table')
      .leftJoinAndSelect('table.waiter', 'waiter')
      .leftJoinAndSelect('table.orders', 'orders', 'orders.status IN (:...statuses)', { statuses: ['pending', 'preparing', 'ready'] })
      .where('waiter.user_id = :userId', { userId })
      .getMany();
  }

  async findByQRCode(qrCode: string): Promise<Table> {
    const table = await this.tablesRepository.createQueryBuilder('table')
      .leftJoinAndSelect('table.waiter', 'waiter')
      .leftJoinAndSelect('waiter.user', 'user')
      .where('table.qr_code = :qrCode', { qrCode })
      .getOne();

    if (!table) {
      throw new NotFoundException(`Mesa con QR ${qrCode} no encontrada`);
    }

    return table;
  }

  async findOne(id: number): Promise<Table> {
    const table = await this.tablesRepository.createQueryBuilder('table')
      .leftJoinAndSelect('table.waiter', 'waiter')
      .leftJoinAndSelect('waiter.user', 'user')
      .leftJoinAndSelect('waiter.bar', 'bar')
      .leftJoinAndSelect('table.orders', 'orders')
      .where('table.id = :id', { id })
      .getOne();

    if (!table) {
      throw new NotFoundException(`Mesa con ID ${id} no encontrada`);
    }

    return table;
  }

  async update(id: number, updateTableDto: UpdateTableDto, user: any): Promise<Table> {
    const table = await this.findOne(id);

    // Solo el mesero asignado o admin puede actualizar
    if (user.role === UserRole.WAITER && table.waiter.user_id !== user.id) {
      throw new ForbiddenException('Solo puedes actualizar tus mesas asignadas');
    }

    await this.tablesRepository.update(id, updateTableDto);
    return await this.findOne(id);
  }

  async updateStatus(id: number, status: string, user: any): Promise<Table> {
    const table = await this.findOne(id);

    // Validar que el status sea válido
    if (!Object.values(TableStatus).includes(status as TableStatus)) {
      throw new ForbiddenException('Estado de mesa inválido');
    }

    // Solo el mesero asignado o admin puede cambiar estado (skip validation if user is null - system operation)
    if (user && user.role === UserRole.WAITER && table.waiter.user_id !== user.id) {
      throw new ForbiddenException('Solo puedes cambiar el estado de tus mesas asignadas');
    }

    await this.tablesRepository.update(id, { status: status as TableStatus });
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const table = await this.findOne(id);
    await this.tablesRepository.remove(table);
  }

  async getAvailableTables(): Promise<Table[]> {
    return await this.tablesRepository.find({
      where: { status: TableStatus.AVAILABLE },
      relations: ['waiter', 'waiter.user']
    });
  }

  async getTablesByStatus(status: TableStatus): Promise<Table[]> {
    return await this.tablesRepository.find({
      where: { status },
      relations: ['waiter', 'waiter.user']
    });
  }
}