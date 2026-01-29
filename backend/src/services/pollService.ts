import { PollModel } from '../models/poll'
import { VoteModel } from '../models/vote'
import { ensureDbConnection } from '../utils/db'

function generateId(length: number = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function isPollExpired(poll: any) {
  if (!poll || poll.status !== 'active') return false
  if (!poll.startTime || !poll.duration) return false
  return Date.now() - poll.startTime >= poll.duration * 1000
}

function withCode(message: string, code: string) {
  const err: any = new Error(message)
  err.code = code
  return err
}

async function endPoll(poll: any) {
  poll.status = 'ended'
  await poll.save()
  return poll
}

export async function maybeEndPollIfExpired(poll: any) {
  if (!poll) return null
  if (!isPollExpired(poll)) return poll
  return endPoll(poll)
}

export async function createPoll(question: string, options: string[], duration = 60, optionCorrect?: (boolean | null)[]): Promise<any> {
  ensureDbConnection()
  if (!question || !options || options.filter(Boolean).length < 2) {
    throw withCode('invalid poll data', 'VALIDATION')
  }
  const opts = options.map((t, idx) => ({ 
    id: generateId(6), 
    text: t, 
    votes: 0,
    isCorrect: optionCorrect?.[idx] === true ? true : false
  }))
  const poll = new PollModel({ question, options: opts, duration, status: 'draft' })
  await poll.save()
  return poll
}

export async function startPoll(pollId: string) {
  ensureDbConnection()
  const active = await PollModel.findOne({ status: 'active' })
  if (active) {
    const updated = await maybeEndPollIfExpired(active)
    if (updated && updated.status === 'active') {
      throw withCode('Another poll is already active', 'POLL_ACTIVE')
    }
  }

  const poll = await PollModel.findById(pollId)
  if (!poll) throw withCode('Poll not found', 'POLL_NOT_FOUND')
  poll.status = 'active'
  poll.startTime = Date.now()
  await poll.save()
  return poll
}

export async function getPoll(pollId: string) {
  ensureDbConnection()
  const poll = await PollModel.findById(pollId)
  if (!poll) return null
  return maybeEndPollIfExpired(poll)
}

export async function listPolls() {
  ensureDbConnection()
  return PollModel.find().sort({ createdAt: -1 }).limit(50)
}

export async function getActivePoll() {
  ensureDbConnection()
  const poll = await PollModel.findOne({ status: 'active' })
  if (!poll) return null
  return maybeEndPollIfExpired(poll)
}

export async function maybeEndPollIfAllAnswered(pollId: string, expectedCount: number) {
  ensureDbConnection()
  if (!expectedCount || expectedCount <= 0) return null
  const votes = await VoteModel.countDocuments({ pollId })
  if (votes < expectedCount) return null
  const poll = await PollModel.findById(pollId)
  if (!poll) return null
  if (poll.status !== 'active') return poll
  return endPoll(poll)
}
export async function addVote(pollId: string, optionId: string, sessionId: string) {
  ensureDbConnection()
  const poll = await PollModel.findById(pollId)
  if (!poll) throw withCode('Poll not found', 'POLL_NOT_FOUND')
  if (poll.status !== 'active') {
    throw withCode('poll not active', 'POLL_INACTIVE')
  }
  const maybeEnded = await maybeEndPollIfExpired(poll)
  if (maybeEnded && maybeEnded.status !== 'active') {
    throw withCode('poll ended', 'POLL_ENDED')
  }
  const opt = poll.options.find((o: any) => o.id === optionId)
  if (!opt) throw withCode('Option not found', 'OPTION_NOT_FOUND')

  try {
    await VoteModel.create({ pollId: poll._id, optionId, sessionId })

    await PollModel.updateOne({ _id: pollId, 'options.id': optionId }, { $inc: { 'options.$.votes': 1 } })

    return PollModel.findById(pollId)
  } catch (err: any) {
    if (err && err.code === 11000) {
      throw withCode('already voted', 'ALREADY_VOTED')
    }
    throw err
  }
}
