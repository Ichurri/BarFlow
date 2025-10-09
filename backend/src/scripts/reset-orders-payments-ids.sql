-- ================================================================
-- RESET ORDERS AND PAYMENTS IDS ONLY - BarFlow Database
-- ================================================================
-- ⚠️  ADVERTENCIA: Esta acción eliminará TODAS las órdenes y pagos
-- Se mantendrán: usuarios, mesas e inventario
-- Esta operación NO se puede deshacer.
-- ================================================================

-- Mostrar información antes del reset
\echo '📊 Estado actual de la base de datos:'
\echo '==================================='

SELECT 'Órdenes actuales:' as info, COUNT(*) as cantidad FROM orders
UNION ALL
SELECT 'Pagos actuales:', COUNT(*) FROM payments
UNION ALL
SELECT 'Payment logs actuales:', COUNT(*) FROM payment_logs
UNION ALL
SELECT 'Order items actuales:', COUNT(*) FROM order_items;

\echo ''
\echo '⚠️  Iniciando eliminación de órdenes y pagos...'

-- Eliminar datos de órdenes y pagos en orden correcto (por dependencias)
TRUNCATE TABLE order_items CASCADE;
TRUNCATE TABLE payment_logs CASCADE;
TRUNCATE TABLE payments CASCADE;
TRUNCATE TABLE orders CASCADE;

\echo '✅ Datos de órdenes y pagos eliminados'

-- Reiniciar secuencias relacionadas con orders y payments
\echo '🔄 Reiniciando secuencias de IDs...'

ALTER SEQUENCE orders_id_seq RESTART WITH 1;
ALTER SEQUENCE payments_id_seq RESTART WITH 1;
ALTER SEQUENCE payment_logs_id_seq RESTART WITH 1;
ALTER SEQUENCE order_items_id_seq RESTART WITH 1;

\echo '✅ Secuencias reiniciadas'

-- Verificar secuencias reiniciadas
\echo ''
\echo '📊 Estado de las secuencias reiniciadas:'
\echo '======================================'

SELECT 
    sequencename as "Secuencia",
    last_value as "Último valor",
    start_value as "Valor inicial",
    increment_by as "Incremento"
FROM pg_sequences 
WHERE schemaname = 'public'
AND sequencename IN ('orders_id_seq', 'payments_id_seq', 'payment_logs_id_seq', 'order_items_id_seq')
ORDER BY sequencename;

-- Verificar datos conservados
\echo ''
\echo '📝 Datos conservados:'
\echo '==================='

SELECT 'Usuarios conservados:' as info, COUNT(*) as cantidad FROM users
UNION ALL
SELECT 'Mesas conservadas:', COUNT(*) FROM tables
UNION ALL
SELECT 'Productos en inventario conservados:', COUNT(*) FROM inventory;

-- Verificar que las tablas de órdenes están vacías
\echo ''
\echo '🧹 Verificación de limpieza:'
\echo '==========================='

SELECT 'Órdenes restantes:' as info, COUNT(*) as cantidad FROM orders
UNION ALL
SELECT 'Pagos restantes:', COUNT(*) FROM payments
UNION ALL
SELECT 'Payment logs restantes:', COUNT(*) FROM payment_logs
UNION ALL
SELECT 'Order items restantes:', COUNT(*) FROM order_items;

\echo ''
\echo '✅ Proceso completado exitosamente'
\echo '🎯 Se conservaron todos los usuarios, mesas e inventario'
\echo '🔄 Los próximos IDs de órdenes y pagos comenzarán desde 1'