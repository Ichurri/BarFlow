import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('api/payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate/:orderId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.WAITER, UserRole.ADMIN)
  async initiatePayment(@Param('orderId') orderId: string, @Request() req) {
    return this.paymentsService.initiatePayment(+orderId, req.user.id);
  }

  @Patch(':id/verify')
  @UseGuards(RolesGuard)
  @Roles(UserRole.BAR, UserRole.ADMIN)
  async verifyPayment(@Param('id') id: string, @Request() req) {
    return this.paymentsService.verifyPayment(+id, req.user.id, req.user.role);
  }

  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.BAR, UserRole.ADMIN)
  async rejectPayment(
    @Param('id') id: string, 
    @Body() body: { reason?: string }, 
    @Request() req
  ) {
    return this.paymentsService.rejectPayment(+id, req.user.id, req.user.role, body.reason);
  }

  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles(UserRole.BAR, UserRole.ADMIN)
  async getPendingPayments(@Request() req) {
    return this.paymentsService.getPendingPayments(req.user.role);
  }

  @Get('order/:orderId')
  async getPaymentByOrderId(@Param('orderId') orderId: string) {
    return this.paymentsService.getPaymentByOrderId(+orderId);
  }

  @Get(':id/receipt')
  async generateReceipt(@Param('id') id: string) {
    return this.paymentsService.generateReceipt(+id);
  }

  @Get(':id/history')
  @UseGuards(RolesGuard)
  @Roles(UserRole.BAR, UserRole.ADMIN)
  async getPaymentHistory(@Param('id') id: string) {
    return this.paymentsService.getPaymentHistory(+id);
  }
}