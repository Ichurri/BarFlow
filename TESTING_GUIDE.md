# BarFlow - Guía de Pruebas API

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
- **10 Mesas** con códigos QR (TABLE_001 a TABLE_010)
- **5 Items de Inventario**:
  1. Corona Beer (Cerveza) - $5.00
  2. Vodka Shot (Spirits) - $8.00
  3. Mojito (Cocktails) - $12.00
  4. Red Wine Glass (Wine) - $15.00
  5. Whiskey Neat (Spirits) - $20.00

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
  "name": "Whisky Premium",
  "stockQuantity": 45,
  "message": "Stock actualizado correctamente"
}
```

## 3. Pruebas de Acceso Sin Autenticación

### 3.1 Acceso sin Token
```bash
curl -X GET http://localhost:3000/api/inventory
```

**Output Esperado:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 3.2 Token Inválido
```bash
curl -X GET http://localhost:3000/api/inventory \
  -H "Authorization: Bearer token_invalido"
```

**Output Esperado:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

## 4. Validaciones de Datos

### 4.1 Login con Username Inválido
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "", "password": "123"}'
```

**Output Esperado:**
```json
{
  "statusCode": 400,
  "message": ["username should not be empty"],
  "error": "Bad Request"
}
```

### 4.2 Registro con Datos Faltantes
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "test"}'
```

**Output Esperado:**
```json
{
  "statusCode": 400,
  "message": [
    "password should not be empty",
    "role should not be empty"
  ],
  "error": "Bad Request"
}
```

## 5. Resumen de Validaciones Importantes

### ✅ Funcionalidades que DEBEN funcionar:
1. **Login exitoso** con usuarios del seeding
2. **Roles correctos** en respuestas de autenticación
3. **Control de acceso**: BAR no ve `costPrice` en inventario
4. **Permisos**: Solo ADMIN puede crear/editar items
5. **Tokens JWT** válidos en todas las respuestas de auth
6. **Filtros**: endpoints `/available` y `/low-stock` funcionando
7. **Actualización de stock** permitida para ADMIN y BAR
8. **Validaciones** de datos en todos los endpoints

### ❌ Casos que DEBEN fallar:
1. **Login** con credenciales incorrectas
2. **Acceso** sin token de autenticación
3. **Creación de items** por usuarios BAR o WAITER
4. **Tokens inválidos** o expirados
5. **Datos malformados** en requests

## 6. Comandos Útiles para Testing

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

# Usar el token
curl -X GET http://localhost:3000/api/inventory \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Verificar estado del servidor:
```bash
curl -I http://localhost:3000/api/auth/login
```

Esta guía te permitirá validar completamente la funcionalidad del sistema BarFlow y confirmar que todos los controles de acceso y validaciones están funcionando correctamente.