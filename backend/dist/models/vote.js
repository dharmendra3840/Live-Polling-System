"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoteModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const VoteSchema = new mongoose_1.default.Schema({
    pollId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Poll', required: true },
    optionId: { type: String, required: true },
    sessionId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
// ensure one vote per session per poll
VoteSchema.index({ pollId: 1, sessionId: 1 }, { unique: true });
exports.VoteModel = mongoose_1.default.model('Vote', VoteSchema);
