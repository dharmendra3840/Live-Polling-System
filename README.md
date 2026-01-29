# Intervue - Live Polling System

A real-time polling platform for teachers to create interactive polls and students to respond in real-time.

## 🏗️ Architecture

| Component | Stack |
|-----------|-------|
| **Backend** | Node.js + Express + Socket.IO + MongoDB (TypeScript) |
| **Frontend** | React + Vite + TypeScript + Tailwind CSS |

## 🚀 Quick Start (Local Development)

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Server runs on `http://localhost:4000`

**Required `.env` variables:**
- `MONGODB_URI` — MongoDB connection string
- `PORT` — (optional, defaults to 4000)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs on `http://localhost:5173` and connects to `http://localhost:4000`

---

## 📦 Build for Production

### Backend
```bash
cd backend
npm run build
```
Creates `dist/index.js`

### Frontend
```bash
cd frontend
npm run build
```
Creates `dist/` with static assets

---

## 🌐 Deployment

See [DEPLOY.md](DEPLOY.md) for complete instructions on deploying to **Vercel** (both backend and frontend).

**TL;DR:**
1. Create `vercel.json` in both `backend/` and `frontend/` (see DEPLOY.md)
2. Push to GitHub
3. Connect repos to Vercel
4. Set environment variables
5. Auto-deploy on push

---

## 📋 Features

- ✅ Teachers create polls with multiple choice questions
- ✅ Mark correct answers for instant feedback
- ✅ Real-time vote tallying with progress bars
- ✅ Students join polls by ID
- ✅ WebSocket-based live updates (Socket.IO)
- ✅ Poll history and analytics
- ✅ Responsive Tailwind UI with custom color palette

---

## 🛠️ Tech Details

### Backend API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/polls` | Create a new poll |
| `GET` | `/api/polls` | List all polls |
| `POST` | `/api/polls/:id/start` | Start a poll |
| `GET` | `/api/polls/:id` | Get poll details |
| `POST` | `/api/polls/:id/vote` | Submit a vote |

### WebSocket Events

- `join_room` — Teacher/student joins a poll room
- `poll_started` — Broadcast poll state to clients
- `vote_update` — Broadcast new vote counts
- `poll_error` — Error notification
- `leave_room` — Clean up when leaving

---

## 📁 Project Structure

```
intervue/
├── backend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── models/
│   │   ├── services/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── socket/
│   │   └── utils/
│   ├── dist/
│   ├── package.json
│   ├── tsconfig.json
│   └── vercel.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── index.css
│   ├── dist/
│   ├── package.json
│   ├── tailwind.config.cjs
│   └── vercel.json
│
├── README.md (this file)
├── DEPLOY.md (deployment guide)
└── .gitignore
```

---

## 🎨 UI Customization

Colors and theming in `frontend/tailwind.config.cjs`:

```javascript
theme: {
  extend: {
    colors: {
      brand: {
        DEFAULT: '#4F0DCE',  // Primary purple
        light: '#7765DA',
        mid: '#5767D0'
      },
      neutral: {
        100: '#F2F2F2',      // Light background
        500: '#6E6E6E',      // Medium text
        700: '#373737'       // Dark text
      }
    }
  }
}
```

---

## 🔧 Environment Variables

### Backend (`.env`)
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/intervue
PORT=4000
NODE_ENV=production
```

### Frontend (`.env`)
```
VITE_API=https://your-backend-url.vercel.app
```

---

## 📝 License

This project is part of the SDE intern assignment.

---

## 💡 Support

For deployment help, see [DEPLOY.md](DEPLOY.md).

For code issues, check the backend/frontend READMEs:
- [backend/README.md](backend/README.md)
- [frontend/README.md](frontend/README.md)
