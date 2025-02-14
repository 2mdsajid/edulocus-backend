import express, { Response } from 'express';
import { askGemini, getChapterAndSubjectScores, isUserLegibleForAiAsk } from '../google/google.services';
import { checkUserExists, RequestWithUserIdAndRole } from '../utils/middleware';


const router = express.Router();

router.get('/ask-gemini',checkUserExists, async (request: RequestWithUserIdAndRole, response: Response) => {
    try {
        const userId = request.user?.id 
        if (!userId) {
            return response.status(400).json({ data: null, message: 'User not found' })
        }

        const isLegible = await isUserLegibleForAiAsk(userId)
        if(!isLegible) return response.status(400).json({ data: null, message: 'Please attempt some tests before using this feature!' })

        const prompt = 'Analyze my performance and suggest how I can improve.'
        const geminiResponse = await askGemini(userId, prompt)
        if(!geminiResponse) return response.status(400).json({ data: null, message: 'Gemini Response not found' })
        return response.status(200).json({ data: geminiResponse, message: 'Gemini Response' });
    } catch (error) {
        console.log("🚀 ~ router.get ~ error:", error)
        return response.status(500).json({ data: null, message: 'Internal Server Error' })
    }
})

router.get("/get-chapter-and-subject-scores",checkUserExists, async (request: RequestWithUserIdAndRole, response: Response) => {
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

export default router