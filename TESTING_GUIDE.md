# BarFlow - Guía de Pruebas API - Fase 3 MVP

## Prerrequisitos
1. Servidor ejecutándose: `cd backend && npm run start:dev`
2. Base de datos poblada: `cd backend && npm run seed`
3. Servidor disponible en: `http://localhost:3000/api`

## 📋 Usuarios Creados en el Seeding

Después de ejecutar `npm run seed`, se crean los siguientes usuarios:

### Usuarios del Sistema:
- **Admin**: `username="admin"`, `password="admin123"`, `role="ADMIN"`
- **Bar User 1**: `username="baruser1"`, `password="bar123"`, `role="BAR"`
- **Bar User 2**: `username="baruser2"`, `password="bar123"`, `role="BAR"`
- **Waiter 1**: `username="waiter1"`, `password="waiter123"`, `role="WAITER"`
- **Waiter 2**: `username="waiter2"`, `password="waiter123"`, `role="WAITER"`

### Datos Adicionales Creados:
- **2 Bares**: Main Bar, VIP Bar
- **2 Waiters** asignados a los bares
- **10 Mesas** con códigos QR (2 ocupadas, 8 disponibles)
- **5 Items de Inventario**:
  1. Corona Beer (Cerveza) - $5.00
  2. Vodka Shot (Spirits) - $8.00
  3. Mojito (Cocktails) - $12.00
  4. Red Wine Glass (Wine) - $15.00
  5. Whiskey Neat (Spirits) - $20.00
- **2 Pedidos de Ejemplo**: 1 pendiente, 1 listo para entrega
- **2 Pagos de Ejemplo**: 1 pendiente, 1 verificado
- **3 Logs de Pago** para seguimiento de verificaciones

## 1. Pruebas de Autenticación

### 1.1 Login de Administrador
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

**Output Esperado:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "ADMIN"
  }
}
```

### 1.2 Login de Bar User 1
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "baruser1", "password": "bar123"}'
```

**Output Esperado:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "username": "baruser1",
    "role": "BAR"
  }
}
```

### 1.3 Login de Bar User 2
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "baruser2", "password": "bar123"}'
```

**Output Esperado:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 3,
    "username": "baruser2",
    "role": "BAR"
  }
}
```

### 1.4 Login de Waiter 1
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "waiter1", "password": "waiter123"}'
```

**Output Esperado:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 4,
    "username": "waiter1",
    "role": "WAITER"
  }
}
```

### 1.5 Login de Waiter 2
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "waiter2", "password": "waiter123"}'
```

**Output Esperado:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 5,
    "username": "waiter2",
    "role": "WAITER"
  }
}
```

### 1.6 Login con Credenciales Incorrectas
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "wrongpassword"}'
```

**Output Esperado:**
```json
{
  "statusCode": 401,
  "message": "Credenciales inválidas",
  "error": "Unauthorized"
}
```

### 1.7 Registro de Nuevo Usuario
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "password123",
    "role": "WAITER"
  }'
```

**Output Esperado:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 6,
    "username": "newuser",
    "role": "WAITER"
  }
}
```

### 1.8 Perfil de Usuario (requiere token)
```bash
# Primero obtener token del login
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

**Output Esperado:**
```json
{
  "id": 1,
  "username": "admin",
  "role": "ADMIN",
  "createdAt": "2025-09-22T...",
  "updatedAt": "2025-09-22T..."
}
```

## 2. Pruebas de Inventario

## 2. Pruebas de Inventario

### 2.1 Listar Inventario como ADMIN (ve todos los campos)
```bash
# Usar token de admin
curl -X GET http://localhost:3000/api/inventory \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Output Esperado:**
```json
[
  {
    "id": 1,
    "name": "Corona Beer",
    "category": "Beer",
    "sellPrice": 5.00,
    "costPrice": 2.50,
    "stockQuantity": 100,
    "minimumStock": 10,
    "photoUrl": "https://example.com/corona.jpg",
    "isAvailable": true,
    "createdAt": "2025-09-22T...",
    "updatedAt": "2025-09-22T..."
  },
  {
    "id": 2,
    "name": "Vodka Shot",
    "category": "Spirits",
    "sellPrice": 8.00,
    "costPrice": 3.00,
    "stockQuantity": 50,
    "minimumStock": 5,
    "photoUrl": "https://example.com/vodka.jpg",
    "isAvailable": true,
    "createdAt": "2025-09-22T...",
    "updatedAt": "2025-09-22T..."
  },
  // ... más items del seeding
]
```

