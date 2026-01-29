"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pollController_1 = require("../controllers/pollController");
const router = express_1.default.Router();
router.post('/', pollController_1.createPollHandler);
router.get('/', pollController_1.listPollsHandler);
router.get('/:id', pollController_1.getPollHandler);
router.post('/:id/start', pollController_1.startPollHandler);
exports.default = router;
