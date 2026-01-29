import express from 'express'
import { Server } from 'socket.io'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import pollRoutes from '../src/routes/pollRoutes'
import { setupPollSocket } from '../src/socket/pollSocket'
import type { VercelRequest, VercelResponse } from '@vercel/node'

dotenv.config()

const app = express()
const defaultOrigins = ['http://localhost:5173', 'http://localhost:5174']
const frontendOrigin = process.env.FRONTEND_ORIGIN
  ? process.env.FRONTEND_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : defaultOrigins

app.use(cors({ origin: frontendOrigin }))
app.use(express.json())
app.use('/api/polls', pollRoutes)

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Intervue Poll Backend' })
})

// Initialize MongoDB connection (once per cold start)
let dbConnected = false
const initDb = async () => {
  if (dbConnected) return
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/intervue-poll'
  try {
    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB')
    dbConnected = true
  } catch (err) {
    console.warn('Could not connect to MongoDB, running with persistence disabled', err)
  }
}

// Initialize Socket.IO for serverless (if needed)
// Note: Socket.IO on serverless is limited; consider using a dedicated server or upgrade plan
let io: any = null
const initSocket = (req: any) => {
  if (!io) {
    io = new Server({
      cors: { origin: frontendOrigin }
    })
    setupPollSocket(io)
  }
  return io
}

// Vercel serverless handler
export default async (req: VercelRequest, res: VercelResponse) => {
  await initDb()
  // Route to Express app
  return app(req, res)
}

// For Socket.IO support (requires Vercel Pro/Business plan)
// You may need to upgrade Vercel plan for WebSocket support
export const config = {
  runtime: 'nodejs',
}
