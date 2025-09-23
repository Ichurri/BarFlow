import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto, OrderStatus } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    return this.ordersService.create(createOrderDto, req.user);
  }

  @Post('qr/:qrCode')
  createOrderByQR(@Param('qrCode') qrCode: string, @Body() createOrderDto: Omit<CreateOrderDto, 'table_id'>) {
    return this.ordersService.createOrderByQR(qrCode, createOrderDto);
  }

  @Get()
  findAll(@Request() req, @Query('status') status?: OrderStatus) {
    return this.ordersService.findAll(req.user.role, req.user.id, status);
  }

  @Get('my-orders')
  @UseGuards(RolesGuard)
  @Roles(UserRole.WAITER)
  getMyOrders(@Request() req, @Query('status') status?: OrderStatus) {
    return this.ordersService.getOrdersByWaiter(req.user.id, status);
  }

  @Get('table/:tableId')
  getOrdersByTable(@Param('tableId') tableId: string, @Request() req) {
    return this.ordersService.getOrdersByTable(+tableId, req.user);
  }

  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles(UserRole.BAR, UserRole.ADMIN)
  getPendingOrders(@Request() req) {
    return this.ordersService.getPendingOrders(req.user);
  }

  @Get('ready')
  @UseGuards(RolesGuard)
  @Roles(UserRole.WAITER, UserRole.ADMIN)
  getReadyOrders(@Request() req) {
    return this.ordersService.getReadyOrders(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.ordersService.findOne(+id, req.user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto, @Request() req) {
    return this.ordersService.update(+id, updateOrderDto, req.user);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() statusDto: { status: OrderStatus }, @Request() req) {
    return this.ordersService.updateStatus(+id, statusDto.status, req.user);
  }

  @Patch(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles(UserRole.BAR, UserRole.ADMIN)
  confirmOrder(@Param('id') id: string, @Request() req) {
    return this.ordersService.confirmOrder(+id, req.user);
  }

  @Patch(':id/ready')
  @UseGuards(RolesGuard)
  @Roles(UserRole.BAR, UserRole.ADMIN)
  markReady(@Param('id') id: string, @Request() req) {
    return this.ordersService.markReady(+id, req.user);
  }

  @Patch(':id/deliver')
  @UseGuards(RolesGuard)
  @Roles(UserRole.WAITER, UserRole.ADMIN)
  markDelivered(@Param('id') id: string, @Request() req) {
    return this.ordersService.markDelivered(+id, req.user);
  }

  @Patch(':id/request-payment')
  @UseGuards(RolesGuard)
  @Roles(UserRole.WAITER, UserRole.ADMIN)
  requestPayment(@Param('id') id: string, @Request() req) {
    return this.ordersService.requestPayment(+id, req.user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}