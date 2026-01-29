import mongoose from 'mongoose'

const OptionSchema = new mongoose.Schema({
  id: String,
  text: String,
  votes: { type: Number, default: 0 },
  isCorrect: { type: Boolean, default: false }
})

const PollSchema = new mongoose.Schema({
  question: String,
  options: [OptionSchema],
  duration: Number,
  status: { type: String, default: 'draft' },
  startTime: { type: Number },
  createdAt: { type: Date, default: Date.now }
})

export const PollModel = mongoose.model('Poll', PollSchema)
