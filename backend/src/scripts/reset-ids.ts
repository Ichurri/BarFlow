import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();

async function resetDatabaseIds() {
  const configService = new ConfigService();
  
  const dataSource = new DataSource({
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: +configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_DATABASE'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false,
    ssl: configService.get('DB_SSL') === 'true' ? {
      rejectUnauthorized: false
    } : false,
  });
  
  try {
    await dataSource.initialize();
    console.log('🔗 Conectado a la base de datos');

    // Confirmar la acción
    console.log('⚠️  ADVERTENCIA: Esta acción eliminará TODOS los datos y reiniciará los IDs');
    console.log('Esta operación NO se puede deshacer.');
    
    const queryRunner = dataSource.createQueryRunner();
    
    console.log('🧹 Eliminando datos de las tablas...');
    
    // Eliminar datos en orden correcto (por dependencias)
    await queryRunner.query('TRUNCATE TABLE order_items CASCADE');
    await queryRunner.query('TRUNCATE TABLE payment_logs CASCADE');
    await queryRunner.query('TRUNCATE TABLE payments CASCADE');
    await queryRunner.query('TRUNCATE TABLE orders CASCADE');
    await queryRunner.query('TRUNCATE TABLE inventory CASCADE');
    await queryRunner.query('TRUNCATE TABLE tables CASCADE');
    await queryRunner.query('TRUNCATE TABLE users CASCADE');

    console.log('🔄 Reiniciando secuencias de IDs...');
    
    // Reiniciar secuencias
    const sequences = [
      'users_id_seq',
      'tables_id_seq', 
      'inventory_id_seq',
      'orders_id_seq',
      'payments_id_seq',
      'payment_logs_id_seq',
      'order_items_id_seq'
    ];

    for (const sequence of sequences) {
      await queryRunner.query(`ALTER SEQUENCE ${sequence} RESTART WITH 1`);
      console.log(`✅ Secuencia ${sequence} reiniciada`);
    }

    // Verificar secuencias
    console.log('📊 Verificando secuencias reiniciadas:');
    const result = await queryRunner.query(`
      SELECT 
          schemaname,
          sequencename,
          last_value,
          start_value,
          increment_by
      FROM pg_sequences 
      WHERE schemaname = 'public'
      ORDER BY sequencename
    `);

    console.table(result);

    // Insertar datos básicos de prueba (opcional)
    console.log('📝 Insertando datos básicos de prueba...');
    
    // Hash para password "admin123"
    const adminPasswordHash = '$2b$10$CwTycUXWue0Thq9StjUM0uBUcUKBxkFAMEUKlnqw.NuSJWsQl6kIe';
    
    await queryRunner.query(`
      INSERT INTO users (username, email, password, role, created_at, updated_at) 
      VALUES ('admin', 'admin@barflow.com', '${adminPasswordHash}', 'admin', NOW(), NOW())
    `);

    await queryRunner.query(`
      INSERT INTO tables (number, capacity, status, qr_code, created_at, updated_at) 
      VALUES 
          (1, 4, 'available', 'table-1-qr', NOW(), NOW()),
          (2, 2, 'available', 'table-2-qr', NOW(), NOW()),
          (3, 6, 'available', 'table-3-qr', NOW(), NOW())
    `);

    await queryRunner.query(`
      INSERT INTO inventory (name, description, category, cost_price, sale_price, stock, min_stock, created_at, updated_at) 
      VALUES 
          ('Cerveza Corona', 'Cerveza rubia mexicana', 'beer', 2.50, 5.00, 50, 10, NOW(), NOW()),
          ('Mojito', 'Cóctel clásico cubano', 'cocktail', 3.00, 8.00, 25, 5, NOW(), NOW()),
          ('Nachos', 'Nachos con guacamole', 'food', 4.00, 12.00, 20, 5, NOW(), NOW()),
          ('Whisky Etiqueta Negra', 'Whisky premium escocés', 'spirits', 8.00, 15.00, 15, 3, NOW(), NOW()),
          ('Pizza Margarita', 'Pizza clásica italiana', 'food', 6.00, 18.00, 30, 5, NOW(), NOW())
    `);

    await queryRunner.release();
    
    console.log('✅ IDs reiniciados exitosamente');
    console.log('🎯 Datos de prueba insertados:');
    console.log('   - Usuario admin (admin@barflow.com / admin123)');
    console.log('   - 3 mesas disponibles');
    console.log('   - 5 productos de inventario');
    
  } catch (error) {
    console.error('❌ Error al reiniciar IDs:', error);
  } finally {
    await dataSource.destroy();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  resetDatabaseIds();
}

export { resetDatabaseIds };