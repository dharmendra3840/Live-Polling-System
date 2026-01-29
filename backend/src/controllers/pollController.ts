import { Request, Response } from 'express'
import { createPoll, getPoll, listPolls, startPoll } from '../services/pollService'
import { toHttpError } from '../utils/errors'

export async function createPollHandler(req: Request, res: Response) {
  try {
    const { question, options, duration, optionCorrect } = req.body || {}
    if (!question || !Array.isArray(options)) {
      return res.status(400).json({ error: 'invalid request' })
    }
    const poll = await createPoll(question, options, duration, optionCorrect)
    res.json(poll)
  } catch (err: any) {
    const { status, message } = toHttpError(err)
    res.status(status).json({ error: message })
  }
}

export async function listPollsHandler(_req: Request, res: Response) {
  try {
    const polls = await listPolls()
    res.json(polls)
  } catch (err: any) {
    const { status, message } = toHttpError(err)
    res.status(status).json({ error: message })
  }
}

export async function getPollHandler(req: Request, res: Response) {
  try {
    const poll = await getPoll(req.params.id)
    if (!poll) return res.status(404).json({ error: 'not found' })
    res.json(poll)
  } catch (err: any) {
    const { status, message } = toHttpError(err)
    res.status(status).json({ error: message })
  }
}

export async function startPollHandler(req: Request, res: Response) {
  try {
    const poll = await startPoll(req.params.id)
    res.json(poll)
  } catch (err: any) {
    const { status, message } = toHttpError(err)
    res.status(status).json({ error: message })
  }
}
