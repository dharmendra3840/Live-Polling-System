"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupPollSocket = setupPollSocket;
const pollSocketController_1 = require("../controllers/pollSocketController");
function setupPollSocket(io) {
    io.on('connection', (socket) => {
        console.log('socket connected', socket.id);
        socket.on('join_room', (data) => (0, pollSocketController_1.handleJoinRoom)(io, socket, data));
        // request_state: client asks for current active poll or specific poll
        socket.on('request_state', (data, cb) => (0, pollSocketController_1.handleRequestState)(socket, data, cb));
        socket.on('poll_started', (data) => (0, pollSocketController_1.handlePollStarted)(io, data));
        socket.on('kick_participant', (data) => (0, pollSocketController_1.handleKickParticipant)(io, data));
        socket.on('chat_message', (data) => (0, pollSocketController_1.handleChatMessage)(io, data));
        socket.on('submit_vote', (data, cb) => (0, pollSocketController_1.handleSubmitVote)(io, data, cb));
        socket.on('disconnect', () => {
            (0, pollSocketController_1.handleDisconnect)(io, socket);
        });
    });
}
