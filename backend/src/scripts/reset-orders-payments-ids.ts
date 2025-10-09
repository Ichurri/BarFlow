import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();

async function resetOrdersPaymentsIds() {
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

    console.log('⚠️  ADVERTENCIA: Esta acción eliminará TODAS las órdenes y pagos');
    console.log('Se mantendrán: usuarios, mesas e inventario');
    console.log('Esta operación NO se puede deshacer.');
    
    const queryRunner = dataSource.createQueryRunner();
    
    console.log('🧹 Eliminando datos de órdenes y pagos...');
    
    // Eliminar solo datos relacionados con orders y payments
    await queryRunner.query('TRUNCATE TABLE order_items CASCADE');
    await queryRunner.query('TRUNCATE TABLE payment_logs CASCADE');
    await queryRunner.query('TRUNCATE TABLE payments CASCADE');
    await queryRunner.query('TRUNCATE TABLE orders CASCADE');

    console.log('🔄 Reiniciando secuencias de IDs de órdenes y pagos...');
    
    // Reiniciar solo las secuencias relacionadas
    const sequences = [
      'orders_id_seq',
      'payments_id_seq',
      'payment_logs_id_seq',
      'order_items_id_seq'
    ];

    for (const sequence of sequences) {
      await queryRunner.query(`ALTER SEQUENCE ${sequence} RESTART WITH 1`);
      console.log(`✅ Secuencia ${sequence} reiniciada`);
    }

    // Verificar solo las secuencias relacionadas
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
      AND sequencename IN ('orders_id_seq', 'payments_id_seq', 'payment_logs_id_seq', 'order_items_id_seq')
      ORDER BY sequencename
    `);

    console.table(result);

    // Verificar que los datos existentes se mantuvieron
    console.log('📝 Verificando datos conservados:');
    
    const usersCount = await queryRunner.query('SELECT COUNT(*) as count FROM users');
    const tablesCount = await queryRunner.query('SELECT COUNT(*) as count FROM tables');
    const inventoryCount = await queryRunner.query('SELECT COUNT(*) as count FROM inventory');
    
    console.log(`👥 Usuarios conservados: ${usersCount[0].count}`);
    console.log(`🪑 Mesas conservadas: ${tablesCount[0].count}`);
    console.log(`📦 Productos en inventario conservados: ${inventoryCount[0].count}`);

    await queryRunner.release();
    
    console.log('✅ IDs de órdenes y pagos reiniciados exitosamente');
    console.log('🎯 Se conservaron todos los usuarios, mesas e inventario');
    
  } catch (error) {
    console.error('❌ Error al reiniciar IDs:', error);
  } finally {
    await dataSource.destroy();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  resetOrdersPaymentsIds();
}

export { resetOrdersPaymentsIds };