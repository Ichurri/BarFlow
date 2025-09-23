import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TablesService } from './tables.service';
import { CreateTableDto, UpdateTableDto } from './dto/table.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('tables')
@UseGuards(JwtAuthGuard)
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createTableDto: CreateTableDto) {
    return this.tablesService.create(createTableDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.tablesService.findAll(req.user.role, req.user.id);
  }

  @Get('my-tables')
  @UseGuards(RolesGuard)
  @Roles(UserRole.WAITER)
  getMyTables(@Request() req) {
    return this.tablesService.getTablesByWaiter(req.user.id);
  }

  @Get('qr/:qrCode')
  findByQRCode(@Param('qrCode') qrCode: string) {
    return this.tablesService.findByQRCode(qrCode);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tablesService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAITER)
  update(@Param('id') id: string, @Body() updateTableDto: UpdateTableDto, @Request() req) {
    return this.tablesService.update(+id, updateTableDto, req.user);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAITER)
  updateStatus(@Param('id') id: string, @Body() statusDto: { status: string }, @Request() req) {
    return this.tablesService.updateStatus(+id, statusDto.status, req.user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.tablesService.remove(+id);
  }
}