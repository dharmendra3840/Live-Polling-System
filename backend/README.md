# Backend - Intervue Poll (simple scaffold)

This is a minimal Express + Socket.io backend in TypeScript.

Requirements:
- Node 18+ and npm
- MongoDB (optional but recommended). If you don't have MongoDB, the server will still run but persistence will be disabled.

Setup:
1. Copy `.env.example` to `.env` and edit `MONGO_URI` if required.
2. cd backend
3. npm install
4. npm run dev

API endpoints:
- POST /api/polls  -> { question, options: string[], duration }
- GET /api/polls
- GET /api/polls/:id
- POST /api/polls/:id/start

Socket events:
- client -> 'join_room' { pollId?, role, sessionId, name }
- client -> 'submit_vote' { pollId, optionId, sessionId } (callback)
- server -> 'poll_state', 'vote_update'
