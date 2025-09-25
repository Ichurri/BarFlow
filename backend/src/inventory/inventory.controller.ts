import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Request,
  Query
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto, UpdateInventoryDto } from './dto/inventory.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../auth/public.decorator';
import { UserRole } from '../users/user.entity';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(createInventoryDto);
  }

  @Get()
  findAll(@Request() req, @Query('category') category?: string) {
    const userRole = req.user?.role;
    
    if (category) {
      return this.inventoryService.findByCategory(category, userRole);
    }
    
    return this.inventoryService.findAll(userRole);
  }

  @Get('public')
  @Public()
  getPublicItems(@Query('category') category?: string) {
    // Public endpoint for customer ordering - no authentication required
    // Only shows items that are in stock and hides cost prices
    if (category) {
      return this.inventoryService.findByCategory(category);
    }
    
    return this.inventoryService.getAvailableItems();
  }

  @Get('available')
  getAvailable(@Request() req) {
    const userRole = req.user?.role;
    return this.inventoryService.getAvailableItems(userRole);
  }

  @Get('low-stock')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getLowStock() {
    return this.inventoryService.findLowStock();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    const userRole = req.user?.role;
    return this.inventoryService.findOne(+id, userRole);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateInventoryDto: UpdateInventoryDto) {
    return this.inventoryService.update(+id, updateInventoryDto);
  }

  @Patch(':id/stock')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStock(
    @Param('id') id: string, 
    @Body() body: { quantity: number }
  ) {
    return this.inventoryService.updateStock(+id, body.quantity);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(+id);
  }
}