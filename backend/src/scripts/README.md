# 🛠️ Database Scripts - BarFlow

## Scripts Disponibles

### 1. 🏗️ Crear Tablas Iniciales (`create-tables`)

Crea todas las tablas de la base de datos con sus relaciones, índices, constraints y tipos ENUM.

**Ejecutar:**
```bash
cd backend
npm run create-tables
```

**Archivos:**
- `create-tables.ts` - Script TypeScript para ejecutar el SQL
- `create-tables.sql` - Schema SQL completo

**Tablas creadas:**
- users
- bars
- waiters
- tables
- inventory
- orders
- order_items
- payments
- payment_logs

**⚠️ ADVERTENCIA:** Este script eliminará las tablas existentes (DROP TABLE CASCADE).

---

### 2. 🔄 Reset Database IDs

Reinicia completamente la base de datos eliminando todos los datos y reiniciando las secuencias de IDs en PostgreSQL.

## ⚠️ ADVERTENCIA IMPORTANTE
**Esta operación eliminará TODOS los datos de la base de datos y NO se puede deshacer.**

## 🚀 Métodos de Ejecución

### COMPLETO - Reinicia TODA la base de datos

#### Método 1: Comando npm (Recomendado)
```bash
cd backend
npm run reset-ids
```

#### Método 2: Directamente con TypeScript
```bash
cd backend
npx ts-node src/scripts/reset-ids.ts
```

#### Método 3: SQL manual
```bash
cd backend
psql -h localhost -U tu_usuario -d tu_base_datos -f src/scripts/reset-ids.sql
```

### PARCIAL - Solo órdenes y pagos (⭐ NUEVO)

#### Método 1: Comando npm (Recomendado)
```bash
cd backend
npm run reset-orders
```

#### Método 2: Directamente con TypeScript
```bash
cd backend
npx ts-node src/scripts/reset-orders-payments-ids.ts
```

#### Método 3: SQL manual
```bash
cd backend
psql -h localhost -U tu_usuario -d tu_base_datos -f src/scripts/reset-orders-payments-ids.sql
```

## 📋 Lo que hace cada script

### 🔄 Reset COMPLETO (`reset-ids`)

1. **Elimina todos los datos** de las tablas en el orden correcto:
   - order_items
   - payment_logs  
   - payments
   - orders
   - inventory
   - tables
   - users

2. **Reinicia las secuencias** de IDs:
   - users_id_seq → 1
   - tables_id_seq → 1
   - inventory_id_seq → 1
   - orders_id_seq → 1
   - payments_id_seq → 1
   - payment_logs_id_seq → 1
   - order_items_id_seq → 1

3. **Inserta datos básicos de prueba**:
   - Usuario admin (admin@barflow.com / admin123)
   - 3 mesas disponibles
   - 5 productos en inventario

### ⭐ Reset PARCIAL (`reset-orders`) - NUEVO

1. **Elimina solo datos de órdenes y pagos**:
   - order_items
   - payment_logs  
   - payments
   - orders

2. **Reinicia solo secuencias relacionadas**:
   - orders_id_seq → 1
   - payments_id_seq → 1
   - payment_logs_id_seq → 1
   - order_items_id_seq → 1

3. **CONSERVA todos los datos de**:
   - ✅ Usuarios existentes
   - ✅ Mesas configuradas
   - ✅ Inventario completo

## 📊 Verificación
El script incluye verificación automática que muestra:
- Estado de todas las secuencias
- Confirmación de datos insertados
- Resumen de operaciones completadas

## 🔧 Variables de entorno requeridas
Asegúrate de tener configuradas estas variables en tu `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_password
DB_DATABASE=barflow
DB_SSL=false
```

## 📝 Notas importantes
- El script usa TRUNCATE CASCADE para manejar dependencias
- Se ejecuta dentro de transacciones para mayor seguridad
- Incluye logs detallados de cada operación
- Compatible con PostgreSQL 12+

## 🔐 Datos de prueba incluidos

### Usuario Admin
- Email: admin@barflow.com  
- Password: admin123
- Rol: admin

### Mesas
- Mesa 1: Capacidad 4 personas
- Mesa 2: Capacidad 2 personas  
- Mesa 3: Capacidad 6 personas

### Inventario
- Cerveza Corona: $5.00
- Mojito: $8.00
- Nachos: $12.00
- Whisky Etiqueta Negra: $15.00
- Pizza Margarita: $18.00