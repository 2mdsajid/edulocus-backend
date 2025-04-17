import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "../utils/prisma";
import { scoresSchema, TQuestionSchemaForGemini, TScoreSchema } from "./google.schema";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);


export const isUserLegibleForAiAsk = async (userId: string): Promise<boolean> => {
    const allUsersTests = await prisma.testAnalytic.findMany({
        where: {
          userId,
        },
        select: {
          testQuestionAnswer: {
            select: {
              question: {
                select: {
                  answer: true,
                  subject: true,
                  chapter: true,
                },
              },
              userAnswer: true,
            },
          },
        },
      });
    
      if(!allUsersTests || allUsersTests.length === 0) return false
      return true
}

export const getChapterAndSubjectScores = async (userId: string): Promise<TScoreSchema | null> => {
  const allUsersTests = await prisma.testAnalytic.findMany({
    where: {
      userId,
    },
    select: {
      testQuestionAnswer: {
        select: {
          question: {
            select: {
              answer: true,
              subject: true,
              chapter: true,
            },
          },
          userAnswer: true,
        },
      },
    },
  });

  if(!allUsersTests || allUsersTests.length === 0) return null

  // Track total questions and correct answers for each chapter
  const chapterStats: Record<string, Record<string, { total: number; correct: number }>> = {};

  // Process the data
  allUsersTests.forEach((test) => {
    test.testQuestionAnswer.forEach((qa) => {
      const subject = qa.question.subject;
      const chapter = qa.question.chapter;
      const isCorrect = qa.userAnswer === qa.question.answer;

      // Initialize the subject if it doesn't exist
      if (!chapterStats[subject]) {
        chapterStats[subject] = {};
      }

      // Initialize the chapter if it doesn't exist
      if (!chapterStats[subject][chapter]) {
        chapterStats[subject][chapter] = { total: 0, correct: 0 };
      }

      // Update total and correct counts
      chapterStats[subject][chapter].total += 1;
      if (isCorrect) {
        chapterStats[subject][chapter].correct += 1;
      }
    });
  });

  // Calculate percentage scores and transform the data
  const transformedData: TScoreSchema = {};
  for (const subject in chapterStats) {
    transformedData[subject] = {};
    for (const chapter in chapterStats[subject]) {
      const { total, correct } = chapterStats[subject][chapter];
      const percentageScore = total === 0 ? 0 : Math.round((correct / total) * 100);
      transformedData[subject][chapter] = percentageScore;
    }
  }

  // Validate the transformed data against the schema
  const validatedData = scoresSchema.parse(transformedData);

  return validatedData;
};

// Function to ask Gemini for analysis and suggestions
export const askGemini = async (userId: string, prompt: string): Promise<string | null>  => {
    // Get the chapter and subject scores
    const scores = await getChapterAndSubjectScores(userId);
    if(!scores) return null
  
    // Format the scores as a string for the system instruction
    const scoresString = JSON.stringify(scores, null, 2);
  
    // Set the system instruction with the scores and additional instructions
    const systemInstruction = `
    You are an expert tutor analyzing a student's performance. Below is the student's performance data in JSON format:
    
    \`\`\`json
    ${scoresString}
    \`\`\`
    
    Analyze this data and provide a concise response in **pure HTML format**. Follow these guidelines:
    
    1. Keep the response short and focused. Only include the most important suggestions and recommendations.
    2. Use HTML tags for structure (e.g., '<h3>', '<ul>', '<li>', '<p>').
    3. Do not include unnecessary details or explanations.
    4. Focus on weak chapters (scores below 50%) and weak subjects (average scores below 50%).
    5. Provide actionable suggestions for improvement and highlight strong areas.
    `;
    // Initialize the Gemini model with the system instruction
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction,
    });
  
    // Generate content using the provided prompt
    const result = await model.generateContent(prompt);
    return result.response.text();
  };



export const getGeminiExplanation = async (data: TQuestionSchemaForGemini): Promise<string | null> => {
  try{
  const { question, options, correctAnswer } = data
  const prompt = `
  You are an expert tutor providing a comprehensive explanation of a question and its solution. Below is the question data in JSON format:
  \`\`\`json
  {
    "question": "${question}",
    "options": ${JSON.stringify(options)},
    "correctAnswer": "${correctAnswer}"
  }
  \`\`\`

  Provide a detailed explanation in **pure HTML format** following these guidelines:

  1. Start with a clear explanation of the question's concept and what it's testing
  2. Analyze each option individually:
     - Explain why it's correct or incorrect
     - Provide reasoning and supporting evidence
     - Mention any common misconceptions related to the option
     - Use <br> tags in between for better readability
  3. For the correct answer:
     - Provide a step-by-step explanation of how to arrive at the solution
     - Include any relevant formulas, theories, or principles
     - Suggest alternative approaches to solving the problem
     - Use <br> tags in between for better readability
  4. Include practical examples or analogies to enhance understanding
  5. Use proper HTML structure with semantic tags:
     - Use <h3> for section headings
     - Use <ul> and <li> for lists
     - Use <p> for paragraphs
     - Use <strong> for emphasis
     - Use <code> for technical terms or formulas
  6. Make the explanation engaging and easy to follow
  7. Do not include any other text or comments in the response
  8. Do not include the <body>, <head>, <html> tags in the response
  9. Use <br> tags in between for better readability

  `
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-lite",
    systemInstruction: prompt,
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
  }catch(error){
    return null
  }
}
