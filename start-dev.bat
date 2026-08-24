@echo off
REM ================================================================
REM DERMATHERM — Development Startup Script (Windows)
REM ================================================================

echo =================================================
echo   DERMATHERM — Starting Development Environment
echo =================================================
echo.

REM Check if .env exists
if not exist ".env" (
    echo ⚠️  No .env file found. Copying from .env.example...
    copy .env.example .env
    echo ✓ Created .env file
    echo ⚠️  Please edit .env with your API keys if you have them
    echo.
)

REM Check if backend dependencies are installed
if not exist "backend\node_modules" (
    echo 📦 Installing backend dependencies...
    cd backend
    call npm install
    cd ..
    echo ✓ Backend dependencies installed
    echo.
)

REM Check if frontend dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    call npm install
    echo ✓ Frontend dependencies installed
    echo.
)

REM Create data directory
if not exist "backend\data" mkdir backend\data
if not exist "logs" mkdir logs

echo 🚀 Starting services...
echo.

REM Start backend in new window
echo Starting backend on http://localhost:8000...
start "Dermatherm Backend" cmd /c "cd backend && npm run dev"

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo Starting frontend on http://localhost:5173...
echo.
echo =================================================
echo   ✓ Dermatherm is running!
echo =================================================
echo.
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8000
echo   Health:   http://localhost:8000/api/health
echo.
echo   Close this window to stop frontend
echo   Close backend window to stop backend
echo =================================================
echo.

npm run dev
