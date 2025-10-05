#!/bin/bash

# BarFlow Development Script
# Este script facilita el desarrollo local del proyecto

BACKEND_DIR="/home/ichurri/Desktop/projects/BarFlow/backend"
FRONTEND_DIR="/home/ichurri/Desktop/projects/BarFlow/frontend"

function print_help() {
    echo "BarFlow Development Script"
    echo "=========================="
    echo ""
    echo "Uso: $0 [opción]"
    echo ""
    echo "Opciones:"
    echo "  start-local     Iniciar desarrollo completo local (backend + frontend)"
    echo "  start-backend   Iniciar solo backend en modo desarrollo"
    echo "  start-frontend  Iniciar solo frontend en modo desarrollo"
    echo "  start-hybrid    Iniciar frontend local contra backend de producción"
    echo "  build           Compilar ambos proyectos"
    echo "  seed            Poblar base de datos con datos de prueba"
    echo "  status          Mostrar estado de los servicios"
    echo "  help            Mostrar esta ayuda"
    echo ""
    echo "URLs:"
    echo "  Backend local:  http://localhost:4000/api"
    echo "  Frontend local: http://localhost:3000 o http://localhost:3001"
    echo "  Backend prod:   https://barflow.onrender.com/api"
    echo "  Frontend prod:  https://bar-flow-client.vercel.app"
}

function start_backend() {
    echo "🚀 Iniciando Backend en modo desarrollo..."
    cd "$BACKEND_DIR"
    
    # Usar configuración de desarrollo
    echo "📁 Usando configuración .env.development"
    cp .env.development .env
    
    npm run start:dev
}

function start_frontend() {
    echo "🎨 Iniciando Frontend en modo desarrollo..."
    cd "$FRONTEND_DIR"
    
    # Usar configuración de desarrollo
    echo "📁 Usando configuración .env.development"
    cp .env.development .env
    
    npm run dev
}

function start_hybrid() {
    echo "🔄 Iniciando desarrollo híbrido (Frontend local + Backend producción)..."
    cd "$FRONTEND_DIR"
    
    # Usar configuración de producción para apuntar a backend de producción
    echo "📁 Usando configuración .env.production (backend de producción)"
    cp .env.production .env
    
    npm run dev
}

function build_projects() {
    echo "🔨 Compilando proyectos..."
    
    echo "📦 Compilando Backend..."
    cd "$BACKEND_DIR"
    npm run build
    
    echo "📦 Compilando Frontend..."
    cd "$FRONTEND_DIR"
    npm run build
    
    echo "✅ Compilación completada"
}

function seed_database() {
    echo "🌱 Poblando base de datos..."
    cd "$BACKEND_DIR"
    
    echo "📊 Ejecutando seed básico..."
    npm run seed
    
    echo "🎵 Ejecutando seed de discoteca..."
    npm run seed:nightclub
    
    echo "✅ Base de datos poblada correctamente"
}

function check_status() {
    echo "📊 Estado de los servicios:"
    echo "=========================="
    
    # Verificar backend local
    if curl -s http://localhost:4000/api/inventory/public > /dev/null 2>&1; then
        echo "✅ Backend local: FUNCIONANDO (http://localhost:4000/api)"
    else
        echo "❌ Backend local: NO DISPONIBLE"
    fi
    
    # Verificar frontend local
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Frontend local: FUNCIONANDO (http://localhost:3000)"
    elif curl -s http://localhost:3001 > /dev/null 2>&1; then
        echo "✅ Frontend local: FUNCIONANDO (http://localhost:3001)"
    else
        echo "❌ Frontend local: NO DISPONIBLE"
    fi
    
    # Verificar backend de producción
    if curl -s https://barflow.onrender.com/api/inventory/public > /dev/null 2>&1; then
        echo "✅ Backend producción: FUNCIONANDO (https://barflow.onrender.com)"
    else
        echo "❌ Backend producción: NO DISPONIBLE"
    fi
    
    # Verificar frontend de producción
    if curl -s https://bar-flow-client.vercel.app > /dev/null 2>&1; then
        echo "✅ Frontend producción: FUNCIONANDO (https://bar-flow-client.vercel.app)"
    else
        echo "❌ Frontend producción: NO DISPONIBLE"
    fi
}

# Main script logic
case "${1:-help}" in
    "start-local")
        echo "🚀 Iniciando desarrollo local completo..."
        echo "Abrir 2 terminales:"
        echo "Terminal 1: $0 start-backend"
        echo "Terminal 2: $0 start-frontend"
        ;;
    "start-backend")
        start_backend
        ;;
    "start-frontend")
        start_frontend
        ;;
    "start-hybrid")
        start_hybrid
        ;;
    "build")
        build_projects
        ;;
    "seed")
        seed_database
        ;;
    "status")
        check_status
        ;;
    "help"|*)
        print_help
        ;;
esac