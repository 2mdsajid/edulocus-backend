"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const QuestionServices = __importStar(require("../questions/questions.services"));
const middleware_1 = require("../utils/middleware");
const questions_validators_1 = require("./questions.validators");
const functions_1 = require("../utils/functions");
const router = express_1.default.Router();
router.post('/add-single-question', middleware_1.checkModerator, questions_validators_1.addSingleQuestionValidation, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ message: errors.array()[0].msg });
        }
        if (!request.user || request.user === undefined || request.user === null) {
            return response.status(400).json({ data: null, message: "Not Authorized" });
        }
        const questionId = yield QuestionServices.addSingleQuestion(request.body, request.user.id);
        return response.status(200).json({ data: questionId, message: 'Question Created' });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
// adding this middleqare so everyone can report a question.. not only logged in ones
// for non logged users -- admin id will be added in the report entries
router.post('/report-question/:questionId', questions_validators_1.reportQuestionValidation, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ message: errors.array()[0].msg });
        }
        const questionId = request.params.questionId;
        const description = request.body.description;
        const isReported = yield QuestionServices.checkIfQuestionIsReported(questionId);
        if (isReported) {
            return response.status(400).json({ data: null, message: 'Question Already Reported' });
        }
        const reportedQuestion = yield QuestionServices.reportQuestion(questionId, description);
        if (!reportedQuestion) {
            return response.status(400).json({ data: null, message: 'Question Not Reported' });
        }
        return response.status(200).json({ data: reportedQuestion, message: 'Question Reported' });
    }
    catch (error) {
        console.log("🚀 ~ router.post ~ error:", error);
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
// add multiple questions from same chapter
router.post('/add-multiple-question-for-same-subject-and-chapter', middleware_1.checkModerator, questions_validators_1.addMultipleQuestionsValidation, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            console.log(request.body);
            return response.status(400).json({ message: errors.array()[0].msg });
        }
        if (!request.user || request.user === undefined || request.user === null) {
            return response.status(400).json({ data: null, message: "Not Authorized" });
        }
        const questionIds = yield QuestionServices.addMultipleQuestionsForSameSubjectAndChapter(request.body.questions, request.user.id);
        if (!questionIds || questionIds.length === 0) {
            return response.status(400).json({ data: null, message: "Questions cannot be added" });
        }
        return response.status(200).json({ data: questionIds, message: `${questionIds.length} Questions Created` });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
// add multiple questions from different subject and chapter
router.post('/add-multiple-question-for-different-subject-and-chapter', middleware_1.checkModerator, questions_validators_1.addMultipleQuestionsValidation, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(request.body.questions.length);
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ message: errors.array()[0].msg });
        }
        if (!request.user || request.user === undefined || request.user === null) {
            return response.status(400).json({ data: null, message: "Not Authorized" });
        }
        const questionIds = yield QuestionServices.addMultipleQuestionsForDifferentSubjectAndChapter(request.body.questions, request.user.id);
        if (!questionIds || questionIds.length === 0) {
            return response.status(400).json({ data: null, message: "Not Questions Added" });
        }
        return response.status(200).json({ data: questionIds, message: `${questionIds.length} Questions Created` });
    }
    catch (error) {
        console.log("🚀 ~ router.post ~ error:", error);
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.get('/get-questions', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = request.query.limit;
        const stream = request.query.stream;
        if (!stream || !(0, functions_1.getStreams)().includes(stream)) {
            return response.status(400).json({ data: null, message: 'Invalid Stream' });
        }
        // Improved limit check
        if (!limit || isNaN(Number(limit)) || Number(limit) < 1) {
            return response.status(400).json({ data: null, message: 'Please specify a valid limit' });
        }
        const questionIds = yield QuestionServices.getQuestionsIds(Number(limit), stream);
        if (!questionIds || questionIds.length === 0) {
            return response.status(404).json({ data: null, message: 'No Questions Found' });
        }
        return response.status(200).json({ data: questionIds, message: 'Questions Retrieved' });
    }
    catch (error) {
        console.error("🚀 ~ router.get error:", error);
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
// users will get this for their own stream
router.get('/get-total-questions-per-subject', middleware_1.checkStreamMiddleware, middleware_1.getSubscribedUserId, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!request.stream || !(0, functions_1.getStreams)().includes(request.stream)) {
            return response.status(400).json({ data: null, message: 'Invalid Stream' });
        }
        const totalQuestionsPerSubject = yield QuestionServices.getTotalQuestionsPerSubject(request.stream);
        if (!totalQuestionsPerSubject || totalQuestionsPerSubject.length === 0) {
            return response.status(500).json({ data: [], message: 'No Questions Found' });
        }
        return response.status(200).json({ data: totalQuestionsPerSubject, message: 'Question Found' });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
// users will get this for their own stream
router.get('/get-total-questions-per-subject-and-chapter', middleware_1.checkStreamMiddleware, middleware_1.getSubscribedUserId, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!request.stream || !(0, functions_1.getStreams)().includes(request.stream)) {
            return response.status(400).json({ data: null, message: 'Invalid Stream' });
        }
        const totalQuestionsPerSubject = yield QuestionServices.getTotalQuestionsPerSubjectAndChapter(request.stream);
        if (!totalQuestionsPerSubject) {
            return response.status(500).json({ data: null, message: 'No Questions Found' });
        }
        return response.status(200).json({ data: totalQuestionsPerSubject, message: 'Question Found' });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.get('/get-reported-questions', middleware_1.checkModerator, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reportedQuestions = yield QuestionServices.getReportedQuestions();
        if (!reportedQuestions || reportedQuestions.length === 0) {
            return response.status(404).json({ data: null, message: 'No Reported Questions Found' });
        }
        return response.status(200).json({ data: reportedQuestions, message: 'Reported Questions Retrieved' });
    }
    catch (error) {
        console.error("🚀 ~ router.get error:", error);
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.post('/update-question', middleware_1.checkModerator, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!request.body.id) {
            return response.status(400).json({ data: null, message: 'Question ID is required' });
        }
        // Update the question
        const updatedQuestion = yield QuestionServices.updateQuestion(request.body);
        if (!updatedQuestion) {
            return response.status(404).json({ data: null, message: 'Question not found or could not be updated' });
        }
        return response.status(200).json({ data: updatedQuestion, message: 'Question updated successfully' });
    }
    catch (error) {
        console.error("🚀 ~ router.put error:", error);
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
// remove reported questions
router.delete('/remove-reported-question/:questionId', middleware_1.checkModerator, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { questionId } = request.params;
        if (!questionId) {
            return response.status(400).json({ data: null, message: 'Question ID is required' });
        }
        const isRemoved = yield QuestionServices.removeReportedQuestions(questionId);
        if (!isRemoved) {
            return response.status(404).json({ data: null, message: 'Failed to remove reported question' });
        }
        return response.status(200).json({ data: true, message: 'Reported question removed successfully' });
    }
    catch (error) {
        console.error("🚀 ~ router.delete error:", error);
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
// make a similar route t get count of total questions
router.get('/get-total-questions-count', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalQuestions = yield QuestionServices.getTotalQuestionsCount();
        if (!totalQuestions) {
            return response.status(500).json({ data: null, message: 'No Questions Found' });
        }
        return response.status(200).json({ data: totalQuestions, message: 'Question Found' });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.get('/get-syllabus', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stream = request.query.stream;
        if (!stream || !(0, functions_1.getStreams)().includes(stream)) {
            return response.status(400).json({ data: null, message: 'Invalid Stream' });
        }
        const syllabus = yield QuestionServices.getSyllabus(stream);
        if (!syllabus) {
            return response.status(404).json({ data: null, message: 'No Syllabus Found' });
        }
        return response.status(200).json({ data: syllabus, message: 'Question Found' });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.get('/get-stream-hierarchy', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const streamHierarchy = yield QuestionServices.getStreamHierarchy();
        if (!streamHierarchy) {
            return response.status(404).json({ data: null, message: 'No Stream Hierarchy Found' });
        }
        return response.status(200).json({ data: streamHierarchy, message: 'Stream Hierarchy Found' });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
// get questions by subject while making tests
//  not ading stream -- as the subjects are totally different as foe now
router.get('/get-questions-by-subject', middleware_1.checkModerator, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subject = request.query.subject;
        if (!subject) {
            return response.status(400).json({ data: null, message: 'Invalid Subject' });
        }
        const questions = yield QuestionServices.getQuestionsBySubject(subject);
        if (!questions) {
            return response.status(404).json({ data: null, message: 'No Questions Found' });
        }
        return response.status(200).json({ data: questions, message: 'Questions Found' });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.get('/get-subjects', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stream = request.query.stream;
        if (!stream || !(0, functions_1.getStreams)().includes(stream)) {
            return response.status(400).json({ data: null, message: 'Invalid Stream' });
        }
        const subjects = yield QuestionServices.getSubjects(stream);
        if (!subjects || subjects.length === 0) {
            return response.status(404).json({ data: null, message: 'No Subjects Found' });
        }
        return response.status(200).json({ data: subjects, message: 'Subjects Found' });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.get('/get-chapters-by-subject', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stream = request.query.stream;
        const subject = request.query.subject;
        if (!stream || !(0, functions_1.getStreams)().includes(stream)) {
            return response.status(400).json({ data: null, message: 'Invalid Stream' });
        }
        if (!subject || !QuestionServices.isSubjectInTheStream(stream, subject)) {
            return response.status(400).json({ data: null, message: 'Invalid Subject' });
        }
        const chapters = yield QuestionServices.getChaptersBySubject(stream, subject);
        if (!chapters || chapters.length === 0) {
            return response.status(404).json({ data: null, message: 'No Chapters Found' });
        }
        return response.status(200).json({ data: chapters, message: 'Chapters Found' });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
// a route to read all the questions from the database and then download them in json format
router.get('/download-questions', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return response.status(200).json({ data: null, message: 'Downloaded' });
        const questions = yield QuestionServices.getAllQuestions();
        if (!questions || questions.length === 0) {
            return response.status(404).json({ data: null, message: 'No Questions Found' });
        }
        return response.status(200).json({ data: questions, message: 'Questions Found' });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
exports.default = router;
