"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPollHandler = createPollHandler;
exports.listPollsHandler = listPollsHandler;
exports.getPollHandler = getPollHandler;
exports.startPollHandler = startPollHandler;
const pollService_1 = require("../services/pollService");
const errors_1 = require("../utils/errors");
async function createPollHandler(req, res) {
    try {
        const { question, options, duration, optionCorrect } = req.body || {};
        if (!question || !Array.isArray(options)) {
            return res.status(400).json({ error: 'invalid request' });
        }
        const poll = await (0, pollService_1.createPoll)(question, options, duration, optionCorrect);
        res.json(poll);
    }
    catch (err) {
        const { status, message } = (0, errors_1.toHttpError)(err);
        res.status(status).json({ error: message });
    }
}
async function listPollsHandler(_req, res) {
    try {
        const polls = await (0, pollService_1.listPolls)();
        res.json(polls);
    }
    catch (err) {
        const { status, message } = (0, errors_1.toHttpError)(err);
        res.status(status).json({ error: message });
    }
}
async function getPollHandler(req, res) {
    try {
        const poll = await (0, pollService_1.getPoll)(req.params.id);
        if (!poll)
            return res.status(404).json({ error: 'not found' });
        res.json(poll);
    }
    catch (err) {
        const { status, message } = (0, errors_1.toHttpError)(err);
        res.status(status).json({ error: message });
    }
}
async function startPollHandler(req, res) {
    try {
        const poll = await (0, pollService_1.startPoll)(req.params.id);
        res.json(poll);
    }
    catch (err) {
        const { status, message } = (0, errors_1.toHttpError)(err);
        res.status(status).json({ error: message });
    }
}
