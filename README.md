# Intervue - Live Polling System 

This repo contains a minimal implementation of the SDE intern assignment: a resilient live polling system.

Structure:
- backend/ — Node.js + Express + Socket.io (TypeScript)
- frontend/ — React + Vite + TypeScript + Tailwind

I kept the code simple. Run each side separately.

Backend quick start:
1. cd backend
2. cp .env.example .env
3. npm install
4. npm run dev

Frontend quick start:
1. cd frontend
2. npm install
3. npm run dev

By default the frontend expects backend at http://localhost:4000. You can change Vite env vars in `frontend/.env` if needed.
