"use strict";
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
exports.getSyllabus = exports.getQuestionsBySubjectAndChapter = exports.getQuestionsBySubject = exports.getTotalQuestionsPerSubjectAndChapter = exports.getTotalQuestionsPerSubject = exports.updateQuestionCount = exports.getQuestionsIds = exports.addMultipleQuestionsForDifferentSubjectAndChapter = exports.addMultipleQuestionsForSameSubjectAndChapter = exports.addSingleQuestion = void 0;
const users_schema_1 = require("../users/users.schema");
const global_data_1 = require("../utils/global-data");
const prisma_1 = __importDefault(require("../utils/prisma"));
const addSingleQuestion = (questionObject, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { question, answer, explanation, options, subject, chapter, unit, difficulty, } = questionObject;
    const newQuestion = yield prisma_1.default.question.create({
        data: {
            question,
            answer,
            subject,
            unit,
            chapter,
            explanation,
            difficulty,
            userId,
        },
        select: {
            id: true,
            subject: true,
            chapter: true,
            user: {
                select: {
                    role: true
                }
            }
        }
    });
    if (!newQuestion)
        return null;
    const newOption = yield prisma_1.default.option.create({
        data: Object.assign(Object.assign({}, options), { questionId: newQuestion.id })
    });
    if (!newOption)
        return null;
    const isAddedByAdmin = users_schema_1.ROLES_HIEARCHY.MODERATOR.includes(newQuestion.user.role) ? true : false;
    const isVerified = yield prisma_1.default.isVerified.create({
        data: {
            questionId: newQuestion.id,
            state: isAddedByAdmin,
            by: userId
        }
    });
    yield (0, exports.updateQuestionCount)({
        subject: newQuestion.subject,
        chapter: newQuestion.chapter,
        count: 1
    });
    return (_a = newQuestion.id) !== null && _a !== void 0 ? _a : null;
});
exports.addSingleQuestion = addSingleQuestion;
// add multiple questions from same chapter and subject
const addMultipleQuestionsForSameSubjectAndChapter = (questions, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!questions.length)
        return null;
    const { subject, chapter } = questions[0];
    const addedQuestionIds = [];
    for (const questionObject of questions) {
        const { question, answer, explanation, options, difficulty } = questionObject;
        const newQuestion = yield prisma_1.default.question.create({
            data: {
                question,
                answer,
                subject,
                chapter,
                explanation,
                difficulty,
                userId,
            },
            select: {
                id: true,
                subject: true,
                chapter: true,
                user: {
                    select: {
                        role: true,
                    },
                },
            },
        });
        if (!newQuestion)
            return null;
        const newOption = yield prisma_1.default.option.create({
            data: Object.assign(Object.assign({}, options), { questionId: newQuestion.id }),
        });
        if (!newOption)
            return null;
        const isAddedByAdmin = users_schema_1.ROLES_HIEARCHY.MODERATOR.includes(newQuestion.user.role);
        yield prisma_1.default.isVerified.create({
            data: {
                questionId: newQuestion.id,
                state: isAddedByAdmin,
                by: userId,
            },
        });
        addedQuestionIds.push(newQuestion.id);
    }
    yield (0, exports.updateQuestionCount)({
        subject,
        chapter,
        count: questions.length,
    });
    return addedQuestionIds;
});
exports.addMultipleQuestionsForSameSubjectAndChapter = addMultipleQuestionsForSameSubjectAndChapter;
// add multiple questions from different chapter and subject
const addMultipleQuestionsForDifferentSubjectAndChapter = (questions, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!questions.length)
        return null;
    const addedQuestionIds = [];
    for (const questionObject of questions) {
        const { question, answer, explanation, options, subject, chapter, difficulty } = questionObject;
        const newQuestion = yield prisma_1.default.question.create({
            data: {
                question,
                answer,
                subject,
                chapter,
                explanation,
                difficulty,
                userId,
            },
            select: {
                id: true,
                subject: true,
                chapter: true,
                user: {
                    select: {
                        role: true,
                    },
                },
            },
        });
        if (!newQuestion)
            return null;
        const newOption = yield prisma_1.default.option.create({
            data: Object.assign(Object.assign({}, options), { questionId: newQuestion.id }),
        });
        if (!newOption)
            return null;
        const isAddedByAdmin = users_schema_1.ROLES_HIEARCHY.MODERATOR.includes(newQuestion.user.role);
        yield prisma_1.default.isVerified.create({
            data: {
                questionId: newQuestion.id,
                state: isAddedByAdmin,
                by: userId,
            },
        });
        addedQuestionIds.push(newQuestion.id);
        yield (0, exports.updateQuestionCount)({
            subject: newQuestion.subject,
            chapter: newQuestion.chapter,
            count: 1,
        });
    }
    return addedQuestionIds;
});
exports.addMultipleQuestionsForDifferentSubjectAndChapter = addMultipleQuestionsForDifferentSubjectAndChapter;
const getQuestionsIds = () => __awaiter(void 0, void 0, void 0, function* () {
    const questions = yield prisma_1.default.question.findMany({
        select: {
            id: true
        }
    });
    const questionsIds = questions.map(question => question.id);
    if (!questionsIds || questionsIds.length === 0)
        return [];
    return questionsIds;
});
exports.getQuestionsIds = getQuestionsIds;
// update the question counts in db for each chapter ans subject
const updateQuestionCount = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { subject, chapter, count } = data;
    const existingCount = yield prisma_1.default.questionCount.findUnique({
        where: {
            subject_chapter: { subject, chapter }, // Check unique combination
        },
    });
    if (existingCount) {
        yield prisma_1.default.questionCount.update({
            where: {
                subject_chapter: { subject, chapter },
            },
            data: {
                count: existingCount.count + count,
            }
        });
    }
    else {
        yield prisma_1.default.questionCount.create({
            data: {
                subject,
                chapter,
                count: 1,
            },
        });
    }
});
exports.updateQuestionCount = updateQuestionCount;
const getTotalQuestionsPerSubject = () => __awaiter(void 0, void 0, void 0, function* () {
    const questionCounts = yield prisma_1.default.questionCount.findMany(); // Retrieve all records
    const totalQuestionsPerSubject = {}; // Object to store counts per subject
    questionCounts.forEach((record) => {
        const { subject, count } = record;
        if (totalQuestionsPerSubject[subject]) {
            totalQuestionsPerSubject[subject] += count;
        }
        else {
            totalQuestionsPerSubject[subject] = count;
        }
    });
    const result = Object.entries(totalQuestionsPerSubject).map(([subject, count]) => ({
        subject,
        count
    }));
    return result;
});
exports.getTotalQuestionsPerSubject = getTotalQuestionsPerSubject;
const getTotalQuestionsPerSubjectAndChapter = () => __awaiter(void 0, void 0, void 0, function* () {
    const questionCounts = yield prisma_1.default.questionCount.findMany();
    const totalQuestionsPerSubjectAndChapter = {};
    questionCounts.forEach((record) => {
        const { subject, chapter, count } = record;
        if (!totalQuestionsPerSubjectAndChapter[subject]) {
            totalQuestionsPerSubjectAndChapter[subject] = {};
        }
        if (totalQuestionsPerSubjectAndChapter[subject][chapter]) {
            totalQuestionsPerSubjectAndChapter[subject][chapter] += count;
        }
        else {
            totalQuestionsPerSubjectAndChapter[subject][chapter] = count;
        }
    });
    return totalQuestionsPerSubjectAndChapter ? totalQuestionsPerSubjectAndChapter : null;
});
exports.getTotalQuestionsPerSubjectAndChapter = getTotalQuestionsPerSubjectAndChapter;
// Fetch questions by subject with a limit
const getQuestionsBySubject = (subject, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const selectedQuestions = yield prisma_1.default.question.findMany({
        where: {
            subject: subject,
        },
        take: limit ? 10 : 50,
    });
    if (!selectedQuestions || selectedQuestions.length === 0)
        return null;
    return selectedQuestions.map(question => question.id);
});
exports.getQuestionsBySubject = getQuestionsBySubject;
// Fetch questions by subject and chapter with a limit
const getQuestionsBySubjectAndChapter = (subject, chapter, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const selectedQuestions = yield prisma_1.default.question.findMany({
        where: {
            subject: subject,
            chapter: chapter,
        },
        take: limit ? 10 : 50,
    });
    if (!selectedQuestions || selectedQuestions.length === 0)
        return null;
    return selectedQuestions.map(question => question.id);
});
exports.getQuestionsBySubjectAndChapter = getQuestionsBySubjectAndChapter;
// get syllabus
const getSyllabus = () => __awaiter(void 0, void 0, void 0, function* () {
    return global_data_1.PG_SYLLABUS !== null && global_data_1.PG_SYLLABUS !== void 0 ? global_data_1.PG_SYLLABUS : null;
});
exports.getSyllabus = getSyllabus;
