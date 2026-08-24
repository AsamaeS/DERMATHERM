# DERMATHERM — Deployment Guide

## Quick Start (Local Development)

### Prerequisites
- Node.js 20+ 
- npm or yarn

### 1. Clone and Install

```bash
git clone <repository-url>
cd dermatherm

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your API keys (optional but recommended)
# FEATHERLESS_API_KEY=...
# FIRECRAWL_API_KEY=...
```

### 3. Start Development Servers

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Docker Deployment (Production)

### 1. Build and Run with Docker Compose

```bash
# Create .env file with your API keys
cp .env.example .env

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

Frontend: http://localhost:3000  
Backend API: http://localhost:8000  
Health check: http://localhost:8000/api/health

### 2. Stop Services

```bash
docker-compose down
```

---

## Deploy to Render

### Backend (Web Service)

1. Connect your GitHub repository
2. Create a new Web Service
3. Configure:
   - **Build Command:** `cd backend && npm ci && npm run build`
   - **Start Command:** `cd backend && npm start`
   - **Environment Variables:**
     - `PORT=8000`
     - `NODE_ENV=production`
     - `DATABASE_PATH=/var/data/dermatherm.db`
     - `FEATHERLESS_API_KEY` (your key)
     - `FEATHERLESS_MODEL=Qwen/Qwen2.5-72B-Instruct`
     - `FIRECRAWL_API_KEY` (your key)
4. Add a persistent disk at `/var/data` (for SQLite database)

### Frontend (Static Site)

1. Create a new Static Site
2. Configure:
   - **Build Command:** `npm ci && npm run build`
   - **Publish Directory:** `dist`
   - **Environment Variables:**
     - `VITE_API_URL` (your backend URL)
3. Deploy

---

## Deploy to Vercel (Frontend Only)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
vercel

# Set environment variable
vercel env add VITE_API_URL
```

Note: Deploy backend separately (Render, Railway, Fly.io recommended).

---

## Deploy to Railway

### Backend

1. Create new project from GitHub
2. Add service: Backend
3. Set root directory: `/backend`
4. Add environment variables
5. Deploy

### Frontend

1. Add service: Frontend  
2. Set root directory: `/`
3. Build command: `npm run build`
4. Start command: `npx serve -s dist`
5. Add environment variable: `VITE_API_URL`
6. Deploy

---

## Environment Variables Reference

### Required (Backend)
- `PORT` — Server port (default: 8000)
- `DATABASE_PATH` — SQLite database location
- `FRONTEND_URL` — CORS allowed origin

### Optional but Recommended
- `FEATHERLESS_API_KEY` — Qwen literature extraction
- `FEATHERLESS_MODEL` — Model to use (default: Qwen2.5-72B)
- `FIRECRAWL_API_KEY` — Literature search
- `WOLFRAM_APP_ID` — Independent PDE verification

### Required (Frontend)
- `VITE_API_URL` — Backend API endpoint

---

## Health Checks

Backend health endpoint: `GET /api/health`

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-...",
  "services": {
    "database": "operational",
    "qwen": "configured",
    "firecrawl": "configured",
    "wolfram": "not configured"
  },
  "version": "1.0.0"
}
```

---

## Database Migrations

The application uses SQLite with automatic schema initialization.

On first run:
1. Database schema is created automatically
2. Default materials are seeded
3. Ready for use

To reset database:
```bash
rm backend/data/dermatherm.db
# Restart backend — schema will be recreated
```

---

## Testing the Deployment

### 1. Check Backend Health
```bash
curl http://localhost:8000/api/health
```

### 2. List Materials
```bash
curl http://localhost:8000/api/materials
```

### 3. Create Test Experiment
```bash
curl -X POST http://localhost:8000/api/experiments \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

### 4. Run Simulation in Frontend
1. Navigate to Materials Registry
2. Select a material
3. Click "Use in simulation"
4. Configure climate
5. Run solver (browser-based)
6. Results are automatically saved to backend

---

## Security Checklist

✅ No secrets committed to git  
✅ `.env` in `.gitignore`  
✅ `.env.example` provided  
✅ CORS configured  
✅ Input validation on all endpoints  
✅ Request size limits  
✅ Health check endpoint  
✅ Non-root Docker user  
✅ Read-only filesystem where possible  

---

## Troubleshooting

### "Cannot connect to backend"
- Check `VITE_API_URL` is set correctly
- Verify backend is running: `curl http://localhost:8000/api/health`
- Check CORS configuration

### "Database locked"
- SQLite doesn't support concurrent writes well
- For production, consider PostgreSQL migration
- Current setup is fine for research prototype

### "Qwen/Firecrawl not working"
- Verify API keys in `.env`
- Check backend logs: `docker-compose logs backend`
- Services are optional — app works without them

### "Simulation not saving"
- Check browser console for errors
- Verify experiment was created first
- Check network tab for failed API calls

---

## Performance Notes

- **Simulation:** Runs entirely in browser (no server load)
- **PINN Training:** Currently browser-based (can be moved to server)
- **Database:** SQLite suitable for single-user research prototype
- **Scaling:** For multi-user, migrate to PostgreSQL + separate compute workers

---

## Scientific Correctness Verification

Before demo/presentation:

1. ✅ Run simulation: 42°C, 85% RH
2. ✅ Verify 2D temperature field displays
3. ✅ Verify moisture field displays  
4. ✅ Check conservation error < 1%
5. ✅ Confirm units shown on all values
6. ✅ Verify material evidence status visible
7. ✅ Check limitation IDs present
8. ✅ Test experiment save/load
9. ✅ Verify PINN benchmark runs
10. ✅ Check no secrets in logs

---

## Support

For issues: Check console logs, backend logs, and health endpoint first.

**IMPORTANT:** This is a research prototype. Production deployment requires additional hardening, monitoring, and potentially different architectural choices.
