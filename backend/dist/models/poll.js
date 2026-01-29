"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PollModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const OptionSchema = new mongoose_1.default.Schema({
    id: String,
    text: String,
    votes: { type: Number, default: 0 },
    isCorrect: { type: Boolean, default: false }
});
const PollSchema = new mongoose_1.default.Schema({
    question: String,
    options: [OptionSchema],
    duration: Number,
    status: { type: String, default: 'draft' },
    startTime: { type: Number },
    createdAt: { type: Date, default: Date.now }
});
exports.PollModel = mongoose_1.default.model('Poll', PollSchema);
