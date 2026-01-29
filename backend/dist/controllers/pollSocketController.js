"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleJoinRoom = handleJoinRoom;
exports.handleRequestState = handleRequestState;
exports.handlePollStarted = handlePollStarted;
exports.handleKickParticipant = handleKickParticipant;
exports.handleChatMessage = handleChatMessage;
exports.handleSubmitVote = handleSubmitVote;
exports.handleDisconnect = handleDisconnect;
const pollService_1 = require("../services/pollService");
const errors_1 = require("../utils/errors");
const studentsRoom = 'students';
// participants: map pollId -> Map<sessionId, { socketId, name, role }>
const participants = new Map();
function buildParticipantList(map) {
    return map
        ? Array.from(map.entries())
            .filter(([, info]) => info.role === 'student')
            .map(([sid, info]) => ({ sessionId: sid, name: info.name }))
        : [];
}
async function handleJoinRoom(io, socket, data) {
    const { pollId, role, sessionId, name } = data || {};
    if (role === 'student')
        socket.join(studentsRoom);
    if (pollId)
        socket.join(pollId);
    socket.data.sessionId = sessionId;
    socket.data.name = name;
    socket.data.role = role;
    // register participant for the poll (if pollId provided)
    if (pollId && sessionId && role === 'student') {
        if (!participants.has(pollId))
            participants.set(pollId, new Map());
        participants.get(pollId).set(sessionId, { socketId: socket.id, name, role });
        // broadcast participants update
        const plist = buildParticipantList(participants.get(pollId));
        io.to(pollId).emit('participants_update', { participants: plist });
    }
    // send current participants list to the joining socket if pollId provided
    if (pollId) {
        const plist = buildParticipantList(participants.get(pollId));
        io.to(pollId).emit('participants_update', { participants: plist });
    }
    // send current poll state if exists (include serverTime for sync)
    if (pollId) {
        try {
            const poll = await (0, pollService_1.getPoll)(pollId);
            if (poll) {
                socket.emit('poll_state', { poll, serverTime: Date.now() });
            }
        }
        catch (err) {
            socket.emit('poll_error', (0, errors_1.toSocketError)(err));
        }
    }
}
async function handleRequestState(socket, data, cb) {
    try {
        const { pollId } = data || {};
        let poll = null;
        if (pollId) {
            poll = await (0, pollService_1.getPoll)(pollId);
        }
        else {
            // find active poll
            poll = await (0, pollService_1.getActivePoll)();
        }
        if (poll) {
            socket.emit('poll_state', { poll, serverTime: Date.now() });
            cb && cb({ ok: true });
        }
        else {
            cb && cb({ ok: false, error: 'no active poll' });
        }
    }
    catch (err) {
        const payload = (0, errors_1.toSocketError)(err);
        cb && cb(payload);
    }
}
function handlePollStarted(io, data) {
    try {
        const { poll } = data || {};
        if (!poll || !poll._id)
            return;
        // broadcast poll_state with serverTime
        io.to(poll._id).emit('poll_state', { poll, serverTime: Date.now() });
        io.to(studentsRoom).emit('poll_state', { poll, serverTime: Date.now() });
    }
    catch (err) {
        console.warn('poll_started handler error', err);
    }
}
function handleKickParticipant(io, data) {
    try {
        const { pollId, sessionId } = data || {};
        if (!pollId || !sessionId)
            return;
        const map = participants.get(pollId);
        if (!map)
            return;
        const info = map.get(sessionId);
        if (!info)
            return;
        // send kicked event to that socket
        io.to(info.socketId).emit('kicked', { sessionId, reason: 'removed by teacher' });
        // remove participant
        map.delete(sessionId);
        io.to(pollId).emit('participants_update', { participants: buildParticipantList(map) });
    }
    catch (err) {
        console.warn('kick_participant error', err);
    }
}
function handleChatMessage(io, data) {
    try {
        const { pollId, sessionId, message } = data || {};
        if (!pollId || !message)
            return;
        // broadcast to room
        io.to(pollId).emit('chat_message', { sessionId, message, ts: Date.now() });
    }
    catch (err) {
        console.warn('chat_message error', err);
    }
}
async function handleSubmitVote(io, data, cb) {
    try {
        const { pollId, optionId, sessionId } = data;
        if (!pollId || !optionId || !sessionId)
            return cb && cb({ ok: false, error: 'invalid' });
        let poll = await (0, pollService_1.addVote)(pollId, optionId, sessionId);
        const map = participants.get(pollId);
        const expected = map ? Array.from(map.values()).filter((info) => info.role === 'student').length : 0;
        const maybeEnded = await (0, pollService_1.maybeEndPollIfAllAnswered)(pollId, expected);
        if (maybeEnded)
            poll = maybeEnded;
        io.to(pollId).emit('vote_update', { poll });
        return cb && cb({ ok: true });
    }
    catch (err) {
        const payload = (0, errors_1.toSocketError)(err);
        return cb && cb(payload);
    }
}
function handleDisconnect(io, socket) {
    // cleanup participant entries that referenced this socket
    for (const [pollId, map] of participants.entries()) {
        for (const [sessionId, info] of map.entries()) {
            if (info.socketId === socket.id) {
                map.delete(sessionId);
                io.to(pollId).emit('participants_update', { participants: buildParticipantList(map) });
            }
        }
    }
}