### 2.2 Listar Inventario como BAR (NO ve costPrice)
```bash
# Usar token de bartender
curl -X GET http://localhost:3000/api/inventory \
  -H "Authorization: Bearer $BAR_TOKEN"
```

**Output Esperado:**
```json
[
  {
    "id": 1,
    "name": "Corona Beer",
    "category": "Beer",
    "sellPrice": 5.00,
    "stockQuantity": 100,
    "minimumStock": 10,
    "photoUrl": "https://example.com/corona.jpg",
    "isAvailable": true,
    "createdAt": "2025-09-22T...",
    "updatedAt": "2025-09-22T..."
  },
  {
    "id": 2,
    "name": "Vodka Shot",
    "category": "Spirits",
    "sellPrice": 8.00,
    "stockQuantity": 50,
    "minimumStock": 5,
    "photoUrl": "https://example.com/vodka.jpg",
    "isAvailable": true,
    "createdAt": "2025-09-22T...",
    "updatedAt": "2025-09-22T..."
  },
  // ... más items (SIN costPrice)
]
```

### 2.3 Listar Solo Items Disponibles
```bash
curl -X GET http://localhost:3000/api/inventory/available \
  -H "Authorization: Bearer $TOKEN"
```

**Output Esperado:**
```json
[
  {
    "id": 1,
    "name": "Corona Beer",
    "sellPrice": 5.00,
    "stockQuantity": 100,
    "isAvailable": true
  },
  {
    "id": 2,
    "name": "Vodka Shot",
    "sellPrice": 8.00,
    "stockQuantity": 50,
    "isAvailable": true
  },
  // ... solo items con stock > 0 y disponibles
]
```

### 2.4 Listar Items con Stock Bajo
```bash
curl -X GET http://localhost:3000/api/inventory/low-stock \
  -H "Authorization: Bearer $TOKEN"
```

**Output Esperado:**
```json
[
  {
    "id": 4,
    "name": "Red Wine Glass",
    "stockQuantity": 25,
    "minimumStock": 3
  }
  // Solo items donde stockQuantity está cerca del minimumStock
  // En el seeding actual, todos los items tienen stock suficiente
  // Este endpoint podría devolver array vacío []
]
```

### 2.5 Crear Item de Inventario (solo ADMIN)
```bash
curl -X POST http://localhost:3000/api/inventory \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gin Artesanal",
    "description": "Gin premium artesanal",
    "category": "Licores",
    "sellPrice": 15.00,
    "costPrice": 10.00,
    "stockQuantity": 30,
    "minimumStock": 5,
    "unit": "shots",
    "barId": 1
  }'
```

**Output Esperado:**
```json
{
  "id": 6,
  "name": "Gin Artesanal",
  "description": "Gin premium artesanal",
  "category": "Licores",
  "sellPrice": 15.00,
  "costPrice": 10.00,
  "stockQuantity": 30,
  "minimumStock": 5,
  "unit": "shots",
  "isAvailable": true,
  "barId": 1,
  "createdAt": "2025-09-22T...",
  "updatedAt": "2025-09-22T..."
}
```

### 2.6 Crear Item como BAR (debe fallar)
```bash
curl -X POST http://localhost:3000/api/inventory \
  -H "Authorization: Bearer $BAR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Producto No Autorizado",
    "sellPrice": 10.00,
    "barId": 1
  }'
```

**Output Esperado:**
```json
{
  "statusCode": 403,
  "message": "Acceso denegado",
  "error": "Forbidden"
}
```

