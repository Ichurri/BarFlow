import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../app.module';
import { User, UserRole } from '../users/user.entity';
import { Bar } from '../bars/bar.entity';
import { Waiter } from '../waiters/waiter.entity';
import { Table, TableStatus } from '../tables/table.entity';
import * as bcrypt from 'bcryptjs';

async function seedNightclub() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userRepository = app.get(getRepositoryToken(User));
  const waiterRepository = app.get(getRepositoryToken(Waiter));
  const tableRepository = app.get(getRepositoryToken(Table));

  console.log('🎵 Starting Nightclub Seed...');

  // Verificar que exista el bar principal
  const barRepository = app.get(getRepositoryToken(Bar));
  let mainBar = await barRepository.findOne({ where: { name: 'Main Bar' } });
  
  if (!mainBar) {
    console.log('Creating Main Bar...');
    mainBar = barRepository.create({
      name: 'Main Bar',
    });
    await barRepository.save(mainBar);
  }

  // Crear 6 usuarios meseros
  console.log('Creating 6 waiter users...');
  const waiterUsers = [];
  const waiterNames = ['mesero1', 'mesero2', 'mesero3', 'mesero4', 'mesero5', 'mesero6'];
  
  for (let i = 0; i < 6; i++) {
    const waiterUser = userRepository.create({
      username: waiterNames[i],
      password: await bcrypt.hash('mesero123', 10),
      role: UserRole.WAITER,
    });
    const savedWaiterUser = await userRepository.save(waiterUser);
    waiterUsers.push(savedWaiterUser);
  }

  // Crear 6 perfiles de meseros
  console.log('Creating 6 waiter profiles...');
  const waiters = [];
  for (let i = 0; i < 6; i++) {
    const waiter = waiterRepository.create({
      user_id: waiterUsers[i].id,
      bar_id: mainBar.id,
    });
    const savedWaiter = await waiterRepository.save(waiter);
    waiters.push(savedWaiter);
  }

  // Crear 48 mesas para la discoteca
  console.log('Creating 48 tables for nightclub...');
  const tables = [];
  
  for (let i = 1; i <= 48; i++) {
    let tableType: string;
    let location: string;
    let capacity: number;
    let waiterIndex: number;
    
    // Mesas 1-18: VIP
    if (i <= 18) {
      tableType = 'VIP';
      location = 'VIP Area';
      capacity = Math.floor(Math.random() * 4) + 4; // 4-8 personas para VIP
    } 
    // Mesas 19-48: Main Floor
    else {
      tableType = 'Main Floor';
      location = 'Main Floor';
      capacity = Math.floor(Math.random() * 6) + 2; // 2-8 personas para Main Floor
    }
    
    // Asignar mesero (cada mesero maneja 8 mesas: 48/6 = 8)
    waiterIndex = Math.floor((i - 1) / 8);
    
    const table = tableRepository.create({
      qr_code: `NIGHTCLUB_${i.toString().padStart(3, '0')}`,
      waiter_id: waiters[waiterIndex].id,
      status: TableStatus.AVAILABLE, // Todas disponibles como solicitado
      capacity: capacity,
      location: location,
    });
    
    tables.push(table);
  }
  
  await tableRepository.save(tables);

  console.log('🎉 Nightclub Seeding completed successfully!');
  console.log('\n📋 Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n👥 WAITERS CREATED:');
  waiterNames.forEach((name, index) => {
    const startTable = (index * 8) + 1;
    const endTable = (index + 1) * 8;
    console.log(`   • ${name} - password: "mesero123" - Tables: ${startTable}-${endTable}`);
  });

  console.log('\n🏢 TABLES DISTRIBUTION:');
  console.log('   📍 VIP Area (Tables 1-18):');
  console.log('      • 18 VIP tables');
  console.log('      • Capacity: 4-8 people each');
  console.log('      • Status: ALL AVAILABLE');
  
  console.log('\n   📍 Main Floor (Tables 19-48):');
  console.log('      • 30 Main Floor tables');
  console.log('      • Capacity: 2-8 people each');
  console.log('      • Status: ALL AVAILABLE');

  console.log('\n👨‍💼 WAITER ASSIGNMENTS:');
  console.log('   • mesero1: Tables 1-8    (6 VIP + 2 Main Floor)');
  console.log('   • mesero2: Tables 9-16   (10 VIP + 0 Main Floor)');
  console.log('   • mesero3: Tables 17-24  (2 VIP + 6 Main Floor)');
  console.log('   • mesero4: Tables 25-32  (0 VIP + 8 Main Floor)');
  console.log('   • mesero5: Tables 33-40  (0 VIP + 8 Main Floor)');
  console.log('   • mesero6: Tables 41-48  (0 VIP + 8 Main Floor)');

  console.log('\n✅ Ready for nightclub operations!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await app.close();
}

seedNightclub().catch((error) => {
  console.error('❌ Nightclub seeding failed:', error);
  process.exit(1);
});