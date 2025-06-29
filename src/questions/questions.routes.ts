import express, { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as QuestionServices from '../questions/questions.services';
import { checkModerator, checkStreamMiddleware, getSubscribedUserId, getUserSession, RequestExtended } from '../utils/middleware';
import { addMultipleQuestionsValidation, addSingleQuestionValidation, reportQuestionValidation } from './questions.validators';
import { getStreams } from '../utils/functions';
import { TStream } from '../utils/global-types';

const router = express.Router();


router.post('/add-single-question', checkModerator, addSingleQuestionValidation, async (request: RequestExtended, response: Response) => {
    try {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ message: errors.array()[0].msg });
        }

        if (!request.user || request.user === undefined || request.user === null) {
            return response.status(400).json({ data: null, message: "Not Authorized" });
        }

        const questionId = await QuestionServices.addSingleQuestion(request.body, request.user.id)
        console.log(questionId)
        if(!questionId) {
            return response.status(400).json({ data: null, message: "Unable to upload the image" });
        }
        return response.status(200).json({ data: questionId, message: 'Question Created' });
    } catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' })
    }
})

// adding this middleqare so everyone can report a question.. not only logged in ones
// for non logged users -- admin id will be added in the report entries
router.post('/report-question/:questionId', reportQuestionValidation, async (request: RequestExtended, response: Response) => {
    try {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ message: errors.array()[0].msg });
        }

        const questionId = request.params.questionId
        const description = request.body.description

        const isReported = await QuestionServices.checkIfQuestionIsReported(questionId)
        if (isReported) {
            return response.status(400).json({ data: null, message: 'Question Already Reported' });
        }

        const reportedQuestion = await QuestionServices.reportQuestion(questionId, description)
        if (!reportedQuestion) {
            return response.status(400).json({ data: null, message: 'Question Not Reported' });
        }
        return response.status(200).json({ data: reportedQuestion, message: 'Question Reported' });
    } catch (error) {
        console.log("🚀 ~ router.post ~ error:", error)
        return response.status(500).json({ data: null, message: 'Internal Server Error' })
    }
})