### 2.7 Actualizar Stock (ADMIN y BAR)
```bash
curl -X PATCH http://localhost:3000/api/inventory/1/stock \
  -H "Authorization: Bearer $BAR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"stockQuantity": 45}'
```

**Output Esperado:**
```json
{
  "id": 1,
  "name": "Corona Beer",
  "stockQuantity": 45,
  "message": "Stock actualizado correctamente"
}
```

## 3. Pruebas de Gestión de Mesas

### 3.1 Listar Todas las Mesas (ADMIN)
```bash
curl -X GET http://localhost:3000/api/tables \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Output Esperado:**
```json
[
  {
    "id": 1,
    "qr_code": "TABLE_001",
    "waiter_id": 1,
    "status": "occupied",
    "capacity": 4,
    "location": "Main Floor",
    "created_at": "2025-09-22T...",
    "updated_at": "2025-09-22T...",
    "waiter": {
      "id": 1,
      "user_id": 4,
      "bar_id": 1,
      "user": {
        "id": 4,
        "username": "waiter1",
        "role": "WAITER"
      }
    }
  },
  // ... más mesas
]
```

### 3.2 Mis Mesas Asignadas (WAITER)
```bash
curl -X GET http://localhost:3000/api/tables/my-tables \
  -H "Authorization: Bearer $WAITER_TOKEN"
```

**Output Esperado:**
```json
[
  {
    "id": 1,
    "qr_code": "TABLE_001",
    "status": "occupied",
    "capacity": 4,
    "location": "Main Floor",
    "orders": [
      {
        "id": 1,
        "status": "pending",
        "total_amount": 17.00,
        "created_at": "2025-09-22T..."
      }
    ]
  },
  // ... solo mesas del waiter logueado
]
```

### 3.3 Buscar Mesa por QR Code
```bash
curl -X GET http://localhost:3000/api/tables/qr/TABLE_001 \
  -H "Authorization: Bearer $TOKEN"
```

**Output Esperado:**
```json
{
  "id": 1,
  "qr_code": "TABLE_001",
  "waiter_id": 1,
  "status": "occupied",
  "capacity": 4,
  "location": "Main Floor",
  "waiter": {
    "id": 1,
    "user": {
      "id": 4,
      "username": "waiter1",
      "role": "WAITER"
    }
  }
}
```

### 3.4 Cambiar Estado de Mesa
```bash
curl -X PATCH http://localhost:3000/api/tables/1/status \
  -H "Authorization: Bearer $WAITER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "cleaning"}'
```

**Output Esperado:**
```json
{
  "id": 1,
  "qr_code": "TABLE_001",
  "status": "cleaning",
  "capacity": 4,
  "location": "Main Floor",
  "message": "Estado de mesa actualizado"
}
```

## 4. Pruebas de Sistema de Pedidos

### 4.1 Crear Pedido Normal
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer $WAITER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "table_id": 3,
    "items": [
      {
        "inventory_id": 1,
        "quantity": 2
      },
      {
        "inventory_id": 3,
        "quantity": 1
      }
    ],
    "notes": "Sin hielo en el mojito"
  }'
```

**Output Esperado:**
```json
{
  "id": 3,
  "table_id": 3,
  "waiter_id": 1,
  "bar_id": 1,
  "status": "pending",
  "total_amount": 22.00,
  "notes": "Sin hielo en el mojito",
  "created_at": "2025-09-22T...",
  "orderItems": [
    {
      "id": 5,
      "inventory_id": 1,
      "quantity": 2,
      "unit_price": 5.00,
      "subtotal": 10.00,
      "inventory": {
        "name": "Corona Beer"
      }
    },
    {
      "id": 6,
      "inventory_id": 3,
      "quantity": 1,
      "unit_price": 12.00,
      "subtotal": 12.00,
      "inventory": {
        "name": "Mojito"
      }
    }
  ]
}
```

### 4.2 Crear Pedido por QR Code
```bash
curl -X POST http://localhost:3000/api/orders/qr/TABLE_004 \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "inventory_id": 2,
        "quantity": 1
      }
    ],
    "notes": "Pedido desde mesa"
  }'
```

