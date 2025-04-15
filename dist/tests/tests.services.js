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
exports.getDashboardAnalytics = exports.saveUserScore = exports.createTestAnalytic = exports.getTypesOfTests = exports.getAllTests = exports.getAllTestsByType = exports.getCustomTestMetadata = exports.getDailyTestBySlug = exports.getCustomTestById = exports.isDailyTestSlugExist = exports.createChapterWiseCustomTestByUser = exports.createSubjectWiseCustomTestByUser = exports.createPastTest = exports.createCustomTest = void 0;
const questions_services_1 = require("../questions/questions.services");
const global_data_1 = require("../utils/global-data");
const prisma_1 = __importDefault(require("../utils/prisma"));
const tests_methods_1 = require("./tests.methods");
const createCustomTest = (customTestData) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, slug, createdById, mode, questions, type, stream } = customTestData;
    const newCustomTest = yield prisma_1.default.customTest.create({
        data: {
            name,
            slug,
            stream,
            createdById,
            type,
            mode: mode || 'ALL',
            questions: questions
        }
    });
    if (!newCustomTest)
        return null;
    return newCustomTest.id;
});
exports.createCustomTest = createCustomTest;
const createPastTest = (testData) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("🚀 ~ createPastTest ~ testData:", testData);
    const { customTestId, affiliation, year, stream, category } = testData;
    const newPastPaper = yield prisma_1.default.pastPaper.create({
        data: {
            stream,
            customTestId,
            affiliation,
            category,
            year
        }
    });
    if (!newPastPaper)
        return null;
    return newPastPaper;
});
exports.createPastTest = createPastTest;
const createSubjectWiseCustomTestByUser = (customTestData, subject) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, createdById, type, mode, limit, stream } = customTestData;
    const questions = yield (0, questions_services_1.getQuestionsBySubject)(subject, limit, stream);
    if (!questions || questions.length === 0)
        return null;
    const newCustomTest = yield prisma_1.default.customTest.create({
        data: {
            name,
            type,
            stream,
            slug: name.toLowerCase().replace(/ /g, "_"),
            createdById,
            mode: mode || 'ALL',
            questions: questions
        }
    });
    if (!newCustomTest)
        return null;
    return newCustomTest.id;
});
exports.createSubjectWiseCustomTestByUser = createSubjectWiseCustomTestByUser;
const createChapterWiseCustomTestByUser = (customTestData, subject, chapter) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, createdById, type, mode, limit, stream } = customTestData;
    const questions = yield (0, questions_services_1.getQuestionsBySubjectAndChapter)(subject, chapter, limit, stream);
    if (!questions || questions.length === 0)
        return null;
    const newCustomTest = yield prisma_1.default.customTest.create({
        data: {
            name,
            type,
            stream,
            slug: name.toLowerCase().replace(/ /g, "_"),
            createdById,
            mode: mode || 'ALL',
            questions: questions
        }
    });
    if (!newCustomTest)
        return null;
    return newCustomTest.id;
});
exports.createChapterWiseCustomTestByUser = createChapterWiseCustomTestByUser;
const isDailyTestSlugExist = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    const dailyTest = yield prisma_1.default.customTest.findFirst({
        where: {
            slug,
            type: "DAILY_TEST"
        }
    });
    if (!dailyTest)
        return false;
    return true;
});
exports.isDailyTestSlugExist = isDailyTestSlugExist;
const getCustomTestById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const customTest = yield prisma_1.default.customTest.findFirst({
        where: { id },
        select: {
            name: true,
            id: true,
            slug: true,
            createdBy: { select: { name: true } },
            questions: true
        }
    });
    if (!customTest)
        return null;
    const questions = yield prisma_1.default.question.findMany({
        where: { id: { in: customTest.questions } },
        select: {
            id: true,
            question: true,
            options: {
                select: {
                    a: true,
                    b: true,
                    c: true,
                    d: true,
                }
            },
            answer: true,
            explanation: true,
            subject: true,
            stream: true,
            chapter: true,
            unit: true,
            difficulty: true,
        }
    });
    const modifiedQuestions = questions.map((q) => (Object.assign(Object.assign({}, q), { options: q.options || { a: "", b: "", c: "", d: "" } })));
    const modifiedCustomTest = Object.assign(Object.assign({}, customTest), { createdBy: customTest.createdBy.name, fetchedQuestions: modifiedQuestions });
    return modifiedCustomTest;
});
exports.getCustomTestById = getCustomTestById;
const getDailyTestBySlug = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    const customTest = yield prisma_1.default.customTest.findFirst({
        where: {
            slug: slug
        },
        select: {
            name: true,
            id: true,
            slug: true,
            createdBy: { select: { name: true } },
            questions: true
        }
    });
    if (!customTest)
        return null;
    const questions = yield prisma_1.default.question.findMany({
        where: { id: { in: customTest.questions } },
        select: {
            id: true,
            question: true,
            options: {
                select: {
                    a: true,
                    b: true,
                    c: true,
                    d: true,
                }
            },
            answer: true,
            explanation: true,
            subject: true,
            chapter: true,
            stream: true,
            unit: true,
            difficulty: true,
        }
    });
    const modifiedQuestions = questions.map((q) => (Object.assign(Object.assign({}, q), { options: q.options || { a: "", b: "", c: "", d: "" } })));
    const modifiedCustomTest = Object.assign(Object.assign({}, customTest), { createdBy: customTest.createdBy.name, fetchedQuestions: modifiedQuestions });
    return modifiedCustomTest;
});
exports.getDailyTestBySlug = getDailyTestBySlug;
const getCustomTestMetadata = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const customTest = yield prisma_1.default.customTest.findFirst({
        where: {
            id
        },
        select: {
            name: true,
            id: true,
            slug: true,
            createdBy: {
                select: {
                    name: true,
                }
            },
            archive: true,
            date: true,
            usersConnected: true,
            questions: true,
            usersAttended: {
                select: {
                    username: true,
                    totalScore: true,
                }
            }
        }
    });
    if (!customTest)
        return null;
    const modifiedTestData = Object.assign(Object.assign({}, customTest), { createdBy: customTest.createdBy.name, questionsCount: customTest.questions.length });
    if (!modifiedTestData)
        return null;
    return modifiedTestData;
});
exports.getCustomTestMetadata = getCustomTestMetadata;
const getAllTestsByType = (type, stream) => __awaiter(void 0, void 0, void 0, function* () {
    const customTests = yield prisma_1.default.customTest.findMany({
        where: {
            type: type,
            stream: stream
        },
        select: {
            name: true,
            id: true,
            date: true,
            questions: true,
            pastPaper: {
                select: {
                    stream: true,
                    category: true,
                    year: true,
                    affiliation: true,
                }
            }
        }
    });
    if (!customTests || customTests.length === 0)
        return [];
    return customTests;
});
exports.getAllTestsByType = getAllTestsByType;
const getAllTests = () => __awaiter(void 0, void 0, void 0, function* () {
    const customTests = yield prisma_1.default.customTest.findMany({
        select: {
            name: true,
            id: true,
            date: true,
            questions: true,
            pastPaper: {
                select: {
                    stream: true,
                    category: true,
                    year: true,
                    affiliation: true,
                }
            }
        }
    });
    if (!customTests || customTests.length === 0)
        return [];
    return customTests;
});
exports.getAllTests = getAllTests;
const getTypesOfTests = () => {
    return global_data_1.typeOfTestsAndDescriptionData.length > 0 ? global_data_1.typeOfTestsAndDescriptionData : [];
};
exports.getTypesOfTests = getTypesOfTests;
const createTestAnalytic = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, customTestId, questionsWithAnswers } = data;
    const newTestAnalytic = yield prisma_1.default.testAnalytic.create({
        data: {
            userId,
            customTestId,
        }
    });
    if (!newTestAnalytic)
        return null;
    // Prepare the array of objects for TestQuestionAnswer creation
    const testQuestionAnswersData = questionsWithAnswers.map((qa) => ({
        testAnalyticId: newTestAnalytic.id,
        questionId: qa.questionId,
        userAnswer: qa.userAnswer
    }));
    // Create many TestQuestionAnswer records
    const newTestQuestionAnswers = yield prisma_1.default.testQuestionAnswer.createMany({
        data: testQuestionAnswersData
    });
    if (!newTestQuestionAnswers)
        return null;
    return newTestAnalytic;
});
exports.createTestAnalytic = createTestAnalytic;
const saveUserScore = (userScoreData) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, customTestId, totalScore } = userScoreData;
    const newUserScore = yield prisma_1.default.userScore.create({
        data: {
            username,
            customTestId,
            totalScore
        },
        select: {
            username: true,
            totalScore: true,
        }
    });
    if (!newUserScore)
        return null;
    return newUserScore;
});
exports.saveUserScore = saveUserScore;
const getDashboardAnalytics = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const currentUser = yield prisma_1.default.user.findUnique({
        where: {
            id: userId
        },
        select: {
            testAnalytics: {
                select: {
                    testQuestionAnswer: {
                        select: {
                            userAnswer: true,
                            question: {
                                select: {
                                    answer: true,
                                    subject: true,
                                }
                            }
                        }
                    },
                    createdAt: true, // Fetching the date when the test was taken
                    customTest: {
                        select: {
                            name: true,
                            id: true, // Including test ID for reference
                        }
                    }
                }
            }
        }
    });
    if (!currentUser) {
        return null; // If no user data is found, return null
    }
    const totalTests = currentUser.testAnalytics.length;
    const totalQuestionsAttempt = (0, tests_methods_1.calculateTotalQuestionsAttempt)(currentUser.testAnalytics);
    const totalCorrectAnswers = (0, tests_methods_1.calculateTotalCorrectAnswers)(currentUser.testAnalytics);
    const totalUnattemptQuestions = (0, tests_methods_1.calculateTotalUnattemptQuestions)(currentUser.testAnalytics);
    const totalIncorrectanswers = totalQuestionsAttempt - (totalCorrectAnswers + totalUnattemptQuestions);
    // const subjectScores = calculateSubjectScores(currentUser.testAnalytics);
    const recentTests = (0, tests_methods_1.generateRecentTests)(currentUser.testAnalytics);
    const averageScorePerTest = (0, tests_methods_1.calculateAverageScorePerTest)(totalCorrectAnswers, totalTests);
    const averageScorePerQuestion = (0, tests_methods_1.calculateAverageScorePerQuestion)(totalCorrectAnswers, totalQuestionsAttempt);
    // Round the averages
    const roundedAverageScorePerTest = Math.round(averageScorePerTest * 100) / 100;
    const roundedAverageScorePerQuestion = Math.round(averageScorePerQuestion * 100) / 100;
    const dailyTestProgressData = (0, tests_methods_1.generateDailyTestProgress)(currentUser.testAnalytics);
    const subjectWiseScoreChartData = (0, tests_methods_1.getSubjectScoresForBarChart)(currentUser.testAnalytics);
    const scoreParametersData = [
        { name: 'correct', value: totalCorrectAnswers, total: totalQuestionsAttempt, fill: `var(--color-correct)` },
        { name: 'incorrect', value: totalIncorrectanswers, total: totalQuestionsAttempt, fill: `var(--color-incorrect)` },
        { name: 'unattempt', value: totalUnattemptQuestions, total: totalQuestionsAttempt, fill: `var(--color-unattempt)` },
    ];
    const analyticData = {
        totalTests,
        totalQuestionsAttempt,
        totalCorrectAnswers,
        totalUnattemptQuestions,
        totalIncorrectanswers,
        scoreParametersData,
        averageScorePerTest: roundedAverageScorePerTest,
        averageScorePerQuestion: roundedAverageScorePerQuestion,
        recentTests,
        dailyTestProgressChartData: dailyTestProgressData,
        subjectWiseScoreChartData
    };
    return analyticData;
});
exports.getDashboardAnalytics = getDashboardAnalytics;
