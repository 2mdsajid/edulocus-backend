import { STREAM } from '@prisma/client';
import { z } from 'zod';

// Corresponds to the ANSWER enum in your Prisma schema
export const AnswerEnumSchema = z.enum(['a', 'b', 'c', 'd']);
export type TAnswerEnumSchema = z.infer<typeof AnswerEnumSchema>;

// Corresponds to the STREAM enum in your Prisma schema
export const StreamEnumSchema = z.enum(['UG', 'PG']);
export type TStream = z.infer<typeof StreamEnumSchema>;

// Corresponds to TBaseImages
export const BaseImagesSchema = z.object({
    qn: z.string().nullable(),
    a: z.string().nullable(),
    b: z.string().nullable(),
    c: z.string().nullable(),
    d: z.string().nullable(),
    exp: z.string().nullable(),
});
export type TBaseImagesSchema = z.infer<typeof BaseImagesSchema>;

// Corresponds to TCreatePastQuestion
export const CreatePastQuestionSchema = z.object({
    stream: StreamEnumSchema.default('PG'),
    year: z.number().int(),
    category: z.string().nullable().default(""),
    affiliation: z.string().nullable().default(""),
});
export type TCreatePastQuestionSchema = z.infer<typeof CreatePastQuestionSchema>;

// Corresponds to TBaseOption
export const BaseOptionSchema = z.object({
    a: z.string(),
    b: z.string(),
    c: z.string(),
    d: z.string(),
});
export type TBaseOptionSchema = z.infer<typeof BaseOptionSchema>;

// Corresponds to TQuestionVideo
export const QuestionVideoSchema = z.object({
    id: z.string(),
    url: z.string(),
    questionId: z.string(),
});
export type TQuestionVideoSchema = z.infer<typeof QuestionVideoSchema>;

// Corresponds to TBaseQuestion
export const BaseQuestionSchema = z.object({
    id: z.string().cuid(),
    question: z.string(),
    answer: AnswerEnumSchema,
    explanation: z.string(),
    subject: z.string(),
    chapter: z.string(),
    unit: z.string(),
    difficulty: z.string(),
    isreported: z.any().nullable(),
    isverified: z.any().nullable(),
    isflagged: z.any().nullable(),
    IsPast: CreatePastQuestionSchema.extend({ questionId: z.string() }).nullable(),
    stream: StreamEnumSchema,
    subjectId: z.string().nullable(),
    chapterId: z.string().nullable(),
});
export type TBaseQuestionSchema = z.infer<typeof BaseQuestionSchema>;

// Corresponds to TQuestion
export const QuestionSchema = BaseQuestionSchema.extend({
    images: BaseImagesSchema.nullable(),
    options: BaseOptionSchema,
    videoUrl: z.string().optional(),
});
export type TQuestionSchema = z.infer<typeof QuestionSchema>;

// Corresponds to TReportQuestion
export const ReportQuestionSchema = QuestionSchema.extend({
    message: z.string().nullable(),
});
export type TReportQuestionSchema = z.infer<typeof ReportQuestionSchema>;

// Corresponds to TAddQuestion
export const AddQuestionSchema = QuestionSchema.omit({ id: true }).extend({
    videoUrl: z.string().optional(),
});
export type TAddQuestionSchema = z.infer<typeof AddQuestionSchema>;


// Corresponds to TTotalQuestionsPerSubject
export const TotalQuestionsPerSubjectSchema = z.object({
    subject: z.string(),
    count: z.number().int(),
});
export type TTotalQuestionsPerSubjectSchema = z.infer<typeof TotalQuestionsPerSubjectSchema>;

// Corresponds to TTotalQuestionsPerSubjectAndChapter
export const TotalQuestionsPerSubjectAndChapterSchema = z.record(
    z.string(), // subject
    z.record(z.string(), z.number()) // chapter and its count
);
export type TTotalQuestionsPerSubjectAndChapterSchema = z.infer<typeof TotalQuestionsPerSubjectAndChapterSchema>;

// Corresponds to TCorrectedQuestion
export const CorrectedQuestionSchema = z.object({
    id: z.string(),
    question: z.string(),
    options: z.object({
        a: z.string(),
        b: z.string(),
        c: z.string(),
        d: z.string(),
    }),
    answer: z.enum(['a', 'b', 'c', 'd']),
    explanation: z.string(),
});
export type TCorrectedQuestionSchema = z.infer<typeof CorrectedQuestionSchema>;



export const ChapterWithQuestionCountSchema = z.object({
    id: z.string(),
    name: z.string(),
    subjectId: z.string(),
    stream: z.nativeEnum(STREAM),
    numberOfQuestions: z.number().int().nonnegative()
});
export type TChapterWithQuestionCountSchema = z.infer<typeof ChapterWithQuestionCountSchema>;


export const AllSubjectsAndChaptersWithCountsSchema = z.record(
    z.string(), // Key is subject name
    z.record(z.string(), z.number().int()) // Value is an object where key is chapter name, value is count
);

export type TAllSubjectsAndChaptersWithCounts = z.infer<typeof AllSubjectsAndChaptersWithCountsSchema>;