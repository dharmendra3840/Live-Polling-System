"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const pollRoutes_1 = __importDefault(require("./routes/pollRoutes"));
const pollSocket_1 = require("./socket/pollSocket");
dotenv_1.default.config();
const app = (0, express_1.default)();
const defaultOrigins = ['http://localhost:5173', 'http://localhost:5174'];
const frontendOrigin = process.env.FRONTEND_ORIGIN
    ? process.env.FRONTEND_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
    : defaultOrigins;
app.use((0, cors_1.default)({ origin: frontendOrigin, credentials: true }));
app.use(express_1.default.json());
// Health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Intervue Poll Backend' });
});
app.use('/api/polls', pollRoutes_1.default);
const port = process.env.PORT || 4000;
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, { cors: { origin: frontendOrigin } });
(0, pollSocket_1.setupPollSocket)(io);
// MongoDB connection
let mongoConnected = false;
async function connectDB() {
    if (mongoConnected)
        return;
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/intervue-poll';
    try {
        await mongoose_1.default.connect(mongoUri);
        console.log('✅ Connected to MongoDB');
        mongoConnected = true;
    }
    catch (err) {
        console.warn('⚠️ Could not connect to MongoDB:', err);
    }
}
async function start() {
    await connectDB();
    server.listen(port, () => {
        console.log(`✅ Server listening on http://localhost:${port}`);
    });
}
// Only start server if not running on Vercel serverless
if (process.env.VERCEL !== '1') {
    start().catch(console.error);
}
// Export app for Vercel serverless
exports.default = app;
