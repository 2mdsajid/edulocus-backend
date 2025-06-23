import express, { Response, Request } from 'express';
import { askGemini, getChapterAndSubjectScores, getGeminiExplanation, isUserLegibleForAiAsk, updateQuestionByAI } from '../google/google.services';
import { checkModerator, getUserSession, RequestExtended } from '../utils/middleware';
import { questionSchemaForGemini } from './google.schema';
import { updateQuestion } from '../questions/questions.services';

const router = express.Router();

router.get('/ask-gemini', getUserSession, async (request: RequestExtended, response: Response) => {
    try {
        const userId = request.user?.id
        if (!userId) {
            return response.status(400).json({ data: null, message: 'User not found' })
        }

        const isLegible = await isUserLegibleForAiAsk(userId)
        if (!isLegible) return response.status(400).json({ data: null, message: 'Please attempt some tests before using this feature!' })

        const prompt = 'Analyze my performance and suggest how I can improve.'
        const geminiResponse = await askGemini(userId, prompt)
        if (!geminiResponse) return response.status(400).json({ data: null, message: 'Gemini Response not found' })
        return response.status(200).json({ data: geminiResponse, message: 'Gemini Response' });
    } catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' })
    }
})

router.get("/get-chapter-and-subject-scores", getUserSession, async (request: RequestExtended, response: Response) => {
    try {
        const userId = request.user?.id || '4478afbe-1519-4eb5-8c61-ebe88af5504b'
        if (!userId) {
            return response.status(400).json({ data: null, message: 'User not found' })
        }

        const scores = await getChapterAndSubjectScores(userId);
        return response.status(200).json({ data: scores, message: 'Scores retrieved' });
    } catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' })
    }
})


router.post("/get-gemini-explanation", async (request: RequestExtended, response: Response) => {
    try {

        const { question, options, correctAnswer } = questionSchemaForGemini.parse(request.body)
        if (!question || !options ) {
            return response.status(400).json({ data: null, message: 'Invalid request body' })
        }
        const explanation = await getGeminiExplanation(request.body)
        if (!explanation || explanation === '' || explanation === null) {
            return response.status(400).json({ data: null, message: 'Explanation can\'t be generated' })
        }
        
        return response.status(200).json({ data: explanation, message: 'Explanation retrieved' });
    } catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' })
    }
})


router.put('/gemini-quesiton-update', checkModerator, async (request: Request, response: Response) => {
    try {
        if (!request.body.id) {
            return response.status(400).json({ data: null, message: 'Question ID is required' });
        }

        // Update the question using AI
        const updatedQuestion = await updateQuestionByAI(request.body);
        // const updatedQuestionData = await updateQuestion({
        //     id: updatedQuestion.id,
        //     question: updatedQuestion.question,
        //     options: updatedQuestion.options,
        //     answer: updatedQuestion.answer,
        //     explanation: updatedQuestion.explanation,
        // });

        
        if (!updatedQuestion) {
            return response.status(404).json({ data: null, message: 'Question not found or could not be updated by AI' });
        }

        return response.status(200).json({ data: updatedQuestion, message: 'Question updated successfully by AI' });
    } catch (error) {
        console.error("🚀 ~ router.put error:", error);
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
});


export default router