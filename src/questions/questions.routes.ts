import express, { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as QuestionServices from '../questions/questions.services';
import { checkModerator, RequestWithUserIdAndRole } from '../utils/middleware';
import { addMultipleQuestionsValidation, addSingleQuestionValidation } from './questions.validators';

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
            console.log(request.body)
            return response.status(400).json({ message: errors.array()[0].msg });
        }

        if (!request.user || request.user === undefined || request.user === null) {
            return response.status(400).json({ data: null, message: "Not Authorized" });
        }

        const questionIds = await QuestionServices.addMultipleQuestionsForSameSubjectAndChapter(request.body.questions, request.user.id)
        if (!questionIds || questionIds.length === 0) {
            return response.status(400).json({ data: null, message: "Questions cannot be added" });
        }
        return response.status(200).json({ data: questionIds, message: `${questionIds.length} Questions Created` });
    } catch (error) {
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
        if (!questionIds || questionIds.length === 0) {
            return response.status(400).json({ data: null, message: "Not Questions Added" });
        }
        return response.status(200).json({ data: questionIds, message: `${questionIds.length} Questions Created` });
    } catch (error) {
        console.log("🚀 ~ router.post ~ error:", error)
        return response.status(500).json({ data: null, message: 'Internal Server Error' })
    }
})

router.get('/get-questions', async (request: Request, response: Response) => {
    try {
        const limit = request.query.limit;

        // Improved limit check
        if (!limit || isNaN(Number(limit)) || Number(limit) < 1) {
            return response.status(400).json({ data: null, message: 'Please specify a valid limit' });
        }

        const questionIds = await QuestionServices.getQuestionsIds(Number(limit));

        if (!questionIds || questionIds.length === 0) {
            return response.status(404).json({ data: null, message: 'No Questions Found' });
        }

        return response.status(200).json({ data: questionIds, message: 'Questions Retrieved' });
    } catch (error) {
        console.error("🚀 ~ router.get error:", error);
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
});


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

// make a similar route t get count of total questions
router.get('/get-total-questions-count', async (request: Request, response: Response) => {
    try {
        const totalQuestions = await QuestionServices.getTotalQuestionsCount()
        if (!totalQuestions) {
            return response.status(500).json({ data: null, message: 'No Questions Found' })
        }
        return response.status(200).json({ data: totalQuestions, message: 'Question Found' });
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

router.get('/get-stream-hierarchy', async (request: Request, response: Response) => {
    try {
        const streamHierarchy = await QuestionServices.getStreamHierarchy()
        if (!streamHierarchy) {
            return response.status(404).json({ data: null, message: 'No Stream Hierarchy Found' })
        }
        return response.status(200).json({ data: streamHierarchy, message: 'Stream Hierarchy Found' });
    } catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' })
    }
})


router.get('/get-subjects', async (request: Request, response: Response) => {
    try {
        const subjects = await QuestionServices.getSubjects()
        if (!subjects || subjects.length === 0) {
            return response.status(404).json({ data: null, message: 'No Subjects Found' })
        }
        return response.status(200).json({ data: subjects, message: 'Subjects Found' });
    } catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' })
    }
})

// a route to read all the questions from the database and then download them in json format
router.get('/download-questions', async (request: Request, response: Response) => {
    try {
        return response.status(200).json({ data: null, message: 'Downloaded' });

        const questions = await QuestionServices.getAllQuestions()
        if (!questions || questions.length === 0) {
            return response.status(404).json({ data: null, message: 'No Questions Found' })
        }
        return response.status(200).json({ data: questions, message: 'Questions Found' });
    } catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' })
    }
})





export default router