import { z } from 'zod';

// Define the schema for a single chapter score
export const chapterScoreSchema = z.object({
  score: z.number(),
});

// Define the schema for a subject, which contains multiple chapters
export const subjectSchema = z.record(chapterScoreSchema);

// Define the schema for the scores object
export const scoresSchema = z.record(z.record(z.number()));

// Define the type for the scores schema
export type TScoreSchema = z.infer<typeof scoresSchema>;