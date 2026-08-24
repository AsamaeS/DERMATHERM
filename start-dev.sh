#!/bin/bash
# ================================================================
# DERMATHERM — Development Startup Script
# ================================================================

set -e

echo "================================================="
echo "  DERMATHERM — Starting Development Environment"
echo "================================================="
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Copying from .env.example..."
    cp .env.example .env
    echo "✓ Created .env file"
    echo "⚠️  Please edit .env with your API keys if you have them"
    echo ""
fi

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    echo "✓ Backend dependencies installed"
    echo ""
fi

# Check if frontend dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
    echo "✓ Frontend dependencies installed"
    echo ""
fi

# Create data directory if it doesn't exist
mkdir -p backend/data

echo "🚀 Starting services..."
echo ""

# Start backend in background
echo "Starting backend on http://localhost:8000..."
cd backend
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "Starting frontend on http://localhost:5173..."
echo ""
echo "================================================="
echo "  ✓ Dermatherm is running!"
echo "================================================="
echo ""
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo "  Health:   http://localhost:8000/api/health"
echo ""
echo "  Press Ctrl+C to stop all services"
echo "================================================="
echo ""

# Create logs directory
mkdir -p logs

# Start frontend (this will block)
npm run dev

# Cleanup on exit
trap "echo 'Stopping backend...'; kill $BACKEND_PID 2>/dev/null; exit" INT TERM EXIT
