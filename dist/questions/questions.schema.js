"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllSubjectsAndChaptersWithCountsSchema = exports.ChapterWithQuestionCountSchema = exports.CorrectedQuestionSchema = exports.TotalQuestionsPerSubjectAndChapterSchema = exports.TotalQuestionsPerSubjectSchema = exports.AddQuestionSchema = exports.ReportQuestionSchema = exports.QuestionSchema = exports.BaseQuestionSchema = exports.QuestionVideoSchema = exports.BaseOptionSchema = exports.CreatePastQuestionSchema = exports.BaseImagesSchema = exports.StreamEnumSchema = exports.AnswerEnumSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
// Corresponds to the ANSWER enum in your Prisma schema
exports.AnswerEnumSchema = zod_1.z.enum(['a', 'b', 'c', 'd']);
// Corresponds to the STREAM enum in your Prisma schema
exports.StreamEnumSchema = zod_1.z.enum(['UG', 'PG']);
// Corresponds to TBaseImages
exports.BaseImagesSchema = zod_1.z.object({
    qn: zod_1.z.string().nullable(),
    a: zod_1.z.string().nullable(),
    b: zod_1.z.string().nullable(),
    c: zod_1.z.string().nullable(),
    d: zod_1.z.string().nullable(),
    exp: zod_1.z.string().nullable(),
});
// Corresponds to TCreatePastQuestion
exports.CreatePastQuestionSchema = zod_1.z.object({
    stream: exports.StreamEnumSchema.default('PG'),
    year: zod_1.z.number().int(),
    category: zod_1.z.string().nullable().default(""),
    affiliation: zod_1.z.string().nullable().default(""),
});
// Corresponds to TBaseOption
exports.BaseOptionSchema = zod_1.z.object({
    a: zod_1.z.string(),
    b: zod_1.z.string(),
    c: zod_1.z.string(),
    d: zod_1.z.string(),
});
// Corresponds to TQuestionVideo
exports.QuestionVideoSchema = zod_1.z.object({
    id: zod_1.z.string(),
    url: zod_1.z.string(),
    questionId: zod_1.z.string(),
});
// Corresponds to TBaseQuestion
exports.BaseQuestionSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
    question: zod_1.z.string(),
    answer: exports.AnswerEnumSchema,
    explanation: zod_1.z.string(),
    subject: zod_1.z.string(),
    chapter: zod_1.z.string(),
    unit: zod_1.z.string(),
    difficulty: zod_1.z.string(),
    isreported: zod_1.z.any().nullable(),
    isverified: zod_1.z.any().nullable(),
    isflagged: zod_1.z.any().nullable(),
    IsPast: exports.CreatePastQuestionSchema.extend({ questionId: zod_1.z.string() }).nullable(),
    stream: exports.StreamEnumSchema,
    subjectId: zod_1.z.string().nullable(),
    chapterId: zod_1.z.string().nullable(),
});
// Corresponds to TQuestion
exports.QuestionSchema = exports.BaseQuestionSchema.extend({
    images: exports.BaseImagesSchema.nullable(),
    options: exports.BaseOptionSchema,
    videoUrl: zod_1.z.string().optional(),
});
// Corresponds to TReportQuestion
exports.ReportQuestionSchema = exports.QuestionSchema.extend({
    message: zod_1.z.string().nullable(),
});
// Corresponds to TAddQuestion
exports.AddQuestionSchema = exports.QuestionSchema.omit({ id: true }).extend({
    videoUrl: zod_1.z.string().optional(),
});
// Corresponds to TTotalQuestionsPerSubject
exports.TotalQuestionsPerSubjectSchema = zod_1.z.object({
    subject: zod_1.z.string(),
    count: zod_1.z.number().int(),
});
// Corresponds to TTotalQuestionsPerSubjectAndChapter
exports.TotalQuestionsPerSubjectAndChapterSchema = zod_1.z.record(zod_1.z.string(), // subject
zod_1.z.record(zod_1.z.string(), zod_1.z.number()) // chapter and its count
);
// Corresponds to TCorrectedQuestion
exports.CorrectedQuestionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    question: zod_1.z.string(),
    options: zod_1.z.object({
        a: zod_1.z.string(),
        b: zod_1.z.string(),
        c: zod_1.z.string(),
        d: zod_1.z.string(),
    }),
    answer: zod_1.z.enum(['a', 'b', 'c', 'd']),
    explanation: zod_1.z.string(),
});
exports.ChapterWithQuestionCountSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    subjectId: zod_1.z.string(),
    stream: zod_1.z.nativeEnum(client_1.STREAM),
    numberOfQuestions: zod_1.z.number().int().nonnegative()
});
exports.AllSubjectsAndChaptersWithCountsSchema = zod_1.z.record(zod_1.z.string(), // Key is subject name
zod_1.z.record(zod_1.z.string(), zod_1.z.number().int()) // Value is an object where key is chapter name, value is count
);
