# BarFlow - Configuración de Desarrollo y Producción

## 🏗️ Configuraciones de Entorno

### **Frontend**

#### **Desarrollo Local** (usa backend local)
```bash
# Archivo: frontend/.env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

#### **Desarrollo contra Producción** (usa backend de producción)
```bash
# Archivo: frontend/.env.local
NEXT_PUBLIC_API_URL=https://barflow.onrender.com/api
```

#### **Producción** (Vercel)
```bash
# Archivo: frontend/.env.production
NEXT_PUBLIC_API_URL=https://barflow.onrender.com/api
```

### **Backend**

#### **Desarrollo Local** (con base de datos local)
```bash
# Archivo: backend/.env.development
NODE_ENV=development
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=barflow_user
DB_PASSWORD=barflow_password
DB_DATABASE=barflow_db
DB_SSL=false
```

#### **Desarrollo contra Producción** (usa BD de producción)
```bash
# Archivo: backend/.env.local
NODE_ENV=development
PORT=4000
DB_HOST=dpg-d3ej9q3uibrs73c9tco0-a.oregon-postgres.render.com
DB_PORT=5432
DB_USERNAME=barflow_user
DB_PASSWORD=KvtRuti0sU4dVw4vfBwFIwTg5yunTlGC
DB_DATABASE=barflow_db
DB_SSL=true
```

#### **Producción** (Render)
```bash
# Archivo: backend/.env
NODE_ENV=production
DB_HOST=dpg-d3ej9q3uibrs73c9tco0-a.oregon-postgres.render.com
# ... configuración de producción
```

---

## 🚀 Cómo Ejecutar

### **Opción 1: Desarrollo Completo Local**

#### **1. Backend Local con Base de Datos Local**
```bash
# 1. Configurar PostgreSQL local
sudo apt install postgresql postgresql-contrib
sudo -u postgres psql

# En PostgreSQL:
CREATE USER barflow_user WITH PASSWORD 'barflow_password';
CREATE DATABASE barflow_db OWNER barflow_user;
GRANT ALL PRIVILEGES ON DATABASE barflow_db TO barflow_user;
\q

# 2. Usar configuración de desarrollo
cd backend
cp .env.development .env
npm install
npm run start:dev

# 3. Poblar base de datos
npm run seed
npm run seed:nightclub
```

#### **2. Frontend Local**
```bash
cd frontend
# El archivo .env ya está configurado para localhost
npm install
npm run dev
```

**URLs:**
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- API: http://localhost:4000/api

---

### **Opción 2: Desarrollo Híbrido (Frontend local + Backend producción)**

#### **Frontend Local contra Backend de Producción**
```bash
cd frontend
# Crear/usar .env.local para apuntar a producción
echo "NEXT_PUBLIC_API_URL=https://barflow.onrender.com/api" > .env.local
npm install
npm run dev
```

**URLs:**
- Frontend: http://localhost:3000
- Backend: https://barflow.onrender.com
- API: https://barflow.onrender.com/api

---

### **Opción 3: Backend Local contra Base de Datos de Producción**

```bash
cd backend
# Usar .env.local (ya configurado para BD de producción)
cp .env.local .env
npm install
npm run start:dev
```

**URLs:**
- Backend: http://localhost:4000
- BD: Render PostgreSQL (producción)

---

## 🔧 Scripts Disponibles

### **Backend**
```bash
npm run start:dev      # Desarrollo con hot reload
npm run start:prod     # Producción
npm run build          # Compilar TypeScript
npm run seed           # Poblar BD con datos básicos
npm run seed:nightclub # Poblar BD con datos de discoteca
```

### **Frontend**
```bash
npm run dev    # Desarrollo con Turbopack
npm run build  # Build para producción
npm run start  # Servidor de producción local
```

---

## 🌍 URLs de Producción

- **Frontend**: https://bar-flow-client.vercel.app
- **Backend**: https://barflow.onrender.com
- **API**: https://barflow.onrender.com/api

---

## 📂 Archivos de Configuración

```
BarFlow/
├── backend/
│   ├── .env                 # Producción (Render)
│   ├── .env.local          # Dev con BD producción
│   ├── .env.development    # Dev con BD local
│   └── src/main.ts         # Configuración CORS
├── frontend/
│   ├── .env                 # Desarrollo local
│   ├── .env.local          # Dev contra backend producción
│   ├── .env.development    # Desarrollo local (redundante)
│   └── .env.production     # Producción (Vercel)
```

---

## 🔒 Configuración CORS

El backend acepta requests desde:
- **Producción**: `https://bar-flow-client.vercel.app`
- **Desarrollo**: `http://localhost:3000`, `http://localhost:3001`
- **Variable**: `process.env.FRONTEND_URL`

---

## 💡 Recomendaciones

1. **Para desarrollo nuevo**: Usa Opción 1 (todo local)
2. **Para pruebas rápidas**: Usa Opción 2 (frontend local + backend producción)
3. **Para debug de backend**: Usa Opción 3 (backend local + BD producción)

El proyecto está configurado para máxima flexibilidad entre desarrollo local y producción.