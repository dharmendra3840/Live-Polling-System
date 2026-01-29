import mongoose from 'mongoose'

const VoteSchema = new mongoose.Schema({
  pollId: { type: mongoose.Schema.Types.ObjectId, ref: 'Poll', required: true },
  optionId: { type: String, required: true },
  sessionId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
})

VoteSchema.index({ pollId: 1, sessionId: 1 }, { unique: true })

export const VoteModel = mongoose.model('Vote', VoteSchema)
