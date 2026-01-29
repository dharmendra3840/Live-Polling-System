"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDbConnection = ensureDbConnection;
const mongoose_1 = __importDefault(require("mongoose"));
function ensureDbConnection() {
    if (mongoose_1.default.connection.readyState !== 1) {
        const err = new Error('database unavailable');
        err.code = 'DB_UNAVAILABLE';
        throw err;
    }
}
