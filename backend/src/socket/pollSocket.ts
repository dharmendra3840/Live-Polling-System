import { Server, Socket } from 'socket.io'
import {
  handleChatMessage,
  handleDisconnect,
  handleJoinRoom,
  handleKickParticipant,
  handlePollStarted,
  handleRequestState,
  handleSubmitVote
} from '../controllers/pollSocketController'

export function setupPollSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('socket connected', socket.id)

    socket.on('join_room', (data: any) => handleJoinRoom(io, socket, data))

    // request_state: client asks for current active poll or specific poll
    socket.on('request_state', (data: any, cb: any) => handleRequestState(socket, data, cb))

    socket.on('poll_started', (data: any) => handlePollStarted(io, data))

    socket.on('kick_participant', (data: any) => handleKickParticipant(io, data))

    socket.on('chat_message', (data: any) => handleChatMessage(io, data))

    socket.on('submit_vote', (data: any, cb: any) => handleSubmitVote(io, data, cb))

    socket.on('disconnect', () => {
      handleDisconnect(io, socket)
    })
  })
}
