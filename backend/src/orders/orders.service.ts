import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { OrderItem } from './order-item.entity';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';
import { UserRole } from '../users/user.entity';
import { TablesService } from '../tables/tables.service';
import { InventoryService } from '../inventory/inventory.service';
import { TableStatus } from '../tables/table.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    private tablesService: TablesService,
    private inventoryService: InventoryService,
  ) {}

  async create(createOrderDto: CreateOrderDto, user: any): Promise<Order> {
    const { table_id, items, notes } = createOrderDto;

    // Verificar que la mesa existe y está disponible
    const table = await this.tablesService.findOne(table_id);
    if (table.status !== TableStatus.AVAILABLE && table.status !== TableStatus.OCCUPIED) {
      throw new BadRequestException('La mesa no está disponible para pedidos');
    }

    // Calcular total y validar inventario
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const inventoryItem = await this.inventoryService.findOne(item.inventory_id);
      
      if (inventoryItem.stock < item.quantity) {
        throw new BadRequestException(`Item ${inventoryItem.name} no tiene stock suficiente`);
      }

      const unitPrice = item.unit_price || inventoryItem.sale_price;
      const subtotal = unitPrice * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        inventory_id: item.inventory_id,
        quantity: item.quantity,
        unit_price: unitPrice,
        subtotal: subtotal,
      });
    }

    // Crear la orden
    const order = this.ordersRepository.create({
      table_id,
      waiter_id: table.waiter_id,
      bar_id: table.waiter.bar_id,
      total_amount: totalAmount,
      notes,
      status: OrderStatus.PENDING,
    });

    const savedOrder = await this.ordersRepository.save(order);

    // Crear los items de la orden
    for (const item of orderItems) {
      const orderItem = this.orderItemsRepository.create({
        ...item,
        order_id: savedOrder.id,
      });
      await this.orderItemsRepository.save(orderItem);
    }

    // Actualizar estado de la mesa si está disponible
    if (table.status === TableStatus.AVAILABLE) {
      await this.tablesService.updateStatus(table_id, TableStatus.OCCUPIED, user);
    }

    return await this.findOne(savedOrder.id, user);
  }

  async createOrderByQR(qrCode: string, createOrderDto: Omit<CreateOrderDto, 'table_id'>): Promise<Order> {
    const table = await this.tablesService.findByQRCode(qrCode);
    
    const fullOrderDto: CreateOrderDto = {
      ...createOrderDto,
      table_id: table.id,
    };

    // Usuario temporal para la creación (se podría mejorar con autenticación por QR)
    const tempUser = { role: UserRole.WAITER, id: table.waiter.user_id };
    
    return await this.create(fullOrderDto, tempUser);
  }

  async findAll(userRole: UserRole, userId: number, status?: OrderStatus): Promise<Order[]> {
    const queryBuilder = this.ordersRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.table', 'table')
      .leftJoinAndSelect('order.waiter', 'waiter')
      .leftJoinAndSelect('waiter.user', 'waiterUser')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.inventory', 'inventory')
      .orderBy('order.created_at', 'DESC');

    // Filtrar por rol
    if (userRole === UserRole.WAITER) {
      queryBuilder.where('waiterUser.id = :userId', { userId });
    }

    // Filtrar por estado si se especifica
    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    return await queryBuilder.getMany();
  }

  async getOrdersByWaiter(userId: number, status?: OrderStatus): Promise<Order[]> {
    const queryBuilder = this.ordersRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.table', 'table')
      .leftJoinAndSelect('order.waiter', 'waiter')
      .leftJoinAndSelect('waiter.user', 'waiterUser')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.inventory', 'inventory')
      .where('waiterUser.id = :userId', { userId })
      .orderBy('order.created_at', 'DESC');

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    return await queryBuilder.getMany();
  }

  async getOrdersByTable(tableId: number, user: any): Promise<Order[]> {
    const queryBuilder = this.ordersRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.table', 'table')
      .leftJoinAndSelect('order.waiter', 'waiter')
      .leftJoinAndSelect('waiter.user', 'waiterUser')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.inventory', 'inventory')
      .where('order.table_id = :tableId', { tableId })
      .orderBy('order.created_at', 'DESC');

    // Solo el mesero asignado o admin pueden ver pedidos de una mesa
    if (user.role === UserRole.WAITER) {
      queryBuilder.andWhere('waiterUser.id = :userId', { userId: user.id });
    }

    return await queryBuilder.getMany();
  }

  async getPendingOrders(user: any): Promise<Order[]> {
    return await this.ordersRepository.find({
      where: { status: OrderStatus.PENDING },
      relations: ['table', 'waiter', 'waiter.user', 'orderItems', 'orderItems.inventory'],
      order: { created_at: 'ASC' },
    });
  }

  async getReadyOrders(user: any): Promise<Order[]> {
    const queryBuilder = this.ordersRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.table', 'table')
      .leftJoinAndSelect('order.waiter', 'waiter')
      .leftJoinAndSelect('waiter.user', 'waiterUser')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.inventory', 'inventory')
      .where('order.status = :status', { status: OrderStatus.READY })
      .orderBy('order.updated_at', 'ASC');

    // Si es mesero, solo sus pedidos
    if (user.role === UserRole.WAITER) {
      queryBuilder.andWhere('waiterUser.id = :userId', { userId: user.id });
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: number, user: any): Promise<Order> {
    const queryBuilder = this.ordersRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.table', 'table')
      .leftJoinAndSelect('order.waiter', 'waiter')
      .leftJoinAndSelect('waiter.user', 'waiterUser')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.inventory', 'inventory')
      .where('order.id = :id', { id });

    const order = await queryBuilder.getOne();

    if (!order) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
    }

    // Verificar permisos
    if (user.role === UserRole.WAITER && order.waiter.user_id !== user.id) {
      throw new ForbiddenException('Solo puedes ver tus propios pedidos');
    }

    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto, user: any): Promise<Order> {
    const order = await this.findOne(id, user);

    // Solo se puede actualizar si está en estado PENDING
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Solo se pueden actualizar pedidos pendientes');
    }

    await this.ordersRepository.update(id, updateOrderDto);
    return await this.findOne(id, user);
  }

  async updateStatus(id: number, status: OrderStatus, user: any): Promise<Order> {
    const order = await this.findOne(id, user);
    
    // Validar transiciones de estado
    if (!this.isValidStatusTransition(order.status, status)) {
      throw new BadRequestException(`Transición de estado inválida: ${order.status} -> ${status}`);
    }

    await this.ordersRepository.update(id, { status });
    return await this.findOne(id, user);
  }

  async confirmOrder(id: number, user: any): Promise<Order> {
    return await this.updateStatus(id, OrderStatus.CONFIRMED, user);
  }

  async markReady(id: number, user: any): Promise<Order> {
    const order = await this.updateStatus(id, OrderStatus.READY, user);
    
    // Actualizar stock del inventario
    for (const item of order.orderItems) {
      await this.inventoryService.updateStock(
        item.inventory_id,
        item.inventory.stock - item.quantity
      );
    }

    return order;
  }

  async markDelivered(id: number, user: any): Promise<Order> {
    return await this.updateStatus(id, OrderStatus.DELIVERED, user);
  }

  async remove(id: number): Promise<void> {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
    }

    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CANCELLED) {
      throw new BadRequestException('Solo se pueden eliminar pedidos pendientes o cancelados');
    }

    await this.ordersRepository.remove(order);
  }

  async requestPayment(orderId: number, user: any): Promise<Order> {
    const order = await this.findOne(orderId, user);

    if (order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException('La orden debe estar entregada para solicitar pago');
    }

    // Actualizar estado a PAYMENT_PENDING
    await this.ordersRepository.update(orderId, {
      status: OrderStatus.PAYMENT_PENDING,
    });

    return this.findOne(orderId, user);
  }

  private isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
      [OrderStatus.READY]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.PAYMENT_PENDING],
      [OrderStatus.PAYMENT_PENDING]: [OrderStatus.COMPLETED, OrderStatus.DELIVERED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
}