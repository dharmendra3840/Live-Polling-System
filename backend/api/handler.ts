import express, { Request, Response } from 'express'
import { Server } from 'socket.io'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import pollRoutes from '../src/routes/pollRoutes'
import { setupPollSocket } from '../src/socket/pollSocket'

dotenv.config()

const app = express()
const defaultOrigins = ['http://localhost:5173', 'http://localhost:5174', 'https://*.vercel.app']
const frontendOrigin = process.env.FRONTEND_ORIGIN
  ? process.env.FRONTEND_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : defaultOrigins

app.use(cors({ origin: frontendOrigin, credentials: true }))
app.use(express.json())

// Health check
app.get('/', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Intervue Poll Backend', timestamp: new Date().toISOString() })
})

app.use('/api/polls', pollRoutes)

// Initialize MongoDB connection (singleton)
let dbConnected = false
const initDb = async () => {
  if (dbConnected) return
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/intervue-poll'
  try {
    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB')
    dbConnected = true
  } catch (err) {
    console.warn('⚠️ Could not connect to MongoDB:', err)
  }
}

// Initialize DB on first request
app.use(async (req: Request, res: Response, next) => {
  await initDb()
  next()
})

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found', path: req.path })
})

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err)
  res.status(500).json({ error: 'Internal Server Error', message: err.message })
})

// Export for Vercel
export default app
