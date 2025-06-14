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
exports.getAllQuestions = exports.getTotalQuestionsPerSubjectAndChapter = exports.getTotalQuestionsPerSubject = exports.getSubjects = exports.getStreamHierarchy = exports.getSyllabus = exports.getTotalQuestionsCount = exports.getQuestionsBySubject = exports.getQuestionsIdsBySubjectAndChapter = exports.getQuestionsIdsBySubject = exports.getQuestionsIds = exports.updateQuestionCount = exports.updateIsPastQuestion = exports.addMultipleQuestionsForDifferentSubjectAndChapter = exports.addMultipleQuestionsForSameSubjectAndChapter = exports.reportQuestion = exports.checkIfQuestionIsReported = exports.addSingleQuestion = void 0;
const global_data_1 = require("../utils/global-data");
const prisma_1 = __importDefault(require("../utils/prisma"));
const syllabus_1 = require("../utils/syllabus");
const questions_methods_1 = require("./questions.methods");
// add a single question
const addSingleQuestion = (questionObject, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { question, answer, explanation, options, subject, chapter, unit, difficulty, stream } = questionObject;
    const newQuestion = yield prisma_1.default.question.create({
        data: {
            question,
            answer,
            subject,
            chapter,
            unit: unit || "",
            stream,
            explanation,
            difficulty,
        },
        select: {
            id: true,
            subject: true,
            stream: true,
            chapter: true,
        }
    });
    if (!newQuestion)
        return null;
    const newOption = yield prisma_1.default.option.create({
        data: Object.assign(Object.assign({}, options), { questionId: newQuestion.id })
    });
    if (!newOption)
        return null;
    // const isAddedByAdmin = ROLES_HIEARCHY.MODERATOR.includes(newQuestion.user.role as string) ? true : false
    const isVerified = yield prisma_1.default.isVerified.create({
        data: {
            questionId: newQuestion.id,
            state: true,
            by: userId
        }
    });
    yield (0, exports.updateQuestionCount)({
        stream: newQuestion.stream,
        subject: newQuestion.subject,
        chapter: newQuestion.chapter,
        count: 1
    });
    return (_a = newQuestion.id) !== null && _a !== void 0 ? _a : null;
});
exports.addSingleQuestion = addSingleQuestion;
// check if question is reported
const checkIfQuestionIsReported = (questionId) => __awaiter(void 0, void 0, void 0, function* () {
    const reportedQuestion = yield prisma_1.default.isReported.findUnique({
        where: { questionId }
    });
    return reportedQuestion ? true : false;
});
exports.checkIfQuestionIsReported = checkIfQuestionIsReported;
// report question
const reportQuestion = (questionId, description) => __awaiter(void 0, void 0, void 0, function* () {
    const reportedQuestion = yield prisma_1.default.isReported.create({
        data: {
            questionId,
            state: true,
            message: description
        }
    });
    return reportedQuestion.message;
});
exports.reportQuestion = reportQuestion;
// add multiple questions from same chapter and subject
const addMultipleQuestionsForSameSubjectAndChapter = (questions, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!questions.length)
        return null;
    const { subject, chapter, stream } = questions[0];
    const addedQuestionIds = [];
    for (const questionObject of questions) {
        const { question, answer, explanation, options, difficulty, stream, unit, images } = questionObject;
        const newQuestion = yield prisma_1.default.question.create({
            data: {
                question,
                answer,
                subject,
                chapter,
                stream,
                explanation,
                difficulty,
                unit: unit || "",
            },
            select: {
                id: true,
                subject: true,
                stream: true,
                chapter: true,
            },
        });
        if (!newQuestion)
            return null;
        const newOption = yield prisma_1.default.option.create({
            data: Object.assign(Object.assign({}, options), { questionId: newQuestion.id }),
        });
        if (!newOption)
            return null;
        if (images) {
            const newImages = yield prisma_1.default.images.create({
                data: Object.assign(Object.assign({}, images), { questionId: newQuestion.id }),
            });
            if (!newImages)
                return null;
        }
        // const isAddedByAdmin = ROLES_HIEARCHY.MODERATOR.includes(newQuestion.user.role as string);
        yield prisma_1.default.isVerified.create({
            data: {
                questionId: newQuestion.id,
                state: true,
                by: userId,
            },
        });
        addedQuestionIds.push(newQuestion.id);
    }
    yield (0, exports.updateQuestionCount)({
        stream,
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
        const { question, answer, explanation, options, subject, chapter, difficulty, unit, stream, images } = questionObject;
        const newQuestion = yield prisma_1.default.question.create({
            data: {
                question,
                answer,
                subject,
                chapter,
                unit: unit || "",
                explanation,
                stream,
                difficulty,
            },
            select: {
                id: true,
                subject: true,
                stream: true,
                chapter: true,
            },
        });
        if (!newQuestion)
            return null;
        const { a, b, c, d } = options;
        const newOption = yield prisma_1.default.option.create({
            data: {
                a,
                b,
                c,
                d,
                questionId: newQuestion.id,
            },
        });
        if (!newOption)
            return null;
        if (images) {
            const newImages = yield prisma_1.default.images.create({
                data: Object.assign(Object.assign({}, images), { questionId: newQuestion.id }),
            });
            if (!newImages)
                return null;
        }
        // const isAddedByAdmin = ROLES_HIEARCHY.MODERATOR.includes(newQuestion.user.role as string);
        yield prisma_1.default.isVerified.create({
            data: {
                questionId: newQuestion.id,
                state: true, //change to isAddedByAdmin when isAddedByAdmin is valid based on your auth or when needed
                by: userId,
            },
        });
        addedQuestionIds.push(newQuestion.id);
        yield (0, exports.updateQuestionCount)({
            stream: newQuestion.stream,
            subject: newQuestion.subject,
            chapter: newQuestion.chapter,
            count: 1,
        });
    }
    return addedQuestionIds;
});
exports.addMultipleQuestionsForDifferentSubjectAndChapter = addMultipleQuestionsForDifferentSubjectAndChapter;
// to add , update past questions table
const updateIsPastQuestion = (isPastQuestionData, questionsIds) => __awaiter(void 0, void 0, void 0, function* () {
    const { category, affiliation, stream, year } = isPastQuestionData;
    const pastQuestionData = questionsIds.map((questionId) => ({
        stream,
        year,
        affiliation,
        category,
        questionId,
    }));
    const newPastQuestions = yield prisma_1.default.isPastQuestion.createMany({
        data: pastQuestionData,
        skipDuplicates: true,
    });
    return newPastQuestions.count > 0 ? questionsIds : null;
});
exports.updateIsPastQuestion = updateIsPastQuestion;
// update the question counts in db for each chapter ans subject
// stream is optional for now but will be required later
// make unique combination of subject and chapter and stream --- which is not present now
const updateQuestionCount = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { subject, chapter, count, stream } = data;
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
                count: count,
                stream: stream
            },
        });
    }
});
exports.updateQuestionCount = updateQuestionCount;
// to fetch a certain number of question ids -- esp for creating custom tests
const getQuestionsIds = (limit, stream) => __awaiter(void 0, void 0, void 0, function* () {
    // Validate that limit is a positive integer
    if (!Number.isInteger(limit) || limit <= 0) {
        console.error("Invalid limit:", limit);
        return null;
    }
    const questions = yield prisma_1.default.question.findManyRandom(limit, {
        where: {
            stream: stream
        },
        select: { id: true }
    });
    // Map IDs and check if array is empty
    const questionIds = questions.map(question => question.id);
    if (questionIds.length === 0) {
        console.warn("No questions found.");
        return null;
    }
    return questionIds;
});
exports.getQuestionsIds = getQuestionsIds;
// ot Fetch questions by subject with a limit -- esp for subjectwise tests
const getQuestionsIdsBySubject = (subject, limit, stream) => __awaiter(void 0, void 0, void 0, function* () {
    const limitValue = limit !== null && limit !== void 0 ? limit : 10;
    const selectedQuestions = yield prisma_1.default.question.findManyRandom(limitValue, {
        where: {
            subject: subject,
            stream: stream
        },
    });
    if (!selectedQuestions || selectedQuestions.length === 0)
        return null;
    return selectedQuestions.map(question => question.id);
});
exports.getQuestionsIdsBySubject = getQuestionsIdsBySubject;
// to Fetch questions by subject and chapter with a limit -- esp for chapterwise tests
const getQuestionsIdsBySubjectAndChapter = (subject, chapter, limit, stream) => __awaiter(void 0, void 0, void 0, function* () {
    const limitValue = limit !== null && limit !== void 0 ? limit : 10;
    const selectedQuestions = yield prisma_1.default.question.findManyRandom(limitValue, {
        where: {
            subject: subject,
            chapter: chapter,
            stream: stream
        },
    });
    if (!selectedQuestions || selectedQuestions.length === 0)
        return null;
    return selectedQuestions.map(question => question.id);
});
exports.getQuestionsIdsBySubjectAndChapter = getQuestionsIdsBySubjectAndChapter;
// reconside later this -- some buggy code this is
const getQuestionsBySubject = (subject) => __awaiter(void 0, void 0, void 0, function* () {
    const questions = yield prisma_1.default.question.findManyRandom(25, {
        where: {
            subject: subject
        },
        select: {
            id: true,
            question: true,
            subject: true,
            chapter: true,
            options: true,
            answer: true,
            explanation: true,
            difficulty: true,
            unit: true,
            stream: true,
        }
    });
    const modifiedQuestions = questions.map(question => {
        var _a, _b, _c, _d;
        return Object.assign(Object.assign({}, question), { options: {
                a: ((_a = question.options) === null || _a === void 0 ? void 0 : _a.a) || "",
                b: ((_b = question.options) === null || _b === void 0 ? void 0 : _b.b) || "",
                c: ((_c = question.options) === null || _c === void 0 ? void 0 : _c.c) || "",
                d: ((_d = question.options) === null || _d === void 0 ? void 0 : _d.d) || "",
            } });
    });
    if (!modifiedQuestions || modifiedQuestions.length === 0)
        return null;
    return modifiedQuestions;
});
exports.getQuestionsBySubject = getQuestionsBySubject;
// get total questions count
const getTotalQuestionsCount = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalQuestions = yield prisma_1.default.question.count();
    return totalQuestions !== null && totalQuestions !== void 0 ? totalQuestions : null;
});
exports.getTotalQuestionsCount = getTotalQuestionsCount;
// get syllabus
const getSyllabus = (stream) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    return (_a = syllabus_1.SYLLABUS[stream]) !== null && _a !== void 0 ? _a : null;
});
exports.getSyllabus = getSyllabus;
// get sream hierarchy
const getStreamHierarchy = () => __awaiter(void 0, void 0, void 0, function* () {
    return global_data_1.STREAM_HIERARCHY !== null && global_data_1.STREAM_HIERARCHY !== void 0 ? global_data_1.STREAM_HIERARCHY : null;
});
exports.getStreamHierarchy = getStreamHierarchy;
// get Subjects
const getSubjects = (stream) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    return (_a = (0, questions_methods_1.getAllSubjects)(syllabus_1.SYLLABUS, stream)) !== null && _a !== void 0 ? _a : null;
});
exports.getSubjects = getSubjects;
// get count of questions in each subject -- exp for subject wise test models
const getTotalQuestionsPerSubject = (stream) => __awaiter(void 0, void 0, void 0, function* () {
    const questionCounts = yield prisma_1.default.questionCount.findMany({
        where: {
            stream: stream
        }
    }); // Retrieve all records
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
    const result = Object.entries(totalQuestionsPerSubject)
        .map(([subject, count]) => ({ subject, count }))
        .sort((a, b) => b.count - a.count); // Sort in descending order based on count
    return result;
});
exports.getTotalQuestionsPerSubject = getTotalQuestionsPerSubject;
// get count of questions in each chapter and its subject -- exp for showing chapter wise tests models
const getTotalQuestionsPerSubjectAndChapter = (stream) => __awaiter(void 0, void 0, void 0, function* () {
    const questionCounts = yield prisma_1.default.questionCount.findMany({
        where: {
            stream: stream
        }
    });
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
    // Sort chapters by count in descending order within each subject while maintaining the nested object structure
    const result = Object.fromEntries(Object.entries(totalQuestionsPerSubjectAndChapter).map(([subject, chapters]) => [
        subject,
        Object.fromEntries(Object.entries(chapters)
            .sort(([, countA], [, countB]) => countB - countA) // Sort by count in descending order
        ),
    ]));
    return result;
});
exports.getTotalQuestionsPerSubjectAndChapter = getTotalQuestionsPerSubjectAndChapter;
// a function that will read all the questions and options associated with them in the database and then return them
const getAllQuestions = () => __awaiter(void 0, void 0, void 0, function* () {
    const questions = yield prisma_1.default.question.findMany({
        select: {
            id: true,
            question: true,
            images: true,
            answer: true,
            explanation: true,
            difficulty: true,
            subject: true,
            chapter: true,
            unit: true,
            options: true,
            IsPast: true,
        },
    });
    return null;
    return questions;
});
exports.getAllQuestions = getAllQuestions;
