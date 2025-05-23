"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.model = void 0;
const generative_ai_1 = require("@google/generative-ai");
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
exports.model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
});
