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
const questions_validators_1 = require("./questions.validators");
const express_validator_1 = require("express-validator");
const QuestionServices = __importStar(require("../questions/questions.services"));
const middleware_1 = require("../utils/middleware");
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
// add multiple questions from same chapter
router.post('/add-multiple-question-for-same-subject-and-chapter', middleware_1.checkModerator, questions_validators_1.addMultipleQuestionsValidation, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
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
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ message: errors.array()[0].msg });
        }
        if (!request.user || request.user === undefined || request.user === null) {
            return response.status(400).json({ data: null, message: "Not Authorized" });
        }
        const questionIds = yield QuestionServices.addMultipleQuestionsForDifferentSubjectAndChapter(request.body.questions, request.user.id);
        return response.status(200).json({ data: questionIds, message: 'Questions Created' });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.get('/get-questions', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const questionIds = yield QuestionServices.getQuestionsIds();
        if (questionIds.length === 0) {
            return response.status(500).json({ data: null, message: 'No Questions Found' });
        }
        return response.status(200).json({ data: questionIds, message: 'Question Created' });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.get('/get-total-questions-per-subject', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalQuestionsPerSubject = yield QuestionServices.getTotalQuestionsPerSubject();
        if (!totalQuestionsPerSubject || totalQuestionsPerSubject.length === 0) {
            return response.status(500).json({ data: [], message: 'No Questions Found' });
        }
        return response.status(200).json({ data: totalQuestionsPerSubject, message: 'Question Found' });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.get('/get-total-questions-per-subject-and-chapter', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalQuestionsPerSubject = yield QuestionServices.getTotalQuestionsPerSubjectAndChapter();
        if (!totalQuestionsPerSubject) {
            return response.status(500).json({ data: null, message: 'No Questions Found' });
        }
        return response.status(200).json({ data: totalQuestionsPerSubject, message: 'Question Found' });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.get('/get-syllabus', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const syllabus = yield QuestionServices.getSyllabus();
        if (!syllabus) {
            return response.status(404).json({ data: null, message: 'No Syllabus Found' });
        }
        return response.status(200).json({ data: syllabus, message: 'Question Found' });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.get('/get-subjects', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subjects = yield QuestionServices.getSubjects();
        if (!subjects || subjects.length === 0) {
            return response.status(404).json({ data: null, message: 'No Subjects Found' });
        }
        return response.status(200).json({ data: subjects, message: 'Subjects Found' });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
exports.default = router;