**Output Esperado:**
```json
{
  "id": 4,
  "table_id": 4,
  "waiter_id": 1,
  "bar_id": 1,
  "status": "pending",
  "total_amount": 8.00,
  "notes": "Pedido desde mesa",
  "orderItems": [
    {
      "inventory_id": 2,
      "quantity": 1,
      "unit_price": 8.00,
      "subtotal": 8.00
    }
  ]
}
```

### 4.3 Listar Mis Pedidos (WAITER)
```bash
curl -X GET http://localhost:3000/api/orders/my-orders \
  -H "Authorization: Bearer $WAITER_TOKEN"
```

**Output Esperado:**
```json
[
  {
    "id": 1,
    "table_id": 1,
    "status": "pending",
    "total_amount": 17.00,
    "notes": "Sin hielo en el mojito",
    "created_at": "2025-09-22T...",
    "table": {
      "qr_code": "TABLE_001",
      "capacity": 4
    },
    "orderItems": [...]
  },
  // ... solo pedidos del waiter logueado
]
```

### 4.4 Pedidos Pendientes (BAR)
```bash
curl -X GET http://localhost:3000/api/orders/pending \
  -H "Authorization: Bearer $BAR_TOKEN"
```

**Output Esperado:**
```json
[
  {
    "id": 1,
    "table_id": 1,
    "status": "pending",
    "total_amount": 17.00,
    "created_at": "2025-09-22T...",
    "table": {
      "qr_code": "TABLE_001"
    },
    "waiter": {
      "user": {
        "username": "waiter1"
      }
    },
    "orderItems": [...]
  }
]
```

### 4.5 Confirmar Pedido (BAR)
```bash
curl -X PATCH http://localhost:3000/api/orders/1/confirm \
  -H "Authorization: Bearer $BAR_TOKEN"
```

**Output Esperado:**
```json
{
  "id": 1,
  "status": "confirmed",
  "message": "Pedido confirmado"
}
```

### 4.6 Marcar Pedido Listo (BAR)
```bash
curl -X PATCH http://localhost:3000/api/orders/1/ready \
  -H "Authorization: Bearer $BAR_TOKEN"
```

**Output Esperado:**
```json
{
  "id": 1,
  "status": "ready",
  "message": "Pedido listo para entrega"
}
```

### 4.7 Pedidos Listos para Entregar (WAITER)
```bash
curl -X GET http://localhost:3000/api/orders/ready \
  -H "Authorization: Bearer $WAITER_TOKEN"
```

**Output Esperado:**
```json
[
  {
    "id": 2,
    "table_id": 2,
    "status": "ready",
    "total_amount": 23.00,
    "updated_at": "2025-09-22T...",
    "table": {
      "qr_code": "TABLE_002"
    }
  }
]
```

### 4.8 Marcar Pedido Entregado (WAITER)
```bash
curl -X PATCH http://localhost:3000/api/orders/2/deliver \
  -H "Authorization: Bearer $WAITER_TOKEN"
```

**Output Esperado:**
```json
{
  "id": 2,
  "status": "delivered",
  "message": "Pedido entregado exitosamente"
}
```

### 4.9 Pedidos por Mesa
```bash
curl -X GET http://localhost:3000/api/orders/table/1 \
  -H "Authorization: Bearer $WAITER_TOKEN"
```

**Output Esperado:**
```json
[
  {
    "id": 1,
    "table_id": 1,
    "status": "delivered",
    "total_amount": 17.00,
    "created_at": "2025-09-22T...",
    "orderItems": [...]
  }
]
```

## 5. Pruebas de Acceso Sin Autenticación

### 5.1 Acceso a Endpoint Protegido sin Token
```bash
curl -X GET http://localhost:3000/api/inventory
```

**Output Esperado:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 5.2 Token Inválido
```bash
curl -X GET http://localhost:3000/api/inventory \
  -H "Authorization: Bearer token_invalido"
```

**Output Esperado:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

## 6. Pruebas de Validaciones

