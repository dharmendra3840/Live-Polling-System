# 🚀 Vercel Deployment Checklist

## ✅ What I've Added

1. **`backend/vercel.json`** — Backend deployment config
2. **`frontend/vercel.json`** — Frontend deployment config  
3. **`backend/.env.example`** — MongoDB URI template
4. **`frontend/.env.example`** — API URL template
5. **`VERCEL_SETUP.md`** — Step-by-step deployment guide
6. **Pushed to GitHub** ✓

---

## 📋 What I Need From You

### ⚠️ REQUIRED CREDENTIALS:

1. **MongoDB Connection String**
   - From: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Format: `mongodb+srv://username:password@cluster.xxxxx.mongodb.net/intervue?retryWrites=true&w=majority`
   - Provide this when asked for `MONGODB_URI` on Vercel

2. **Vercel Account**
   - Free account at [vercel.com](https://vercel.com)
   - Login with your GitHub account

---

## 🎯 Next Steps (Quick Guide)

### Backend Deployment:
1. Go to https://vercel.com/dashboard
2. Click "New Project" → Select your GitHub repo
3. Set Root Directory: `backend`
4. Add env var: `MONGODB_URI` = your MongoDB connection string
5. Click "Deploy"
6. **Copy your backend URL** (e.g., `https://my-backend.vercel.app`)

### Frontend Deployment:
1. Click "New Project" → Select same GitHub repo
2. Set Root Directory: `frontend`
3. Add env var: `VITE_API` = your backend URL from above
4. Click "Deploy"
5. Done! 🎉

---

## 📞 Questions?

- **Detailed guide:** See [VERCEL_SETUP.md](../VERCEL_SETUP.md)
- **General deployment:** See [DEPLOY.md](../DEPLOY.md)
- **MongoDB setup:** See [MongoDB Atlas Free Tier Guide](https://www.mongodb.com/docs/cloud/atlas/)

---

## ✨ After Deployment

Every push to GitHub automatically redeploys both backend and frontend on Vercel!

```bash
git push origin main  # ← Auto-deploys
```

---

**Ready to deploy? Follow the steps above and provide your MongoDB URI when prompted!**
