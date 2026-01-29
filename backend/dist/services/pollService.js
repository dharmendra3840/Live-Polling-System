"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maybeEndPollIfExpired = maybeEndPollIfExpired;
exports.createPoll = createPoll;
exports.startPoll = startPoll;
exports.getPoll = getPoll;
exports.listPolls = listPolls;
exports.getActivePoll = getActivePoll;
exports.maybeEndPollIfAllAnswered = maybeEndPollIfAllAnswered;
exports.addVote = addVote;
const poll_1 = require("../models/poll");
const vote_1 = require("../models/vote");
const db_1 = require("../utils/db");
// Simple ID generator
function generateId(length = 6) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
function isPollExpired(poll) {
    if (!poll || poll.status !== 'active')
        return false;
    if (!poll.startTime || !poll.duration)
        return false;
    return Date.now() - poll.startTime >= poll.duration * 1000;
}
function withCode(message, code) {
    const err = new Error(message);
    err.code = code;
    return err;
}
async function endPoll(poll) {
    poll.status = 'ended';
    await poll.save();
    return poll;
}
async function maybeEndPollIfExpired(poll) {
    if (!poll)
        return null;
    if (!isPollExpired(poll))
        return poll;
    return endPoll(poll);
}
async function createPoll(question, options, duration = 60, optionCorrect) {
    (0, db_1.ensureDbConnection)();
    if (!question || !options || options.filter(Boolean).length < 2) {
        throw withCode('invalid poll data', 'VALIDATION');
    }
    const opts = options.map((t, idx) => ({
        id: generateId(6),
        text: t,
        votes: 0,
        isCorrect: optionCorrect?.[idx] === true ? true : false
    }));
    const poll = new poll_1.PollModel({ question, options: opts, duration, status: 'draft' });
    await poll.save();
    return poll;
}
async function startPoll(pollId) {
    (0, db_1.ensureDbConnection)();
    // enforce only one active poll at a time
    const active = await poll_1.PollModel.findOne({ status: 'active' });
    if (active) {
        const updated = await maybeEndPollIfExpired(active);
        if (updated && updated.status === 'active') {
            throw withCode('Another poll is already active', 'POLL_ACTIVE');
        }
    }
    const poll = await poll_1.PollModel.findById(pollId);
    if (!poll)
        throw withCode('Poll not found', 'POLL_NOT_FOUND');
    poll.status = 'active';
    poll.startTime = Date.now();
    await poll.save();
    return poll;
}
async function getPoll(pollId) {
    (0, db_1.ensureDbConnection)();
    const poll = await poll_1.PollModel.findById(pollId);
    if (!poll)
        return null;
    return maybeEndPollIfExpired(poll);
}
async function listPolls() {
    (0, db_1.ensureDbConnection)();
    return poll_1.PollModel.find().sort({ createdAt: -1 }).limit(50);
}
async function getActivePoll() {
    (0, db_1.ensureDbConnection)();
    const poll = await poll_1.PollModel.findOne({ status: 'active' });
    if (!poll)
        return null;
    return maybeEndPollIfExpired(poll);
}
async function maybeEndPollIfAllAnswered(pollId, expectedCount) {
    (0, db_1.ensureDbConnection)();
    if (!expectedCount || expectedCount <= 0)
        return null;
    const votes = await vote_1.VoteModel.countDocuments({ pollId });
    if (votes < expectedCount)
        return null;
    const poll = await poll_1.PollModel.findById(pollId);
    if (!poll)
        return null;
    if (poll.status !== 'active')
        return poll;
    return endPoll(poll);
}
/**
 * Add a vote ensuring DB-level uniqueness using VoteModel unique index on (pollId, sessionId).
 * This prevents duplicate votes even if clients retry or multiple server instances are used.
 */
async function addVote(pollId, optionId, sessionId) {
    (0, db_1.ensureDbConnection)();
    // ensure poll and option exist
    const poll = await poll_1.PollModel.findById(pollId);
    if (!poll)
        throw withCode('Poll not found', 'POLL_NOT_FOUND');
    if (poll.status !== 'active') {
        throw withCode('poll not active', 'POLL_INACTIVE');
    }
    const maybeEnded = await maybeEndPollIfExpired(poll);
    if (maybeEnded && maybeEnded.status !== 'active') {
        throw withCode('poll ended', 'POLL_ENDED');
    }
    const opt = poll.options.find((o) => o.id === optionId);
    if (!opt)
        throw withCode('Option not found', 'OPTION_NOT_FOUND');
    try {
        // create a Vote document; unique index on (pollId, sessionId) will throw on duplicates
        await vote_1.VoteModel.create({ pollId: poll._id, optionId, sessionId });
        // increment the option's vote count atomically
        await poll_1.PollModel.updateOne({ _id: pollId, 'options.id': optionId }, { $inc: { 'options.$.votes': 1 } });
        // return updated poll
        return poll_1.PollModel.findById(pollId);
    }
    catch (err) {
        // duplicate key error -> already voted
        if (err && err.code === 11000) {
            throw withCode('already voted', 'ALREADY_VOTED');
        }
        throw err;
    }
}
