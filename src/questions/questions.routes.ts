import express, { Request, Response } from 'express';
import { addMultipleQuestionsValidation, addSingleQuestionValidation } from './questions.validators';
import { validationResult } from 'express-validator';
import * as QuestionServices from '../questions/questions.services'
import { checkModerator, RequestWithUserIdAndRole } from '../utils/middleware';
import { TBaseUser } from '../users/users.schema';

const router = express.Router();


router.post('/add-single-question', checkModerator, addSingleQuestionValidation, async (request: RequestWithUserIdAndRole, response: Response) => {
    try {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ message: errors.array()[0].msg });
        }

        if (!request.user || request.user === undefined || request.user === null) {
            return response.status(400).json({ data: null, message: "Not Authorized" });
        }

        const questionId = await QuestionServices.addSingleQuestion(request.body, request.user.id)
        return response.status(200).json({ data: questionId, message: 'Question Created' });
    } catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' })
    }
})

// add multiple questions from same chapter
router.post('/add-multiple-question-for-same-subject-and-chapter', checkModerator, addMultipleQuestionsValidation, async (request: RequestWithUserIdAndRole, response: Response) => {
    try {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ message: errors.array()[0].msg });
        }

        if (!request.user || request.user === undefined || request.user === null) {
            return response.status(400).json({ data: null, message: "Not Authorized" });
        }

        const questionIds = await QuestionServices.addMultipleQuestionsForSameSubjectAndChapter(request.body.questions, request.user.id)
        if (!questionIds || questionIds.length === 0) {
            return response.status(400).json({ data: null, message: "Questions cannot be added" });
        }
        console.log("🚀 ~ router.post ~ questionIds:", questionIds)
        return response.status(200).json({ data: questionIds, message: `${questionIds.length} Questions Created` });
    } catch (error) {
        console.log("🚀 ~ router.post ~ error:", error)
        return response.status(500).json({ data: null, message: 'Internal Server Error' })
    }
})

// add multiple questions from different subject and chapter
router.post('/add-multiple-question-for-different-subject-and-chapter', checkModerator, addMultipleQuestionsValidation, async (request: RequestWithUserIdAndRole, response: Response) => {
    try {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ message: errors.array()[0].msg });
        }

        if (!request.user || request.user === undefined || request.user === null) {
            return response.status(400).json({ data: null, message: "Not Authorized" });
        }
        
        const questionIds = await QuestionServices.addMultipleQuestionsForDifferentSubjectAndChapter(request.body.questions, request.user.id)
        return response.status(200).json({ data: questionIds, message: 'Questions Created' });
    } catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' })
    }
})

router.get('/get-questions', async (request: Request, response: Response) => {
    try {
        const questionIds = await QuestionServices.getQuestionsIds()
        if (questionIds.length === 0) {
            return response.status(500).json({ data: null, message: 'No Questions Found' })
        }
        return response.status(200).json({ data: questionIds, message: 'Question Created' });
    } catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' })
    }
})

router.get('/get-total-questions-per-subject', async (request: Request, response: Response) => {
    try {
        const totalQuestionsPerSubject = await QuestionServices.getTotalQuestionsPerSubject()
        if (!totalQuestionsPerSubject || totalQuestionsPerSubject.length === 0) {
            return response.status(500).json({ data: [], message: 'No Questions Found' })
        }
        return response.status(200).json({ data: totalQuestionsPerSubject, message: 'Question Found' });
    } catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' })
    }
})

router.get('/get-total-questions-per-subject-and-chapter', async (request: Request, response: Response) => {
    try {
        const totalQuestionsPerSubject = await QuestionServices.getTotalQuestionsPerSubjectAndChapter()
        if (!totalQuestionsPerSubject) {
            return response.status(500).json({ data: null, message: 'No Questions Found' })
        }
        return response.status(200).json({ data: totalQuestionsPerSubject, message: 'Question Found' });
    } catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' })
    }
})

router.get('/get-syllabus', async (request: Request, response: Response) => {
    try {
        const syllabus = await QuestionServices.getSyllabus()
        if (!syllabus) {
            return response.status(404).json({ data: null, message: 'No Syllabus Found' })
        }
        return response.status(200).json({ data: syllabus, message: 'Question Found' });
    } catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' })
    }
})





export default router