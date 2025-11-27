import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

config();

const configService = new ConfigService();

/**
 * Script to create all database tables for BarFlow
 * This script reads and executes the create-tables.sql file
 */
async function createTables() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: +configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_DATABASE'),
    ssl: configService.get('DB_SSL') === 'true' ? {
      rejectUnauthorized: false
    } : false,
  });

  try {
    console.log('🔌 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Connected to database successfully');

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'create-tables.sql');
    console.log(`📄 Reading SQL file from: ${sqlFilePath}`);
    
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('🚀 Executing SQL script to create tables...');
    
    // Execute the SQL script
    await dataSource.query(sqlContent);
    
    console.log('✅ All tables created successfully!');
    
    // Display created tables
    const tables = await dataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log('\n📊 Created tables:');
    tables.forEach((table: any) => {
      console.log(`  - ${table.table_name}`);
    });
    
    // Display created types
    const types = await dataSource.query(`
      SELECT typname 
      FROM pg_type 
      WHERE typtype = 'e' 
      ORDER BY typname;
    `);
    
    console.log('\n🏷️  Created ENUM types:');
    types.forEach((type: any) => {
      console.log(`  - ${type.typname}`);
    });

  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Execute the script
console.log('='.repeat(50));
console.log('🍺 BarFlow - Database Tables Creation Script');
console.log('='.repeat(50));
console.log();

createTables()
  .then(() => {
    console.log();
    console.log('='.repeat(50));
    console.log('✨ Database setup completed successfully!');
    console.log('='.repeat(50));
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to create tables:', error);
    process.exit(1);
  });
