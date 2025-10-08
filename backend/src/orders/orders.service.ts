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
        price: unitPrice,
      });
    }

    // Crear la orden
    const order = this.ordersRepository.create({
      table_id,
      waiter_id: table.waiter_id,
      bar_id: table.waiter?.bar?.id || 1,
      total_amount: totalAmount,
      notes,
      status: OrderStatus.PENDING,
    });

    const savedOrder = await this.ordersRepository.save(order);

    // Crear los items de la orden
    for (const item of orderItems) {
      const orderItem = this.orderItemsRepository.create({
        order_id: savedOrder.id,
        inventory_id: item.inventory_id,
        quantity: item.quantity,
        price: item.price,
      });
      await this.orderItemsRepository.save(orderItem);
    }

    // Marcar mesa como ocupada si estaba disponible
    if (table.status === TableStatus.AVAILABLE) {
      await this.tablesService.updateStatus(table_id, TableStatus.OCCUPIED, null);
    }

    return savedOrder;
  }

  async createCustomerOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const { table_id, items, notes } = createOrderDto;

    // Verificar que la mesa existe
    const table = await this.tablesService.findOne(table_id);

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
        price: unitPrice,
      });

      // NO reducir stock todavía - se reducirá cuando se entregue la orden
      // Solo se verifica que hay stock disponible arriba
    }

    // Crear la orden
    const newOrder = this.ordersRepository.create({
      table_id,
      waiter_id: table.waiter_id, // Assign to table's waiter
      bar_id: table.waiter?.bar?.id || 1, // Default to bar 1 if no bar assigned
      status: OrderStatus.PENDING,
      total_amount: totalAmount,
      notes,
    });

    const savedOrder = await this.ordersRepository.save(newOrder);

    // Crear los items de la orden
    for (const item of orderItems) {
      const orderItem = this.orderItemsRepository.create({
        order_id: savedOrder.id,
        inventory_id: item.inventory_id,
        quantity: item.quantity,
        price: item.price,
      });
      await this.orderItemsRepository.save(orderItem);
    }

    // Marcar mesa como ocupada si estaba disponible
    if (table.status === TableStatus.AVAILABLE) {
      await this.tablesService.updateStatus(table_id, TableStatus.OCCUPIED, null);
    }

    return savedOrder;
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
      .leftJoinAndSelect('table.waiter', 'tableWaiter')
      .leftJoinAndSelect('order.waiter', 'waiter')
      .leftJoinAndSelect('waiter.user', 'waiterUser')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.inventory', 'inventory')
      .where('tableWaiter.user_id = :userId', { userId })
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

  async markPreparing(id: number, user: any): Promise<Order> {
    return await this.updateStatus(id, OrderStatus.PREPARING, user);
  }

  async markReady(id: number, user: any): Promise<Order> {
    const order = await this.updateStatus(id, OrderStatus.READY, user);
    
    // NO actualizar stock aquí - se actualizará cuando se entregue
    // El stock se descuenta al entregar, no al marcar como listo
    
    return order;
  }

  async markDelivered(id: number, user: any): Promise<Order> {
    const order = await this.updateStatus(id, OrderStatus.DELIVERED, user);
    
    // AQUÍ es donde realmente descontamos el stock del inventario
    // Solo cuando la orden se entrega efectivamente
    for (const item of order.orderItems) {
      // Verificar stock actual antes de descontar
      const currentInventory = await this.inventoryService.findOne(item.inventory_id);
      
      if (currentInventory.stock < item.quantity) {
        console.warn(`Warning: Insufficient stock for item ${currentInventory.name}. Required: ${item.quantity}, Available: ${currentInventory.stock}`);
        // Descontamos solo lo disponible
        await this.inventoryService.updateStock(
          item.inventory_id,
          -currentInventory.stock // Negativo porque updateStock suma la diferencia
        );
      } else {
        // Stock suficiente, descontar la cantidad pedida
        await this.inventoryService.updateStock(
          item.inventory_id,
          -item.quantity // Negativo porque updateStock suma la diferencia
        );
      }
    }
    
    // Liberar la mesa cuando se entrega la orden
    await this.tablesService.updateStatus(order.table_id, TableStatus.AVAILABLE, null);
    
    return order;
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

  async getItemsStats(): Promise<any> {
    // Items más vendidos
    const mostSoldItems = await this.orderItemsRepository
      .createQueryBuilder('oi')
      .select([
        'oi.inventory_id as inventory_id',
        'i.name as name',
        'i.category as category',
        'i.sale_price as price',
        'SUM(oi.quantity) as total_sold',
        'COUNT(DISTINCT oi.order_id) as orders_count',
        'SUM(oi.price * oi.quantity) as total_revenue'
      ])
      .leftJoin('inventory', 'i', 'oi.inventory_id = i.id')
      .leftJoin('orders', 'o', 'oi.order_id = o.id')
      .where('o.status IN (:...statuses)', { 
        statuses: [OrderStatus.DELIVERED, OrderStatus.COMPLETED] 
      })
      .groupBy('oi.inventory_id, i.name, i.category, i.sale_price')
      .orderBy('total_sold', 'DESC')
      .limit(10)
      .getRawMany();

    // Items menos vendidos (que han sido vendidos al menos una vez)
    const leastSoldItems = await this.orderItemsRepository
      .createQueryBuilder('oi')
      .select([
        'oi.inventory_id as inventory_id',
        'i.name as name',
        'i.category as category',
        'i.sale_price as price',
        'SUM(oi.quantity) as total_sold',
        'COUNT(DISTINCT oi.order_id) as orders_count',
        'SUM(oi.price * oi.quantity) as total_revenue'
      ])
      .leftJoin('inventory', 'i', 'oi.inventory_id = i.id')
      .leftJoin('orders', 'o', 'oi.order_id = o.id')
      .where('o.status IN (:...statuses)', { 
        statuses: [OrderStatus.DELIVERED, OrderStatus.COMPLETED] 
      })
      .groupBy('oi.inventory_id, i.name, i.category, i.sale_price')
      .orderBy('total_sold', 'ASC')
      .limit(5)
      .getRawMany();

    // Items por categoría
    const itemsByCategory = await this.orderItemsRepository
      .createQueryBuilder('oi')
      .select([
        'i.category as category',
        'SUM(oi.quantity) as total_sold',
        'COUNT(DISTINCT oi.inventory_id) as unique_items',
        'SUM(oi.price * oi.quantity) as total_revenue'
      ])
      .leftJoin('inventory', 'i', 'oi.inventory_id = i.id')
      .leftJoin('orders', 'o', 'oi.order_id = o.id')
      .where('o.status IN (:...statuses)', { 
        statuses: [OrderStatus.DELIVERED, OrderStatus.COMPLETED] 
      })
      .groupBy('i.category')
      .orderBy('total_sold', 'DESC')
      .getRawMany();

    // Items nunca vendidos - obtenemos todos los items y luego filtramos
    const allItems = await this.inventoryService.findAll();
    const soldItemIds = mostSoldItems.concat(leastSoldItems).map(item => item.inventory_id);
    const neverSoldItems = allItems.filter(item => !soldItemIds.includes(item.id));

    // Análisis de rentabilidad (items con mayor margen)
    const profitabilityAnalysis = await this.orderItemsRepository
      .createQueryBuilder('oi')
      .select([
        'oi.inventory_id as inventory_id',
        'i.name as name',
        'i.category as category',
        'i.cost_price as cost_price',
        'i.sale_price as sale_price',
        'SUM(oi.quantity) as total_sold',
        'SUM(oi.price * oi.quantity) as total_revenue',
        'SUM(oi.quantity * i.cost_price) as total_cost',
        '(SUM(oi.price * oi.quantity) - SUM(oi.quantity * i.cost_price)) as total_profit',
        '((SUM(oi.price * oi.quantity) - SUM(oi.quantity * i.cost_price)) / SUM(oi.price * oi.quantity) * 100) as profit_margin'
      ])
      .leftJoin('inventory', 'i', 'oi.inventory_id = i.id')
      .leftJoin('orders', 'o', 'oi.order_id = o.id')
      .where('o.status IN (:...statuses)', { 
        statuses: [OrderStatus.DELIVERED, OrderStatus.COMPLETED] 
      })
      .andWhere('i.cost_price IS NOT NULL')
      .groupBy('oi.inventory_id, i.name, i.category, i.cost_price, i.sale_price')
      .orderBy('total_profit', 'DESC')
      .limit(10)
      .getRawMany();

    // Tendencias recientes (últimos 7 días)
    const recentTrends = await this.orderItemsRepository
      .createQueryBuilder('oi')
      .select([
        'oi.inventory_id as inventory_id',
        'i.name as name',
        'SUM(oi.quantity) as recent_sales',
        'COUNT(DISTINCT oi.order_id) as recent_orders'
      ])
      .leftJoin('inventory', 'i', 'oi.inventory_id = i.id')
      .leftJoin('orders', 'o', 'oi.order_id = o.id')
      .where('o.status IN (:...statuses)', { 
        statuses: [OrderStatus.DELIVERED, OrderStatus.COMPLETED] 
      })
      .andWhere('o.created_at >= :sevenDaysAgo', { 
        sevenDaysAgo: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
      })
      .groupBy('oi.inventory_id, i.name')
      .orderBy('recent_sales', 'DESC')
      .limit(5)
      .getRawMany();

    return {
      mostSoldItems: mostSoldItems.map(item => ({
        ...item,
        total_sold: parseInt(item.total_sold),
        orders_count: parseInt(item.orders_count),
        total_revenue: parseFloat(item.total_revenue),
        price: parseFloat(item.price)
      })),
      leastSoldItems: leastSoldItems.map(item => ({
        ...item,
        total_sold: parseInt(item.total_sold),
        orders_count: parseInt(item.orders_count),
        total_revenue: parseFloat(item.total_revenue),
        price: parseFloat(item.price)
      })),
      itemsByCategory: itemsByCategory.map(cat => ({
        ...cat,
        total_sold: parseInt(cat.total_sold),
        unique_items: parseInt(cat.unique_items),
        total_revenue: parseFloat(cat.total_revenue)
      })),
      neverSoldItems,
      profitabilityAnalysis: profitabilityAnalysis.map(item => ({
        ...item,
        total_sold: parseInt(item.total_sold),
        total_revenue: parseFloat(item.total_revenue),
        total_cost: parseFloat(item.total_cost),
        total_profit: parseFloat(item.total_profit),
        profit_margin: parseFloat(item.profit_margin),
        cost_price: parseFloat(item.cost_price),
        sale_price: parseFloat(item.sale_price)
      })),
      recentTrends: recentTrends.map(item => ({
        ...item,
        recent_sales: parseInt(item.recent_sales),
        recent_orders: parseInt(item.recent_orders)
      }))
    };
  }
}