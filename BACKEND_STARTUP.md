# CodeArena Backend Startup Guide

The backend infrastructure requires two processes to run simultaneously: the **API Server** and the **Judge Worker**. 

It uses environment-aware configuration, meaning it will automatically load the correct settings based on the command you run. You do not need to manually rename any `.env` files.

---

## 1. Local Development

Before starting, ensure your local Redis server is running (e.g., run `redis-server` in a separate terminal).

To boot the backend locally, you will need two separate terminal windows.

### Terminal 1: Start the API
```bash
cd backend
npm run dev
```
*(Automatically loads `.env.development`)*

### Terminal 2: Start the Judge Worker
```bash
cd backend
npm run worker:dev
```
*(Automatically loads `.env.development`)*

---

## 2. Production Deployment (e.g., Render)

When deploying to a production environment like Render, you will create two separate web services. Render will automatically define the production environment variables (like `DATABASE_URL`, `REDIS_URL`, and `JWT_SECRET`) through its dashboard.

### Service 1: API Server (Web Service)
- **Build Command**: `npm install`
- **Start Command**: `npm start`
*(Automatically loads `.env.production` and relies on dashboard overrides)*

### Service 2: Judge Worker (Background Worker)
- **Build Command**: `npm install`
- **Start Command**: `npm run worker`
*(Automatically loads `.env.production` and relies on dashboard overrides)*

---

## Environment Variables
If you need to see the required environment variables to run the backend, reference `backend/.env.example`.