// add multiple questions from same chapter
router.post('/add-multiple-question-for-same-subject-and-chapter', checkModerator, addMultipleQuestionsValidation, async (request: RequestExtended, response: Response) => {
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
router.post('/add-multiple-question-for-different-subject-and-chapter', checkModerator, addMultipleQuestionsValidation, async (request: RequestExtended, response: Response) => {
    try {


        console.log(request.body.questions.length)

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

        const stream = request.query.stream as TStream
        if (!stream || !getStreams().includes(stream)) {
            return response.status(400).json({ data: null, message: 'Invalid Stream' })
        }

        // Improved limit check
        if (!limit || isNaN(Number(limit)) || Number(limit) < 1) {
            return response.status(400).json({ data: null, message: 'Please specify a valid limit' });
        }

        const questionIds = await QuestionServices.getQuestionsIds(Number(limit), stream);

        if (!questionIds || questionIds.length === 0) {
            return response.status(404).json({ data: null, message: 'No Questions Found' });
        }

        return response.status(200).json({ data: questionIds, message: 'Questions Retrieved' });
    } catch (error) {
        console.error("🚀 ~ router.get error:", error);
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
});


// users will get this for their own stream
router.get('/get-total-questions-per-subject',checkStreamMiddleware,getSubscribedUserId, async (request: RequestExtended, response: Response) => {
    try {
        if (!request.stream || !getStreams().includes(request.stream)) {
            return response.status(400).json({ data: null, message: 'Invalid Stream' })
        }

        const totalQuestionsPerSubject = await QuestionServices.getTotalQuestionsPerSubject(request.stream)
        if (!totalQuestionsPerSubject || totalQuestionsPerSubject.length === 0) {
            return response.status(500).json({ data: [], message: 'No Questions Found' })
        }
        return response.status(200).json({ data: totalQuestionsPerSubject, message: 'Question Found' });
    } catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' })
    }
})

// users will get this for their own stream
router.get('/get-total-questions-per-subject-and-chapter',checkStreamMiddleware,getSubscribedUserId, async (request: RequestExtended, response: Response) => {
    try {
        if (!request.stream || !getStreams().includes(request.stream)) {
            return response.status(400).json({ data: null, message: 'Invalid Stream' })
        }

        const totalQuestionsPerSubject = await QuestionServices.getTotalQuestionsPerSubjectAndChapter(request.stream)
        if (!totalQuestionsPerSubject) {
            return response.status(500).json({ data: null, message: 'No Questions Found' })
        }
        return response.status(200).json({ data: totalQuestionsPerSubject, message: 'Question Found' });
    } catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' })
    }
})


router.get('/get-reported-questions', checkModerator, async (request: Request, response: Response) => {
    try {
        const reportedQuestions = await QuestionServices.getReportedQuestions();
        if (!reportedQuestions || reportedQuestions.length === 0) {
            return response.status(404).json({ data: null, message: 'No Reported Questions Found' });
        }
        return response.status(200).json({ data: reportedQuestions, message: 'Reported Questions Retrieved' });
    } catch (error) {
        console.error("🚀 ~ router.get error:", error);
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
});

router.post('/update-question', checkModerator, async (request: Request, response: Response) => {
    try {

        if (!request.body.id) {
            return response.status(400).json({ data: null, message: 'Question ID is required' });
        }

        // Update the question
        const updatedQuestion = await QuestionServices.updateQuestion(request.body);
        if (!updatedQuestion) {
            return response.status(404).json({ data: null, message: 'Question not found or could not be updated' });
        }

        return response.status(200).json({ data: updatedQuestion, message: 'Question updated successfully' });
    } catch (error) {
        console.error("🚀 ~ router.put error:", error);
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
});


// remove reported questions
router.delete('/remove-reported-question/:questionId', checkModerator, async (request: Request, response: Response) => {
    try {
        const { questionId } = request.params;
        if (!questionId) {
            return response.status(400).json({ data: null, message: 'Question ID is required' });
        }

        const isRemoved = await QuestionServices.removeReportedQuestions(questionId);
        if (!isRemoved) {
            return response.status(404).json({ data: null, message: 'Failed to remove reported question' });
        }

        return response.status(200).json({ data: true, message: 'Reported question removed successfully' });
    } catch (error) {
        console.error("🚀 ~ router.delete error:", error);
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
});



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


router.get('/get-syllabus', async (request: Request, response: Response) => {
    try {
        const stream = request.query.stream as TStream
        if (!stream || !getStreams().includes(stream)) {
            return response.status(400).json({ data: null, message: 'Invalid Stream' })
        }
        
        const syllabus = await QuestionServices.getSyllabus(stream)
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

// get questions by subject while making tests
//  not ading stream -- as the subjects are totally different as foe now
router.get('/get-questions-by-subject',checkModerator, async (request: Request, response: Response) => {
    try {
        const subject = request.query.subject as string
        if (!subject) {
            return response.status(400).json({ data: null, message: 'Invalid Subject' })
        }

        const questions = await QuestionServices.getQuestionsBySubject(subject)
        if (!questions) {
            return response.status(404).json({ data: null, message: 'No Questions Found' })
        }
        return response.status(200).json({ data: questions, message: 'Questions Found' });
    } catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' })
    }
})



router.get('/get-subjects', async (request: Request, response: Response) => {
    try {
        const stream = request.query.stream as TStream
        if (!stream || !getStreams().includes(stream)) {
            return response.status(400).json({ data: null, message: 'Invalid Stream' })
        }

        const subjects = await QuestionServices.getSubjects(stream)
        if (!subjects || subjects.length === 0) {
            return response.status(404).json({ data: null, message: 'No Subjects Found' })
        }
        return response.status(200).json({ data: subjects, message: 'Subjects Found' });
    } catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' })
    }
})


router.get('/get-chapters-by-subject', async (request: Request, response: Response) => {
    try {
        const stream = request.query.stream as TStream
        const subject = request.query.subject as string
        
        if (!stream || !getStreams().includes(stream)) {
            return response.status(400).json({ data: null, message: 'Invalid Stream' })
        }
        
        if (!subject || !QuestionServices.isSubjectInTheStream(stream, subject)) {
            return response.status(400).json({ data: null, message: 'Invalid Subject' })
        }

        const chapters = await QuestionServices.getChaptersBySubject(stream, subject)
        if (!chapters || chapters.length === 0) {
            return response.status(404).json({ data: null, message: 'No Chapters Found' })
        }
        return response.status(200).json({ data: chapters, message: 'Chapters Found' });
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