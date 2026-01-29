import express, { Request, Response } from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

// CORS
app.use(cors({ 
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    /vercel\.app$/
  ],
  credentials: true 
}))

app.use(express.json())

// MongoDB
let db = { connected: false }

async function connectDB() {
  if (db.connected) return
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/intervue-poll'
    await mongoose.connect(mongoUri)
    db.connected = true
    console.log('✅ MongoDB connected')
  } catch (error) {
    console.error('❌ MongoDB error:', error)
  }
}

// Connect on startup
connectDB().catch(console.error)

// Health check
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    message: 'Intervue Poll Backend',
    dbConnected: db.connected
  })
})

// Routes - dynamically import to allow TypeScript compilation
app.use('/api/polls', async (req: Request, res: Response, next: any) => {
  try {
    await connectDB()
    const routes = await import('../src/routes/pollRoutes')
    return routes.default(req, res, next)
  } catch (error) {
    console.error('Route error:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err)
  res.status(500).json({ error: err.message || 'Internal Server Error' })
})

// 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found', path: req.path })
})

export default app
