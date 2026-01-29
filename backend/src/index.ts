import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import pollRoutes from './routes/pollRoutes'
import { setupPollSocket } from './socket/pollSocket'

dotenv.config()

const app = express()
const defaultOrigins = ['http://localhost:5173', 'http://localhost:5174', /vercel\.app$/, /render\.app$/]
const frontendOrigin = process.env.FRONTEND_ORIGIN
  ? process.env.FRONTEND_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : defaultOrigins

app.use(cors({ origin: frontendOrigin, credentials: true }))
app.use(express.json())

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Intervue Poll Backend', hasSocketIO: true })
})

app.use('/api/polls', pollRoutes)

const port = process.env.PORT || 4000
const server = http.createServer(app)

const io = new Server(server, { 
  cors: { origin: frontendOrigin, credentials: true }
})

setupPollSocket(io)

// MongoDB connection
let mongoConnected = false
async function connectDB() {
  if (mongoConnected) return
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/intervue-poll'
  try {
    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB')
    mongoConnected = true
  } catch (err) {
    console.warn('⚠️ Could not connect to MongoDB:', err)
  }
}

async function start() {
  await connectDB()
  
  server.listen(port, () => {
    console.log(`✅ Server listening on http://localhost:${port}`)
    console.log(`✅ Socket.IO ready at ws://localhost:${port}`)
  })
}

start().catch(console.error)

// Export app for any serverless platform that supports WebSocket
export default app
