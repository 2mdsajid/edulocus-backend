"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoresSchema = exports.subjectSchema = exports.questionSchemaForGemini = exports.chapterScoreSchema = void 0;
const zod_1 = require("zod");
// Define the schema for a single chapter score
exports.chapterScoreSchema = zod_1.z.object({
    score: zod_1.z.number(),
});
exports.questionSchemaForGemini = zod_1.z.object({
    question: zod_1.z.string(),
    options: zod_1.z.object({
        a: zod_1.z.string(),
        b: zod_1.z.string(),
        c: zod_1.z.string(),
        d: zod_1.z.string(),
    }),
    correctAnswer: zod_1.z.string().nullable(),
});
// Define the schema for a subject, which contains multiple chapters
exports.subjectSchema = zod_1.z.record(exports.chapterScoreSchema);
// Define the schema for the scores object
exports.scoresSchema = zod_1.z.record(zod_1.z.record(zod_1.z.number()));
