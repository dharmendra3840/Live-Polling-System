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
const defaultOrigins = ['http://localhost:5173', 'http://localhost:5174']
const frontendOrigin = process.env.FRONTEND_ORIGIN
  ? process.env.FRONTEND_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : defaultOrigins

app.use(cors({ origin: frontendOrigin }))
app.use(express.json())

app.use('/api/polls', pollRoutes)

const port = process.env.PORT || 4000
const server = http.createServer(app)

const io = new Server(server, { cors: { origin: frontendOrigin } })

setupPollSocket(io)

async function start() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/intervue-poll'
  try {
    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB')
  } catch (err) {
    console.warn('Could not connect to MongoDB, running with persistence disabled', err)
  }

  server.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`)
  })
}

start()
