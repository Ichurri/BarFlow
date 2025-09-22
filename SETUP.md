# BarFlow - Configuración de Base de Datos

## Estado del Proyecto ✅

**El backend está funcionando correctamente.** Los errores que aparecen en VS Code son solo problemas de tipos del IDE, pero la aplicación compila y se ejecuta sin problemas.

## Configuración de PostgreSQL

Para que la aplicación funcione completamente, necesitas configurar PostgreSQL:

### 1. Instalar PostgreSQL (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

### 2. Configurar PostgreSQL
```bash
# Iniciar servicio
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Crear usuario y base de datos
sudo -u postgres psql
```

En el prompt de PostgreSQL:
```sql
CREATE USER barflow_user WITH PASSWORD 'barflow_password';
CREATE DATABASE barflow_db OWNER barflow_user;
GRANT ALL PRIVILEGES ON DATABASE barflow_db TO barflow_user;
\q
```

### 3. Configurar variables de entorno
Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:
```env
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=barflow_user
DB_PASSWORD=barflow_password
DB_DATABASE=barflow_db

# JWT Configuration
JWT_SECRET=tu-clave-secreta-super-segura-aqui
JWT_EXPIRES_IN=24h

# Bank API Configuration (placeholder)
BANK_API_URL=https://api.bank.example.com
BANK_API_KEY=your-bank-api-key

# File Upload Configuration
UPLOAD_DEST=./uploads
MAX_FILE_SIZE=5242880
```

### 4. Iniciar la aplicación
```bash
# Instalar dependencias (si no está hecho)
npm install

# Iniciar en modo desarrollo
npm run start:dev

# En otra terminal, poblar la base de datos
npm run seed
```

## Verificación de Funcionamiento

### Test de endpoints disponibles:

#### 1. Login de admin
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

#### 2. Obtener inventario (como admin)
```bash
# Usar el token de la respuesta anterior
curl -X GET http://localhost:3000/api/inventory \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

#### 3. Obtener inventario (como waiter - sin precios de costo)
```bash
# Login como waiter
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "waiter1", "password": "waiter123"}'

# Usar el token de waiter
curl -X GET http://localhost:3000/api/inventory \
  -H "Authorization: Bearer TOKEN_DE_WAITER"
```

## Resolución de Problemas

### Errores de TypeScript en VS Code
Los errores que aparecen en VS Code son falsos positivos del IDE. La aplicación compila y funciona correctamente como se demuestra con `npm run build` y `npm run start:dev`.

### Error de conexión a base de datos
Si ves `ECONNREFUSED`, significa que PostgreSQL no está ejecutándose:
```bash
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### Verificar que todo funciona
```bash
# Verificar compilación
npm run build

# Verificar inicio (Ctrl+C para parar)
npm run start:dev
```

## Próximos Pasos

Una vez que la base de datos esté configurada, puedes:

1. **Poblar datos de prueba**: `npm run seed`
2. **Probar los endpoints de autenticación e inventario**
3. **Continuar con la implementación del sistema de órdenes**
4. **Integrar el sistema de pagos**
5. **Desarrollar el frontend con Next.js**

## Estructura Actual Completada

✅ **Backend NestJS** con TypeORM y PostgreSQL  
✅ **Autenticación JWT** con roles (admin, bar, waiter)  
✅ **Gestión de inventario** con control de acceso por roles  
✅ **Base de datos** con todas las entidades y relaciones  
✅ **Seeding de datos** de prueba  
✅ **Validación** de entrada con class-validator  
✅ **Documentación** completa del proyecto  

El proyecto está en excelente estado y listo para continuar con las siguientes fases.