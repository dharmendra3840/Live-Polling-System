import { Server, Socket } from 'socket.io'
import { addVote, getActivePoll, getPoll, maybeEndPollIfAllAnswered } from '../services/pollService'
import { toSocketError } from '../utils/errors'

const studentsRoom = 'students'

const participants: Map<string, Map<string, { socketId: string; name?: string; role?: string }>> = new Map()

function buildParticipantList(map?: Map<string, { socketId: string; name?: string; role?: string }>) {
  return map
    ? Array.from(map.entries())
        .filter(([, info]) => info.role === 'student')
        .map(([sid, info]) => ({ sessionId: sid, name: info.name }))
    : []
}

export async function handleJoinRoom(io: Server, socket: Socket, data: any) {
  const { pollId, role, sessionId, name } = data || {}
  if (role === 'student') socket.join(studentsRoom)
  if (pollId) socket.join(pollId)
  socket.data.sessionId = sessionId
  socket.data.name = name
  socket.data.role = role

  
  if (pollId && sessionId && role === 'student') {
    if (!participants.has(pollId)) participants.set(pollId, new Map())
    participants.get(pollId)!.set(sessionId, { socketId: socket.id, name, role })
    
    const plist = buildParticipantList(participants.get(pollId))
    io.to(pollId).emit('participants_update', { participants: plist })
  }

  if (pollId) {
    const plist = buildParticipantList(participants.get(pollId))
    io.to(pollId).emit('participants_update', { participants: plist })
  }

  if (pollId) {
    try {
      const poll = await getPoll(pollId)
      if (poll) {
        socket.emit('poll_state', { poll, serverTime: Date.now() })
      }
    } catch (err) {
      socket.emit('poll_error', toSocketError(err))
    }
  }
}

export async function handleRequestState(socket: Socket, data: any, cb: any) {
  try {
    const { pollId } = data || {}
    let poll = null
    if (pollId) {
      poll = await getPoll(pollId)
    } else {
    
      poll = await getActivePoll()
    }
    if (poll) {
      socket.emit('poll_state', { poll, serverTime: Date.now() })
      cb && cb({ ok: true })
    } else {
      cb && cb({ ok: false, error: 'no active poll' })
    }
  } catch (err: any) {
    const payload = toSocketError(err)
    cb && cb(payload)
  }
}

export function handlePollStarted(io: Server, data: any) {
  try {
    const { poll } = data || {}
    if (!poll || !poll._id) return
    
    io.to(poll._id).emit('poll_state', { poll, serverTime: Date.now() })
    io.to(studentsRoom).emit('poll_state', { poll, serverTime: Date.now() })
  } catch (err) {
    console.warn('poll_started handler error', err)
  }
}

export function handleKickParticipant(io: Server, data: any) {
  try {
    const { pollId, sessionId } = data || {}
    if (!pollId || !sessionId) return
    const map = participants.get(pollId)
    if (!map) return
    const info = map.get(sessionId)
    if (!info) return
    
    io.to(info.socketId).emit('kicked', { sessionId, reason: 'removed by teacher' })
    // remove participant
    map.delete(sessionId)
    io.to(pollId).emit('participants_update', { participants: buildParticipantList(map) })
  } catch (err) {
    console.warn('kick_participant error', err)
  }
}

export function handleChatMessage(io: Server, data: any) {
  try {
    const { pollId, sessionId, message } = data || {}
    if (!pollId || !message) return
    io.to(pollId).emit('chat_message', { sessionId, message, ts: Date.now() })
  } catch (err) {
    console.warn('chat_message error', err)
  }
}

export async function handleSubmitVote(io: Server, data: any, cb: any) {
  try {
    const { pollId, optionId, sessionId } = data
    if (!pollId || !optionId || !sessionId) return cb && cb({ ok: false, error: 'invalid' })

    let poll: any = await addVote(pollId, optionId, sessionId)
    const map = participants.get(pollId)
    const expected = map ? Array.from(map.values()).filter((info) => info.role === 'student').length : 0
    const maybeEnded = await maybeEndPollIfAllAnswered(pollId, expected)
    if (maybeEnded) poll = maybeEnded
    io.to(pollId).emit('vote_update', { poll })
    return cb && cb({ ok: true })
  } catch (err: any) {
    const payload = toSocketError(err)
    return cb && cb(payload)
  }
}

export function handleDisconnect(io: Server, socket: Socket) {
  // cleanup participant entries that referenced this socket
  for (const [pollId, map] of participants.entries()) {
    for (const [sessionId, info] of map.entries()) {
      if (info.socketId === socket.id) {
        map.delete(sessionId)
        io.to(pollId).emit('participants_update', { participants: buildParticipantList(map) })
      }
    }
  }
}
