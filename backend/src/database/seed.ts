import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../app.module';
import { User, UserRole } from '../users/user.entity';
import { Bar } from '../bars/bar.entity';
import { Waiter } from '../waiters/waiter.entity';
import { Table, TableStatus } from '../tables/table.entity';
import { Inventory } from '../inventory/inventory.entity';
import { Order, OrderStatus } from '../orders/order.entity';
import { OrderItem } from '../orders/order-item.entity';
import * as bcrypt from 'bcryptjs';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userRepository = app.get(getRepositoryToken(User));
  const barRepository = app.get(getRepositoryToken(Bar));
  const waiterRepository = app.get(getRepositoryToken(Waiter));
  const tableRepository = app.get(getRepositoryToken(Table));
  const inventoryRepository = app.get(getRepositoryToken(Inventory));
  const orderRepository = app.get(getRepositoryToken(Order));
  const orderItemRepository = app.get(getRepositoryToken(OrderItem));

  // Clear existing data in correct order (respecting foreign key constraints)
  console.log('Clearing existing data...');
  await inventoryRepository.query('DELETE FROM order_items');
  await inventoryRepository.query('DELETE FROM payment_logs');
  await inventoryRepository.query('DELETE FROM payments');
  await inventoryRepository.query('DELETE FROM orders');
  await inventoryRepository.query('DELETE FROM tables');
  await inventoryRepository.query('DELETE FROM waiters');
  await inventoryRepository.query('DELETE FROM bars');
  await inventoryRepository.query('DELETE FROM inventory');
  await inventoryRepository.query('DELETE FROM users');

  // Create admin user
  console.log('Creating admin user...');
  const adminUser = userRepository.create({
    username: 'admin',
    password: await bcrypt.hash('admin123', 10),
    role: UserRole.ADMIN,
  });
  await userRepository.save(adminUser);

  // Create bars
  console.log('Creating bars...');
  const mainBar = barRepository.create({
    name: 'Main Bar',
  });
  await barRepository.save(mainBar);

  const vipBar = barRepository.create({
    name: 'VIP Bar',
  });
  await barRepository.save(vipBar);

  // Create bar users
  console.log('Creating bar users...');
  const barUser1 = userRepository.create({
    username: 'baruser1',
    password: await bcrypt.hash('bar123', 10),
    role: UserRole.BAR,
  });
  await userRepository.save(barUser1);

  const barUser2 = userRepository.create({
    username: 'baruser2',
    password: await bcrypt.hash('bar123', 10),
    role: UserRole.BAR,
  });
  await userRepository.save(barUser2);

  // Create waiter users
  console.log('Creating waiter users...');
  const waiterUser1 = userRepository.create({
    username: 'waiter1',
    password: await bcrypt.hash('waiter123', 10),
    role: UserRole.WAITER,
  });
  await userRepository.save(waiterUser1);

  const waiterUser2 = userRepository.create({
    username: 'waiter2',
    password: await bcrypt.hash('waiter123', 10),
    role: UserRole.WAITER,
  });
  await userRepository.save(waiterUser2);

  // Create waiters
  console.log('Creating waiters...');
  const waiter1 = waiterRepository.create({
    user_id: waiterUser1.id,
    bar_id: mainBar.id,
  });
  await waiterRepository.save(waiter1);

  const waiter2 = waiterRepository.create({
    user_id: waiterUser2.id,
    bar_id: vipBar.id,
  });
  await waiterRepository.save(waiter2);

  // Create tables
  console.log('Creating tables...');
  const tables = [];
  for (let i = 1; i <= 10; i++) {
    const table = tableRepository.create({
      qr_code: `TABLE_${i.toString().padStart(3, '0')}`,
      waiter_id: i <= 5 ? waiter1.id : waiter2.id,
      status: i <= 2 ? TableStatus.OCCUPIED : TableStatus.AVAILABLE,
      capacity: Math.floor(Math.random() * 6) + 2, // 2-8 personas
      location: i <= 5 ? 'Main Floor' : 'VIP Area',
    });
    tables.push(table);
  }
  await tableRepository.save(tables);

  // Create inventory items
  console.log('Creating inventory items...');
  const inventoryItems = [
    {
      name: 'Corona Beer',
      category: 'Beer',
      cost_price: 2.50,
      sale_price: 5.00,
      photo_url: 'https://example.com/corona.jpg',
      stock: 100,
      min_stock: 10,
    },
    {
      name: 'Vodka Shot',
      category: 'Spirits',
      cost_price: 3.00,
      sale_price: 8.00,
      photo_url: 'https://example.com/vodka.jpg',
      stock: 50,
      min_stock: 5,
    },
    {
      name: 'Mojito',
      category: 'Cocktails',
      cost_price: 4.00,
      sale_price: 12.00,
      photo_url: 'https://example.com/mojito.jpg',
      stock: 30,
      min_stock: 5,
    },
    {
      name: 'Red Wine Glass',
      category: 'Wine',
      cost_price: 6.00,
      sale_price: 15.00,
      photo_url: 'https://example.com/wine.jpg',
      stock: 25,
      min_stock: 3,
    },
    {
      name: 'Whiskey Neat',
      category: 'Spirits',
      cost_price: 8.00,
      sale_price: 20.00,
      photo_url: 'https://example.com/whiskey.jpg',
      stock: 40,
      min_stock: 5,
    },
  ];

  for (const item of inventoryItems) {
    const inventoryItem = inventoryRepository.create(item);
    await inventoryRepository.save(inventoryItem);
  }

  // Create sample orders
  console.log('Creating sample orders...');
  const sampleOrders = [
    {
      table_id: tables[0].id, // Mesa ocupada
      waiter_id: waiter1.id,
      bar_id: mainBar.id,
      status: OrderStatus.PENDING,
      total_amount: 17.00,
      notes: 'Sin hielo en el mojito',
      items: [
        { inventory_id: 1, quantity: 2, unit_price: 5.00 }, // 2 Corona
        { inventory_id: 3, quantity: 1, unit_price: 12.00 }, // 1 Mojito
      ]
    },
    {
      table_id: tables[1].id, // Mesa ocupada
      waiter_id: waiter1.id,
      bar_id: mainBar.id,
      status: OrderStatus.READY,
      total_amount: 23.00,
      notes: 'Mesa VIP',
      items: [
        { inventory_id: 2, quantity: 1, unit_price: 8.00 }, // 1 Vodka Shot
        { inventory_id: 4, quantity: 1, unit_price: 15.00 }, // 1 Red Wine
      ]
    }
  ];

  for (const orderData of sampleOrders) {
    const { items, ...orderInfo } = orderData;
    
    const order = orderRepository.create(orderInfo);
    const savedOrder = await orderRepository.save(order);

    for (const item of items) {
      const orderItem = orderItemRepository.create({
        ...item,
        order_id: savedOrder.id,
        subtotal: item.unit_price * item.quantity,
      });
      await orderItemRepository.save(orderItem);
    }
  }

  console.log('Seeding completed successfully!');
  console.log('\nCreated users:');
  console.log('- Admin: username="admin", password="admin123"');
  console.log('- Bar User 1: username="baruser1", password="bar123"');
  console.log('- Bar User 2: username="baruser2", password="bar123"');
  console.log('- Waiter 1: username="waiter1", password="waiter123"');
  console.log('- Waiter 2: username="waiter2", password="waiter123"');
  console.log('\nCreated:');
  console.log('- 2 bars (Main Bar, VIP Bar)');
  console.log('- 2 waiters assigned to bars');
  console.log('- 10 tables with QR codes (2 occupied, 8 available)');
  console.log('- 5 inventory items with different categories');
  console.log('- 2 sample orders (1 pending, 1 ready)');

  await app.close();
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});