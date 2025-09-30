import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus, PaymentMethod } from './payment.entity';
import { PaymentLog, PaymentLogAction } from './payment-log.entity';
import { Order, OrderStatus } from '../orders/order.entity';
import { Table, TableStatus } from '../tables/table.entity';
import { UserRole } from '../users/user.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(PaymentLog)
    private paymentLogsRepository: Repository<PaymentLog>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Table)
    private tablesRepository: Repository<Table>,
  ) {}

  // Iniciar proceso de pago para una orden
  async initiatePayment(orderId: number, userId: number) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['orderItems', 'table', 'payment'],
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    if (order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException('La orden debe estar entregada para proceder al pago');
    }

    if (order.payment) {
      throw new BadRequestException('Esta orden ya tiene un pago asociado');
    }

    // Crear el payment record
    const payment = this.paymentsRepository.create({
      order_id: orderId,
      method: PaymentMethod.CASH, // Solo cash para MVP
      status: PaymentStatus.PENDING,
    });

    const savedPayment = await this.paymentsRepository.save(payment);

    // Actualizar estado de la orden
    await this.ordersRepository.update(orderId, {
      status: OrderStatus.PAYMENT_PENDING,
    });

    // Log de creación de pago
    await this.createPaymentLog(savedPayment.id, PaymentLogAction.CREATED, userId);

    return {
      ...savedPayment,
      order: {
        id: order.id,
        total_amount: order.total_amount,
        table: {
          qr_code: order.table.qr_code,
        },
      },
    };
  }

  // Verificar pago en efectivo (solo BAR puede hacerlo)
  async verifyPayment(paymentId: number, userId: number, userRole: UserRole) {
    if (userRole !== UserRole.BAR && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Solo el personal del bar puede verificar pagos');
    }

    const payment = await this.paymentsRepository.findOne({
      where: { id: paymentId },
      relations: ['order', 'order.table'],
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Este pago ya ha sido procesado');
    }

    // Verificar el pago
    await this.paymentsRepository.update(paymentId, {
      status: PaymentStatus.VERIFIED,
      verified_by: userId,
    });

    // Completar la orden
    await this.ordersRepository.update(payment.order_id, {
      status: OrderStatus.COMPLETED,
    });

    // Liberar la mesa
    await this.tablesRepository.update(payment.order.table_id, {
      status: TableStatus.AVAILABLE,
    });

    // Log de verificación
    await this.createPaymentLog(paymentId, PaymentLogAction.VERIFIED, userId);

    return {
      message: 'Pago verificado exitosamente',
      payment_id: paymentId,
      order_id: payment.order_id,
      table_freed: true,
    };
  }

  // Rechazar pago (solo BAR)
  async rejectPayment(paymentId: number, userId: number, userRole: UserRole, reason?: string) {
    if (userRole !== UserRole.BAR && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Solo el personal del bar puede rechazar pagos');
    }

    const payment = await this.paymentsRepository.findOne({
      where: { id: paymentId },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Este pago ya ha sido procesado');
    }

    // Rechazar el pago
    await this.paymentsRepository.update(paymentId, {
      status: PaymentStatus.REJECTED,
      verified_by: userId,
    });

    // Regresar orden a DELIVERED
    await this.ordersRepository.update(payment.order_id, {
      status: OrderStatus.DELIVERED,
    });

    // Log de rechazo
    await this.createPaymentLog(paymentId, PaymentLogAction.REJECTED, userId, reason);

    return {
      message: 'Pago rechazado',
      payment_id: paymentId,
      order_id: payment.order_id,
      reason: reason || 'No especificada',
    };
  }

  // Obtener pagos pendientes (para BAR)
  async getPendingPayments(userRole: UserRole) {
    if (userRole !== UserRole.BAR && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Solo el personal del bar puede ver pagos pendientes');
    }

    return this.paymentsRepository.find({
      where: { status: PaymentStatus.PENDING },
      relations: ['order', 'order.table', 'order.waiter', 'order.waiter.user'],
      order: { created_at: 'ASC' },
    });
  }

  // Obtener pago por ID de orden
  async getPaymentByOrderId(orderId: number) {
    const payment = await this.paymentsRepository.findOne({
      where: { order_id: orderId },
      relations: ['order', 'verifiedBy'],
    });

    if (!payment) {
      throw new NotFoundException('No se encontró pago para esta orden');
    }

    return payment;
  }

  // Generar recibo básico
  async generateReceipt(paymentId: number) {
    const payment = await this.paymentsRepository.findOne({
      where: { id: paymentId },
      relations: ['order', 'order.orderItems', 'order.orderItems.inventory', 'order.table', 'verifiedBy'],
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    if (payment.status !== PaymentStatus.VERIFIED) {
      throw new BadRequestException('El pago debe estar verificado para generar recibo');
    }

    return {
      receipt_id: `RCP-${payment.id.toString().padStart(6, '0')}`,
      payment_id: payment.id,
      order_id: payment.order.id,
      table: payment.order.table.qr_code,
      items: payment.order.orderItems.map(item => ({
        name: item.inventory.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: Number(item.price) * item.quantity,
      })),
      total_amount: payment.order.total_amount,
      payment_method: payment.method,
      verified_by: payment.verifiedBy?.username || 'Sistema',
      payment_date: payment.created_at,
      verification_date: payment.updated_at || payment.created_at,
    };
  }

  // Crear log de pago
  private async createPaymentLog(paymentId: number, action: PaymentLogAction, userId: number, notes?: string) {
    const log = this.paymentLogsRepository.create({
      payment_id: paymentId,
      action,
      user_id: userId,
      notes,
    });

    await this.paymentLogsRepository.save(log);
  }

  // Obtener historial de un pago
  async getPaymentHistory(paymentId: number) {
    return this.paymentLogsRepository.find({
      where: { payment_id: paymentId },
      relations: ['user'],
      order: { created_at: 'ASC' },
    });
  }

  // Iniciar proceso de pago para cliente (público)
  async initiateCustomerPayment(orderId: number, method: PaymentMethod) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['orderItems', 'table', 'payment'],
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    if (order.payment) {
      throw new BadRequestException('Esta orden ya tiene un pago asociado');
    }

    // Crear el payment record
    const payment = this.paymentsRepository.create({
      order_id: orderId,
      method: method,
      status: PaymentStatus.PENDING,
    });

    const savedPayment = await this.paymentsRepository.save(payment);

    // Crear log del pago iniciado
    const log = this.paymentLogsRepository.create({
      payment_id: savedPayment.id,
      action: PaymentLogAction.CREATED,
      user_id: null, // Cliente público, sin user_id
      notes: `Pago iniciado por cliente con método: ${method}`,
    });
    await this.paymentLogsRepository.save(log);

    return {
      ...savedPayment,
      order: {
        id: order.id,
        table: order.table,
        total_amount: order.total_amount,
      },
    };
  }

  // Confirmar pago por parte del cliente (para QR)
  async confirmCustomerPayment(paymentId: number) {
    const payment = await this.paymentsRepository.findOne({
      where: { id: paymentId },
      relations: ['order', 'order.table'],
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Este pago ya ha sido procesado');
    }

    if (payment.method !== PaymentMethod.QR) {
      throw new BadRequestException('Solo se pueden confirmar pagos por QR');
    }

    // Marcar como confirmado por el cliente, pero aún pendiente de verificación por staff
    const log = this.paymentLogsRepository.create({
      payment_id: paymentId,
      action: PaymentLogAction.CREATED, // Usamos CREATED como log general
      user_id: null, // Cliente público
      notes: 'Pago confirmado por cliente - pendiente de verificación por staff',
    });
    await this.paymentLogsRepository.save(log);

    return {
      ...payment,
      status: 'customer_confirmed', // Status especial para mostrar en frontend
      message: 'Pago confirmado. El staff verificará tu pago en breve.',
    };
  }
}