import express from 'express'
import { createPollHandler, getPollHandler, listPollsHandler, startPollHandler } from '../controllers/pollController'

const router = express.Router()

router.post('/', createPollHandler)
router.get('/', listPollsHandler)
router.get('/:id', getPollHandler)
router.post('/:id/start', startPollHandler)

export default router
