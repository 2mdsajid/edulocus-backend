"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoresSchema = exports.subjectSchema = exports.chapterScoreSchema = void 0;
const zod_1 = require("zod");
// Define the schema for a single chapter score
exports.chapterScoreSchema = zod_1.z.object({
    score: zod_1.z.number(),
});
// Define the schema for a subject, which contains multiple chapters
exports.subjectSchema = zod_1.z.record(exports.chapterScoreSchema);
// Define the schema for the scores object
exports.scoresSchema = zod_1.z.record(zod_1.z.record(zod_1.z.number()));
