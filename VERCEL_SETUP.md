# Vercel Deployment Setup

This project is ready to deploy to Vercel. Follow these steps to deploy both backend and frontend.

---

## Prerequisites

1. **Vercel Account** — [Sign up at vercel.com](https://vercel.com)
2. **GitHub Account** — Already connected
3. **MongoDB Atlas** — MongoDB connection string (see below)

---

## Step 1: Get MongoDB Connection String

### If you don't have MongoDB Atlas:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up/Login
3. Create a new cluster (Free tier available)
4. Go to "Database" → "Connect" → "Drivers"
5. Copy the connection string that looks like:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/intervue?retryWrites=true&w=majority
   ```

### If you already have MongoDB Atlas:
- Get your connection string from the MongoDB Atlas dashboard

---

## Step 2: Deploy Backend to Vercel

1. **Go to [vercel.com](https://vercel.com/dashboard)**

2. **Click "New Project"** → Select your GitHub repo

3. **Configure:**
   - **Framework Preset:** Other
   - **Root Directory:** `backend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add these variables:
     ```
     MONGODB_URI = your_mongodb_connection_string
     NODE_ENV = production
     PORT = 3000
     ```

5. **Click "Deploy"**

6. **Note your Backend URL** (e.g., `https://my-backend-app.vercel.app`)

---

## Step 3: Deploy Frontend to Vercel

1. **Go to [vercel.com](https://vercel.com/dashboard)**

2. **Click "New Project"** → Select your GitHub repo (same repo)

3. **Configure:**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add:
     ```
     VITE_API = https://your-backend-url.vercel.app
     ```
     (Replace with your actual backend URL from Step 2)

5. **Click "Deploy"**

---

## Step 4: Verify Deployment

1. **Frontend:** Visit your Vercel frontend URL
2. **Test:** Try creating a poll as a teacher
3. **Check Network:** Open DevTools → Network tab to confirm API calls to your backend URL

---

## Troubleshooting

### Backend won't start
- Check MongoDB URI is correct
- Ensure `NODE_ENV` is set to `production`
- View logs in Vercel Dashboard → Project → Deployments → Logs

### Frontend can't connect to backend
- Verify `VITE_API` env var matches your backend URL
- Check WebSocket connection (DevTools → Network → WS)
- Ensure backend CORS is configured (see DEPLOY.md)

### Still having issues?
- Check Vercel logs: Dashboard → Deployments → View Logs
- Rebuild: Dashboard → Deployments → Redeploy

---

## Auto-Deployment

Once set up, every push to GitHub automatically triggers a rebuild and deployment on Vercel.

```bash
git push origin main  # Automatically deploys!
```

---

## Update Backend URL in Frontend

After your backend is deployed, update the frontend `.env` or code:

**Option A: Use Environment Variable (Recommended)**
```
VITE_API=https://your-backend-url.vercel.app
```

**Option B: Update Code**
In `frontend/src/pages/Teacher.tsx`, `Student.tsx`, `PollHistory.tsx`:
```typescript
const API = import.meta.env.VITE_API || 'https://your-backend-url.vercel.app'
```

---

## Summary

| Component | Platform | Settings |
|-----------|----------|----------|
| **Backend** | Vercel | Root: `backend/`, Build: `npm run build`, Output: `dist/` |
| **Frontend** | Vercel | Root: `frontend/`, Build: `npm run build`, Output: `dist/` |
| **Database** | MongoDB Atlas | MONGODB_URI environment variable |

Both are now live and auto-deploy on push to GitHub!
