# Deploy to Render.com (WebSocket Support)

Vercel serverless functions cannot maintain persistent WebSocket connections. **Render.com** provides free Node.js server hosting with full WebSocket support.

## Step 1: Push Latest Code to GitHub

```bash
cd c:\Users\Asus\Downloads\intervue\intervue
git add -A
git commit -m "Restore full Socket.IO support for production deployment"
git push origin main
```

## Step 2: Create Render Account & Deploy Backend

1. Go to [render.com](https://render.com) and sign up (free tier available)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select `intervue` repository
5. Configure:
   - **Name**: `intervue-backend` (or any name)
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`

6. Add Environment Variables:
   - **MONGO_URI**: `mongodb+srv://dh_30:123myDB@cluster0.u2p9tom.mongodb.net/intervue-poll?retryWrites=true&w=majority`
   - **FRONTEND_ORIGIN**: `https://live-polling-system-frontend-psi.vercel.app,http://localhost:5173`
   - **NODE_ENV**: `production`

7. Click **"Create Web Service"**
8. **Wait 5-10 minutes** for deployment to complete
9. Copy your backend URL (e.g., `https://intervue-backend.onrender.com`)

## Step 3: Update Frontend with New Backend URL

Update these files with your new Render backend URL:

### File: `frontend/src/pages/Teacher.tsx`
```tsx
const API = import.meta.env.VITE_API || 'https://intervue-backend.onrender.com'
```

### File: `frontend/src/pages/Student.tsx`
```tsx
const API = import.meta.env.VITE_API || 'https://intervue-backend.onrender.com'
```

### File: `frontend/src/pages/PollHistory.tsx`
```tsx
const API = import.meta.env.VITE_API || 'https://intervue-backend.onrender.com'
```

## Step 4: Redeploy Frontend

```bash
git add -A
git commit -m "Update backend URL to Render.com"
git push origin main
```

Vercel will auto-redeploy frontend with the new backend URL.

## Step 5: Test Socket.IO Connection

1. Open [https://live-polling-system-frontend-psi.vercel.app](https://live-polling-system-frontend-psi.vercel.app)
2. Check browser console - you should see `✅ Socket.IO connected`
3. Create a poll as teacher
4. Join as student
5. Verify real-time vote updates appear instantly

## Render.com Free Tier Limits

- ✅ Supports WebSocket connections (Socket.IO works perfectly)
- ✅ 0.5 GB RAM + shared CPU
- ⚠️ Goes to sleep after 15 minutes of inactivity (you can upgrade to paid for always-on)
- ✅ Ideal for development and testing

## Troubleshooting

### "Socket.IO: WebSocket error"
- **Cause**: Backend not running or not accepting WebSocket connections
- **Fix**: Check Render deployment logs, ensure MONGO_URI is correct

### "Cannot connect to server"
- **Cause**: Wrong backend URL in frontend
- **Fix**: Verify API const has correct Render URL (not vercel.app)

### MongoDB connection fails
- **Cause**: MONGO_URI not set or network blocked
- **Fix**: 
  1. Check MONGO_URI environment variable is set in Render
  2. Verify MongoDB Atlas IP whitelist includes Render's IPs (usually `0.0.0.0/0` for any)

### Frontend deployed but shows old backend
- **Cause**: Vercel cache not cleared
- **Fix**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

## Benefits of Render.com

| Feature | Vercel | Render |
|---------|--------|--------|
| HTTP API | ✅ | ✅ |
| WebSocket | ❌ (serverless) | ✅ (Node server) |
| Socket.IO | ❌ | ✅ |
| Real-time updates | ❌ | ✅ |
| Free tier | ✅ | ✅ |
| Cost for production | $20+/month | $7+/month |

## Next Steps

Once Socket.IO is working:
1. Add polling/fetch fallback for reliability
2. Implement reconnection UI with progress
3. Add offline mode to queue votes
4. Monitor Render logs for production issues