### 6.1 Crear Pedido sin Items
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer $WAITER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "table_id": 1,
    "items": []
  }'
```

**Output Esperado:**
```json
{
  "statusCode": 400,
  "message": ["items should not be empty"],
  "error": "Bad Request"
}
```

### 6.2 Crear Pedido con Producto No Disponible
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer $WAITER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "table_id": 1,
    "items": [
      {
        "inventory_id": 999,
        "quantity": 1
      }
    ]
  }'
```

**Output Esperado:**
```json
{
  "statusCode": 404,
  "message": "Producto con ID 999 no encontrado",
  "error": "Not Found"
}
```

### 6.3 Crear Item sin Datos Requeridos
```bash
curl -X POST http://localhost:3000/api/inventory \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sellPrice": 10.00
  }'
```

**Output Esperado:**
```json
{
  "statusCode": 400,
  "message": [
    "name should not be empty",
    "name must be a string",
    "category should not be empty",
    "barId must be a number conforming to the specified constraints"
  ],
  "error": "Bad Request"
}
```

### 6.4 Buscar Mesa con QR Inexistente
```bash
curl -X GET http://localhost:3000/api/tables/qr/TABLE_999 \
  -H "Authorization: Bearer $TOKEN"
```

**Output Esperado:**
```json
{
  "statusCode": 404,
  "message": "Mesa con QR TABLE_999 no encontrada",
  "error": "Not Found"
}
```

## 7. Flujo Completo de Pedido

### 7.1 Escenario: Pedido desde QR hasta Entrega

#### Paso 1: Cliente escanea QR y hace pedido
```bash
curl -X POST http://localhost:3000/api/orders/qr/TABLE_005 \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "inventory_id": 1,
        "quantity": 2
      },
      {
        "inventory_id": 3,
        "quantity": 1
      }
    ],
    "notes": "Mesa de la esquina"
  }'
```

#### Paso 2: Bartender ve pedidos pendientes
```bash
curl -X GET http://localhost:3000/api/orders/pending \
  -H "Authorization: Bearer $BAR_TOKEN"
```

#### Paso 3: Bartender confirma el pedido
```bash
curl -X PATCH http://localhost:3000/api/orders/[ID_DEL_PEDIDO]/confirm \
  -H "Authorization: Bearer $BAR_TOKEN"
```

#### Paso 4: Bartender marca pedido como preparando
```bash
curl -X PATCH http://localhost:3000/api/orders/[ID_DEL_PEDIDO]/preparing \
  -H "Authorization: Bearer $BAR_TOKEN"
```

#### Paso 5: Bartender marca pedido listo
```bash
curl -X PATCH http://localhost:3000/api/orders/[ID_DEL_PEDIDO]/ready \
  -H "Authorization: Bearer $BAR_TOKEN"
```

#### Paso 6: Waiter ve pedidos listos
```bash
curl -X GET http://localhost:3000/api/orders/ready \
  -H "Authorization: Bearer $WAITER_TOKEN"
```

#### Paso 7: Waiter entrega el pedido
```bash
curl -X PATCH http://localhost:3000/api/orders/[ID_DEL_PEDIDO]/deliver \
  -H "Authorization: Bearer $WAITER_TOKEN"
```

## 8. Verificación del Sistema

### 8.1 Verificar Estado del Inventario después de Pedidos
```bash
curl -X GET http://localhost:3000/api/inventory \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Verificar que:**
- Los `stockQuantity` se redujeron según las cantidades pedidas
- Los productos siguen disponibles si hay stock suficiente

### 8.2 Verificar Estado de las Mesas
```bash
curl -X GET http://localhost:3000/api/tables \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Verificar que:**
- Mesa 1: status = "occupied" (tiene pedido activo)
- Mesa 2: status = "occupied" (tiene pedido listo)
- Mesas 3-10: status = "available"

