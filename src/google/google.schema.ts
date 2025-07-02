import { z } from 'zod';
import { TBaseOptionSchema } from '../questions/questions.schema';

// Define the schema for a single chapter score
export const chapterScoreSchema = z.object({
  score: z.number(),
});

export const questionSchemaForGemini = z.object({
  question: z.string(),
  options: z.object({
    a: z.string(),
    b: z.string(),
    c: z.string(),
    d: z.string(),
  }),
  correctAnswer: z.string().nullable(),
});


export type TAiQUestionUpdate = {
  id: string, // Assuming the ID is needed for update
  question: string,
  options: TBaseOptionSchema,
  answer: string,
  explanation: string,
  message: string, // Include the report message
}



export type TQuestionSchemaForGemini = z.infer<typeof questionSchemaForGemini>;

// Define the schema for a subject, which contains multiple chapters
export const subjectSchema = z.record(chapterScoreSchema);

// Define the schema for the scores object
export const scoresSchema = z.record(z.record(z.number()));

// Define the type for the scores schema
export type TScoreSchema = z.infer<typeof scoresSchema>;