"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const google_services_1 = require("../google/google.services");
const middleware_1 = require("../utils/middleware");
const google_schema_1 = require("./google.schema");
const router = express_1.default.Router();
router.get('/ask-gemini', middleware_1.getUserSession, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = request.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return response.status(400).json({ data: null, message: 'User not found' });
        }
        const isLegible = yield (0, google_services_1.isUserLegibleForAiAsk)(userId);
        if (!isLegible)
            return response.status(400).json({ data: null, message: 'Please attempt some tests before using this feature!' });
        const prompt = 'Analyze my performance and suggest how I can improve.';
        const geminiResponse = yield (0, google_services_1.askGemini)(userId, prompt);
        if (!geminiResponse)
            return response.status(400).json({ data: null, message: 'Gemini Response not found' });
        return response.status(200).json({ data: geminiResponse, message: 'Gemini Response' });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.get("/get-chapter-and-subject-scores", middleware_1.getUserSession, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = ((_a = request.user) === null || _a === void 0 ? void 0 : _a.id) || '4478afbe-1519-4eb5-8c61-ebe88af5504b';
        if (!userId) {
            return response.status(400).json({ data: null, message: 'User not found' });
        }
        const scores = yield (0, google_services_1.getChapterAndSubjectScores)(userId);
        return response.status(200).json({ data: scores, message: 'Scores retrieved' });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.post("/get-gemini-explanation", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { question, options, correctAnswer } = google_schema_1.questionSchemaForGemini.parse(request.body);
        if (!question || !options) {
            return response.status(400).json({ data: null, message: 'Invalid request body' });
        }
        const explanation = yield (0, google_services_1.getGeminiExplanation)(request.body);
        if (!explanation || explanation === '' || explanation === null) {
            return response.status(400).json({ data: null, message: 'Explanation can\'t be generated' });
        }
        return response.status(200).json({ data: explanation, message: 'Explanation retrieved' });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
exports.default = router;