### 8.3 Verificar Estado de Pedidos
```bash
curl -X GET http://localhost:3000/api/orders \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Verificar que:**
- Pedido 1: status = "pending" 
- Pedido 2: status = "ready"
- Nuevos pedidos creados durante las pruebas

## 9. Pruebas del Sistema de Pagos (Fase 3 MVP)

### 9.1 Solicitar Pago (WAITER)
**Descripción**: El waiter solicita pago para una orden entregada
```bash
curl -X POST http://localhost:3000/api/payments/request \
  -H "Authorization: Bearer $WAITER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": 1,
    "method": "CASH"
  }'
```

**Output Esperado:**
```json
{
  "id": 3,
  "order_id": 1,
  "method": "CASH",
  "total_amount": 17.00,
  "status": "PENDING",
  "created_by": 4,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

### 9.2 Ver Pagos Pendientes (BAR)
**Descripción**: El bar consulta todos los pagos pendientes de verificación
```bash
curl -X GET http://localhost:3000/api/payments/pending \
  -H "Authorization: Bearer $BAR_TOKEN"
```

**Output Esperado:**
```json
[
  {
    "id": 1,
    "order_id": 1,
    "method": "CASH",
    "total_amount": 32.00,
    "status": "PENDING",
    "created_by": 4,
    "created_at": "2024-01-15T10:00:00.000Z",
    "order": {
      "id": 1,
      "table_id": 1,
      "status": "PAYMENT_PENDING",
      "table": {
        "qr_code": "TABLE_001",
        "location": "Main Floor"
      }
    },
    "creator": {
      "username": "waiter1"
    }
  }
]
```

### 9.3 Verificar Pago (BAR)
**Descripción**: El bar verifica un pago después de recibir el efectivo
```bash
curl -X PATCH http://localhost:3000/api/payments/1/verify \
  -H "Authorization: Bearer $BAR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Efectivo recibido correctamente - $32.00"
  }'
```

**Output Esperado:**
```json
{
  "id": 1,
  "order_id": 1,
  "method": "CASH",
  "total_amount": 32.00,
  "status": "VERIFIED",
  "created_by": 4,
  "verified_by": 2,
  "created_at": "2024-01-15T10:00:00.000Z",
  "updated_at": "2024-01-15T10:35:00.000Z"
}
```

### 9.4 Rechazar Pago (BAR)
**Descripción**: El bar rechaza un pago por algún problema
```bash
curl -X PATCH http://localhost:3000/api/payments/2/reject \
  -H "Authorization: Bearer $BAR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Monto incorrecto - faltaron $5.00"
  }'
```

**Output Esperado:**
```json
{
  "id": 2,
  "order_id": 2,
  "method": "CASH",
  "total_amount": 23.00,
  "status": "REJECTED",
  "created_by": 5,
  "verified_by": 2,
  "created_at": "2024-01-15T10:15:00.000Z",
  "updated_at": "2024-01-15T10:40:00.000Z"
}
```

### 9.5 Historial de Pago (BAR/WAITER)
**Descripción**: Consultar el historial completo de un pago específico
```bash
curl -X GET http://localhost:3000/api/payments/1/history \
  -H "Authorization: Bearer $BAR_TOKEN"
```

**Output Esperado:**
```json
[
  {
    "id": 1,
    "action": "CREATED",
    "user_id": 4,
    "timestamp": "2024-01-15T10:00:00.000Z",
    "notes": "Pago iniciado por mesero para mesa 1",
    "user": {
      "username": "waiter1"
    }
  },
  {
    "id": 4,
    "action": "VERIFIED",
    "user_id": 2,
    "timestamp": "2024-01-15T10:35:00.000Z",
    "notes": "Efectivo recibido correctamente - $32.00",
    "user": {
      "username": "baruser1"
    }
  }
]
```

### 9.6 Generar Recibo (BAR/WAITER)
**Descripción**: Generar recibo para un pago verificado
```bash
curl -X GET http://localhost:3000/api/payments/1/receipt \
  -H "Authorization: Bearer $WAITER_TOKEN"
```

**Output Esperado:**
```json
{
  "payment_id": 1,
  "order_id": 1,
  "table": "TABLE_001",
  "location": "Main Floor",
  "total_amount": 32.00,
  "method": "CASH",
  "status": "VERIFIED",
  "items": [
    {
      "name": "Corona Beer",
      "quantity": 2,
      "unit_price": 5.00,
      "subtotal": 10.00
    },
    {
      "name": "Mojito",
      "quantity": 2,
      "unit_price": 12.00,
      "subtotal": 24.00
    }
  ],
  "verified_by": "baruser1",
  "created_at": "2024-01-15T10:00:00.000Z",
  "verified_at": "2024-01-15T10:35:00.000Z"
}
```

### 9.7 Workflow Completo de Pago

**Flujo completo desde pedido hasta pago verificado:**

1. **Crear y procesar pedido hasta entrega** (usar secciones 7.1-7.6)
2. **Solicitar pago** (9.1)
3. **Verificar en pendientes** (9.2)
4. **Verificar pago** (9.3)
5. **Generar recibo** (9.6)
6. **Consultar historial** (9.5)

### 9.8 Estados de Pago
- **PENDING**: Pago solicitado, esperando verificación del bar
- **VERIFIED**: Pago verificado por el bar, proceso completado
- **REJECTED**: Pago rechazado por el bar, requiere corrección

### 9.9 Métodos de Pago MVP
- **CASH**: Efectivo (único método en esta versión MVP)
- **QR**: Para presentación (funcionalidad futura)

### 9.10 Roles y Permisos de Pago
- **WAITER**: Puede solicitar pagos para órdenes de sus mesas
- **BAR**: Puede ver pagos pendientes, verificar/rechazar pagos, ver historial
- **ADMIN**: Acceso completo a todas las funcionalidades de pago

## 10. Notas Importantes

### Estados de Pedidos:
- **PENDING**: Recién creado, esperando confirmación del bar
- **CONFIRMED**: Confirmado por el bar, va a prepararse
- **PREPARING**: En preparación por el bar
- **READY**: Listo para entrega por el waiter
- **DELIVERED**: Entregado al cliente
- **PAYMENT_PENDING**: Entregado, esperando verificación de pago
- **COMPLETED**: Pago verificado, proceso completado

### Estados de Mesas:
- **AVAILABLE**: Disponible para nuevos clientes
- **OCCUPIED**: Ocupada con clientes
- **RESERVED**: Reservada 
- **CLEANING**: En proceso de limpieza
- **OUT_OF_SERVICE**: Fuera de servicio

### Roles y Permisos:
- **ADMIN**: Acceso completo a todo el sistema
- **BAR**: Gestión de inventario (sin costos), pedidos pendientes, preparación
- **WAITER**: Sus mesas asignadas, crear pedidos, entregar pedidos listos

### Automatizaciones:
- Stock se reduce automáticamente al crear pedidos
- Mesas cambian a "occupied" cuando tienen pedidos activos
- Solo productos con stock disponible pueden ordenarse
- Al solicitar pago, la orden cambia automáticamente a "PAYMENT_PENDING"
- Al verificar pago, la orden cambia a "COMPLETED" y la mesa se libera
- Se crean logs automáticos para todas las acciones de pago

## 10. Comandos Útiles para Testing

### Obtener y usar tokens:
```bash
# Obtener token de admin
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}' | \
  jq -r '.access_token')

# Obtener token de baruser1
BAR_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "baruser1", "password": "bar123"}' | \
  jq -r '.access_token')

# Obtener token de waiter1
WAITER_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "waiter1", "password": "waiter123"}' | \
  jq -r '.access_token')

# Usar el token
curl -X GET http://localhost:3000/api/inventory \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Verificar estado del servidor:
```bash
curl -I http://localhost:3000/api/auth/login
```

Esta guía te permitirá validar completamente la funcionalidad del sistema BarFlow Fase 3 MVP, incluyendo toda la gestión de mesas, pedidos con workflow completo, y el nuevo sistema de pagos con verificación manual. Verifica que todos los controles de acceso, validaciones, y el flujo de pago desde solicitud hasta verificación están funcionando correctamente.