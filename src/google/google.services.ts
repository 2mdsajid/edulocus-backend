import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "../utils/prisma";
import { scoresSchema, TAiQUestionUpdate, TQuestionSchemaForGemini, TScoreSchema } from "./google.schema";
import { model } from "./google.model";
import { truncatedGenAiOutput } from "./google.methods";
import { TQuestion } from "../questions/questions.schema";

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
      const percentageScore = total === 0 ? 0 : Math.round((correct / total)  * 100);
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
    
    Analyze this data and provide a concise response in pure HTML format. Follow these guidelines:
    
    1. Keep the response short and focused. Only include the most important suggestions and recommendations.
    2. Use HTML tags for structure (e.g., '<h3>', '<ul>', '<li>', '<p>').
    3. Do not include unnecessary details or explanations.
    4. Focus on weak chapters (scores below 50%) and weak subjects (average scores below 50%).
    5. Provide actionable suggestions for improvement and highlight strong areas.
    `;
    // Initialize the Gemini model with the system instruction
  
    // Generate content using the provided prompt
    const result = await model.generateContent(prompt);
    return result.response.text();
  };


  export const getGeminiExplanation = async (data: TQuestionSchemaForGemini): Promise<string | null> => {
    try {
      const { question, options, correctAnswer } = data; // Assuming correctAnswer is also available from your data.
  
      const prompt = `
    You are an expert tutor providing a comprehensive explanation of a question and its solution. Your explanation must be in pure HTML format, following a strict, predefined structure.
  
    Here's the structure you MUST adhere to:
  
    <b>Understanding the Question</b>
    <p>Explain the core concept of the question and what it is asking.</p>
  <br/>
    <b>Analyzing the Options</b>
    <ul>
      <li>
        <b>Option A: [Option Text]</b>
        <p>Analyze this option. Explain why it is correct or incorrect.</p>
      </li>
      <li>
        <b>Option B: [Option Text]</b>
        <p>Analyze this option. Explain why it is correct or incorrect.</p>
      </li>
      </ul>
  <br/>
    <p><strong>The correct answer is: [Correct Answer Option e.g., Option A: Text]</strong></p>
    <br/>
    <b>Step-by-Step Solution:</b>
    <p>Provide a detailed, step-by-step explanation of how to arrive at the solution. Include any relevant formulas, theories, or principles using <code>code</code> tags for technical terms or formulas.</p>
    <br/>
    <p><strong>Relevant Formula/Principle:</strong> <code>[Insert Formula or Principle Here if applicable]</code></p>
    <br>
    <b>Alternative Approaches:</b>
    <p>Suggest other ways to solve the problem or think about the concept.</p>
    <br>
    <b>Practical Examples and Analogies:</b>
    <p>Offer practical examples or analogies to enhance understanding of the concept.</p>
    <p><strong>Analogy:</strong> [Provide a clear analogy]</p>
    <p><strong>Practical Application:</strong> [Provide a real-world example]</p>
    <br><br><br>
  
    ---
  
    Now, apply this structure to the following question data:
    \`\`\`json
    {
      "question": "${question}",
      "options": ${JSON.stringify(options)},
      "correctAnswer": "${correctAnswer}" // Pass the correct answer directly if you have it. This makes it easier for Gemini to identify and elaborate on it.
    }
    \`\`\`
  
    Important Guidelines for Generation:
    1.  Strictly follow the HTML structure provided above. Do not deviate from the headings, list items, and paragraph tags.
    2.  Replace bracketed placeholders (e.g., [Option Text], [Correct Answer Option]) with actual content.
    3.  Use <strong> for emphasis.
    4.  Use <code> for technical terms or formulas.
    5.  Ensure multiple <br> tags are used as specified after the correct answer explanation, alternative approaches, and practical examples sections.
    6.  Do not include any other text or comments outside the structured HTML.
    7.  Do not include <body>, <head>, <html> tags.
    8.  Make the explanation engaging and easy to follow.
    `;
  

  
      const result = await model.generateContent(prompt);
      return truncatedGenAiOutput(result.response.text());


    } catch (error) {
      console.error("Error generating Gemini explanation:", error); // Use console.error for errors
      return null;
    }
  };


export const updateQuestionByAI = async (
  data: TAiQUestionUpdate,
): Promise<TAiQUestionUpdate | null> => {
  try {
    const { id, question, options, answer, message } = data;

    // This is the new, more robust prompt that guides the AI to correct errors.
    const prompt = `
You are an expert AI assistant tasked with correcting and enhancing multiple-choice questions (MCQs). You will be given an MCQ that may contain an error in its question, options, or the designated answer. You will also receive a message from a user explaining the perceived error. Your goal is to analyze the feedback, correct the MCQ, generate a detailed explanation for the corrected answer, and return all the information in a specific JSON format.

Your Task:

1.  Analyze the entire MCQ: Carefully read the provided \`question\`, all \`options\`, and the given \`answer\`.
2.  Understand the User's Feedback: Parse the \`message\` to pinpoint the exact nature of the reported error.
3.  Correct the Error: Based on your expert knowledge and the user's message, correct the MCQ.
     If the \`question\` is unclear, ambiguous, or factually incorrect, rewrite it to be accurate and clear.
     If any of the \`options\` contain typos or factual errors, correct them.
     Determine the truly correct \`answer\`. This may require changing the original answer key.
4.  Generate a Comprehensive Explanation:
     Write a new, detailed explanation for why the corrected answer is correct.
     The explanation must be a single string containing pure HTML, using tags like <p>, <br>, <b>, and <i> for formatting. Do not include <html> or <body> tags.
5.  Format the Output: Assemble the corrected \`question\`, \`options\`, \`answer\`, and your newly generated \`explanation\` into a single JSON object, strictly following the structure specified below.
6. Do not opt any fields like if message says the options are wrong then correct options and return the whole (question, options, answer and explanation)
7. If there is no question, or option then add it based on the other fields present

---
[BEGIN DATA]

 ID: "${id}"
 Question: "${question}"
 Options: ${JSON.stringify(options)}
 Stated Answer: "${answer}"
 User Message: "${message}"

[END DATA]
---

Output JSON Structure:

\`\`\`json
{
  "id": "${id}",
  "question": "The full, corrected question text.",
  "options": {
    "a": "The full, corrected text for option A.",
    "b": "The full, corrected text for option B.",
    "c": "The full, corrected text for option C.",
    "d": "The full, corrected text for option D."
  },
  "answer": "The single correct letter: a, b, c, or d.",
  "explanation": "Your newly generated, comprehensive explanation in an HTML string."
}
\`\`\`
    `;

    // Generate content using the AI model
    const result = await model.generateContent(prompt);
    // It's good practice to get the response text in a safe way
    const responseText = result.response.text();
    
    // Clean the response by removing markdown JSON fences and trimming whitespace
    const trimmedResponse = responseText.trim().replace(/```json|```/g, '');
    
    // Parse the cleaned JSON string into an object
    const parsedResponse: TQuestion = JSON.parse(trimmedResponse);


    // Return the structured, corrected data
    return {
      id: parsedResponse.id,
      question: parsedResponse.question,
      options: parsedResponse.options,
      answer: parsedResponse.answer,
      explanation: parsedResponse.explanation,
      message: data.message,
    };
  } catch (error) {
    console.error("Error updating question by AI:", error);
    // Return null to indicate that the operation failed
    return null;
  }
};