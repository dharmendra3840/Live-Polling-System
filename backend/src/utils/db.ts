import mongoose from 'mongoose'

export function ensureDbConnection() {
  if (mongoose.connection.readyState !== 1) {
    const err: any = new Error('database unavailable')
    err.code = 'DB_UNAVAILABLE'
    throw err
  }
}
