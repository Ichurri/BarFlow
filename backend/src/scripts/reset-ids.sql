-- Script para reiniciar IDs en BarFlow Database
-- ⚠️  ADVERTENCIA: Esto eliminará todos los datos y reiniciará las secuencias

-- 1. ELIMINAR TODOS LOS DATOS (en orden por dependencias)
TRUNCATE TABLE order_items CASCADE;
TRUNCATE TABLE payment_logs CASCADE;
TRUNCATE TABLE payments CASCADE;
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE inventory CASCADE;
TRUNCATE TABLE tables CASCADE;
TRUNCATE TABLE users CASCADE;

-- 2. REINICIAR SECUENCIAS DE AUTOINCREMENTO
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE tables_id_seq RESTART WITH 1;
ALTER SEQUENCE inventory_id_seq RESTART WITH 1;
ALTER SEQUENCE orders_id_seq RESTART WITH 1;
ALTER SEQUENCE payments_id_seq RESTART WITH 1;
ALTER SEQUENCE payment_logs_id_seq RESTART WITH 1;
ALTER SEQUENCE order_items_id_seq RESTART WITH 1;

-- 3. VERIFICAR QUE LAS SECUENCIAS SE REINICIARON
SELECT 
    schemaname,
    sequencename,
    last_value,
    start_value,
    increment_by
FROM pg_sequences 
WHERE schemaname = 'public'
ORDER BY sequencename;

-- 4. OPCIONAL: Insertar datos básicos de prueba
-- Insertar usuario admin
INSERT INTO users (username, email, password, role, created_at, updated_at) 
VALUES ('admin', 'admin@barflow.com', '$2b$10$example', 'admin', NOW(), NOW());

-- Insertar algunas mesas
INSERT INTO tables (number, capacity, status, qr_code, created_at, updated_at) 
VALUES 
    (1, 4, 'available', 'table-1-qr', NOW(), NOW()),
    (2, 2, 'available', 'table-2-qr', NOW(), NOW()),
    (3, 6, 'available', 'table-3-qr', NOW(), NOW());

-- Insertar algunos productos de ejemplo
INSERT INTO inventory (name, description, category, cost_price, sale_price, stock, min_stock, created_at, updated_at) 
VALUES 
    ('Cerveza Corona', 'Cerveza rubia mexicana', 'beer', 2.50, 5.00, 50, 10, NOW(), NOW()),
    ('Mojito', 'Cóctel clásico cubano', 'cocktail', 3.00, 8.00, 0, 5, NOW(), NOW()),
    ('Nachos', 'Nachos con guacamole', 'food', 4.00, 12.00, 20, 5, NOW(), NOW());

COMMIT;