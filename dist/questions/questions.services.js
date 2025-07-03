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
exports.bulkUpdateCorrectedQuestions = exports.getAllQuestions = exports.getTotalQuestionsPerSubjectAndChapter = exports.getTotalQuestionsPerSubject = exports.getChaptersBySubject = exports.getSubjects = exports.isSubjectInTheStream = exports.getStreamHierarchy = exports.getSyllabus = exports.getTotalQuestionsCount = exports.getQuestionsIdsBySubjectAndChapter = exports.getCompleteQuestionsBySubject = exports.getQuestionsIdsBySubject = exports.getQuestionsIds = exports.updateIsPastQuestion = exports.addMultipleQuestionsForDifferentSubjectAndChapter = exports.addMultipleQuestionsForSameSubjectAndChapter = exports.removeReportedQuestions = exports.updateQuestion = exports.getReportedQuestions = exports.reportQuestion = exports.checkIfQuestionIsReported = exports.addSingleQuestion = void 0;
const global_data_1 = require("../utils/global-data");
const prisma_1 = __importDefault(require("../utils/prisma"));
const syllabus_1 = require("../utils/syllabus");
const questions_methods_1 = require("./questions.methods");
// add a single question 
const addSingleQuestion = (questionObject, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { question, answer, explanation, options, subject, chapter, unit, difficulty, stream, videoUrl, images } = questionObject;
    // Check if the subject exists, create if not
    let subjectRecord = yield prisma_1.default.subject.findUnique({
        where: { name: subject, stream },
        select: { id: true }
    });
    if (!subjectRecord) {
        subjectRecord = yield prisma_1.default.subject.create({
            data: { name: subject, stream },
            select: { id: true }
        });
    }
    // Check if the chapter exists for the subject, create if not
    let chapterRecord = yield prisma_1.default.chapter.findUnique({
        where: {
            subjectId_name: {
                name: chapter,
                subjectId: subjectRecord.id
            }
        },
        select: { id: true }
    });
    if (!chapterRecord) {
        chapterRecord = yield prisma_1.default.chapter.create({
            data: { name: chapter, subjectId: subjectRecord.id },
            select: { id: true }
        });
    }
    const newQuestion = yield prisma_1.default.question.create({
        data: {
            question,
            answer,
            subject: subject,
            chapter: chapter,
            unit: unit || "",
            stream,
            explanation,
            difficulty,
            subjectId: subjectRecord.id,
            chapterId: chapterRecord.id
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
    // Handle images if they exist and have valid URLs
    if (images) {
        const { a, b, c, d, qn, exp } = images;
        const hasValidImage = [a, b, c, d, qn, exp].some(url => url && url.trim() !== '');
        if (hasValidImage) {
            yield prisma_1.default.images.create({
                data: {
                    questionId: newQuestion.id,
                    a: a && a.trim() !== '' ? a : null,
                    b: b && b.trim() !== '' ? b : null,
                    c: c && c.trim() !== '' ? c : null,
                    d: d && d.trim() !== '' ? d : null,
                    qn: qn && qn.trim() !== '' ? qn : null,
                    exp: exp && exp.trim() !== '' ? exp : null
                }
            });
        }
    }
    if (videoUrl) {
        const existingVideo = yield prisma_1.default.questionVideo.findUnique({
            where: { questionId: newQuestion.id }
        });
        if (existingVideo) {
            yield prisma_1.default.questionVideo.update({
                where: { questionId: newQuestion.id },
                data: { url: videoUrl }
            });
        }
        else {
            yield prisma_1.default.questionVideo.create({
                data: {
                    questionId: newQuestion.id,
                    url: videoUrl
                }
            });
        }
    }
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
// get reported questions
const getReportedQuestions = () => __awaiter(void 0, void 0, void 0, function* () {
    const reportedQuestions = yield prisma_1.default.isReported.findMany({
        select: {
            message: true,
            question: {
                select: {
                    id: true,
                    question: true,
                    subject: true,
                    chapter: true,
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
                    images: {
                        select: {
                            qn: true,
                            a: true,
                            b: true,
                            c: true,
                            d: true,
                            exp: true,
                        }
                    },
                    difficulty: true,
                    unit: true,
                    stream: true,
                    IsPast: true,
                    subjectId: true,
                    chapterId: true,
                }
            }
        }
    });
    if (!reportedQuestions || reportedQuestions.length === 0) {
        return [];
    }
    return reportedQuestions.map(report => (Object.assign(Object.assign({}, report.question), { message: report.message, options: report.question.options || {
            a: '',
            b: '',
            c: '',
            d: ''
        }, images: report.question.images })));
});
exports.getReportedQuestions = getReportedQuestions;
// just putting any coz sometimes there may be no chapter in the question
const updateQuestion = (questionData) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, question, answer, explanation, subject, chapter, unit, stream, difficulty, options, images } = questionData;
    const updatedQuestion = yield prisma_1.default.question.update({
        where: { id },
        data: {
            question,
            answer,
            explanation,
            subject,
            chapter,
            unit,
            stream,
            difficulty,
        },
        include: {
            options: {
                select: {
                    a: true,
                    b: true,
                    c: true,
                    d: true,
                }
            },
            images: true,
            IsPast: true,
        }
    });
    if (!updatedQuestion)
        return null;
    if (options) {
        yield prisma_1.default.option.update({
            where: { questionId: id },
            data: options
        });
    }
    if (images) {
        yield prisma_1.default.images.update({
            where: { questionId: id },
            data: images
        });
    }
    // await prisma.isReported.delete({
    //     where: { questionId: id }
    // })
    return Object.assign(Object.assign({}, updatedQuestion), { options: updatedQuestion.options || {
            a: '',
            b: '',
            c: '',
            d: ''
        }, images: updatedQuestion.images });
});
exports.updateQuestion = updateQuestion;
// this will remove questions from the report page
const removeReportedQuestions = (questionId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma_1.default.isReported.delete({
            where: { questionId }
        });
        return true;
    }
    catch (error) {
        console.error("Error removing reported question:", error);
        return false;
    }
});
exports.removeReportedQuestions = removeReportedQuestions;
// add multiple questions from same chapter and subject
const addMultipleQuestionsForSameSubjectAndChapter = (questions, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!questions.length)
        return null;
    const { subject, chapter, stream } = questions[0];
    // Check if the subject exists, create if not
    let subjectRecord = yield prisma_1.default.subject.findUnique({
        where: { name: subject, stream },
        select: { id: true }
    });
    if (!subjectRecord) {
        subjectRecord = yield prisma_1.default.subject.create({
            data: { name: subject, stream },
            select: { id: true }
        });
    }
    // Check if the chapter exists for the subject, create if not
    let chapterRecord = yield prisma_1.default.chapter.findUnique({
        where: {
            subjectId_name: {
                name: chapter,
                subjectId: subjectRecord.id
            }
        },
        select: { id: true }
    });
    if (!chapterRecord) {
        chapterRecord = yield prisma_1.default.chapter.create({
            data: { name: chapter, subjectId: subjectRecord.id },
            select: { id: true }
        });
    }
    const addedQuestionIds = [];
    for (const questionObject of questions) {
        const { question, answer, explanation, options, difficulty, stream, unit, images } = questionObject;
        const newQuestion = yield prisma_1.default.question.create({
            data: {
                question,
                answer,
                subject: subject,
                chapter: chapter,
                unit: unit || "",
                stream,
                explanation,
                difficulty,
                subjectId: subjectRecord.id,
                chapterId: chapterRecord.id
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
    return addedQuestionIds;
});
exports.addMultipleQuestionsForSameSubjectAndChapter = addMultipleQuestionsForSameSubjectAndChapter;
// add multiple questions from different chapter and subject
const addMultipleQuestionsForDifferentSubjectAndChapter = (questions, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!questions.length)
        return null;
    const addedQuestionIds = [];
    for (const questionObject of questions) {
        const { question, answer, explanation, options, subject, chapter, unit, difficulty, stream, images } = questionObject;
        // Check if the subject exists, create if not
        let subjectRecord = yield prisma_1.default.subject.findUnique({
            where: { name: subject, stream },
            select: { id: true }
        });
        if (!subjectRecord) {
            subjectRecord = yield prisma_1.default.subject.create({
                data: { name: subject, stream },
                select: { id: true }
            });
        }
        // Check if the chapter exists for the subject, create if not
        let chapterRecord = yield prisma_1.default.chapter.findUnique({
            where: {
                subjectId_name: {
                    name: chapter,
                    subjectId: subjectRecord.id
                }
            },
            select: { id: true }
        });
        if (!chapterRecord) {
            chapterRecord = yield prisma_1.default.chapter.create({
                data: { name: chapter, subjectId: subjectRecord.id },
                select: { id: true }
            });
        }
        const newQuestion = yield prisma_1.default.question.create({
            data: {
                question,
                answer,
                subject: subject,
                chapter: chapter,
                unit: unit || "",
                stream,
                explanation,
                difficulty,
                subjectId: subjectRecord.id,
                chapterId: chapterRecord.id
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
            const { a, b, c, d, qn, exp } = images;
            const hasValidImage = [a, b, c, d, qn, exp].some(url => url && url.trim() !== '');
            if (hasValidImage) {
                yield prisma_1.default.images.create({
                    data: {
                        questionId: newQuestion.id,
                        a: a && a.trim() !== '' ? a : null,
                        b: b && b.trim() !== '' ? b : null,
                        c: c && c.trim() !== '' ? c : null,
                        d: d && d.trim() !== '' ? d : null,
                        qn: qn && qn.trim() !== '' ? qn : null,
                        exp: exp && exp.trim() !== '' ? exp : null
                    }
                });
            }
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
// to fetch a certain number of random question ids -- esp for creating custom tests
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
//  Fetch questions by subject with a limit -- esp for subjectwise tests
const getQuestionsIdsBySubject = (subject, limit, stream) => __awaiter(void 0, void 0, void 0, function* () {
    const limitValue = limit !== null && limit !== void 0 ? limit : 10;
    // Find the subject ID based on the subject name and stream
    const subjectRecord = yield prisma_1.default.subject.findUnique({
        where: { name: subject, stream },
        select: { id: true }
    });
    if (!subjectRecord) {
        console.warn(`Subject "${subject}" not found for stream "${stream}".`);
        return null;
    }
    const selectedQuestions = yield prisma_1.default.question.findManyRandom(limitValue, {
        where: {
            subjectId: subjectRecord.id,
        },
        select: { id: true }
    });
    if (!selectedQuestions || selectedQuestions.length === 0)
        return null;
    return selectedQuestions.map(question => question.id);
});
exports.getQuestionsIdsBySubject = getQuestionsIdsBySubject;
// complete question sby subject
const getCompleteQuestionsBySubject = (subject, limit, stream) => __awaiter(void 0, void 0, void 0, function* () {
    const limitValue = limit !== null && limit !== void 0 ? limit : 10;
    // Find the subject ID based on the subject name and stream
    const subjectRecord = yield prisma_1.default.subject.findUnique({
        where: { name: subject, stream },
        select: { id: true, }
    });
    if (!subjectRecord) {
        console.warn(`Subject "${subject}" not found for stream "${stream}".`);
        return null;
    }
    const selectedQuestions = yield prisma_1.default.question.findManyRandom(limitValue, {
        where: {
            subjectId: subjectRecord.id,
        },
        select: {
            id: true,
            question: true,
            answer: true,
            explanation: true,
            subject: true,
            chapter: true,
            unit: true,
            images: true,
            stream: true,
            subjectId: true,
            chapterId: true,
            difficulty: true,
            IsPast: true,
            options: {
                select: {
                    a: true, b: true, c: true, d: true,
                },
            }
        }
    });
    if (!selectedQuestions || selectedQuestions.length === 0)
        return null;
    return selectedQuestions;
});
exports.getCompleteQuestionsBySubject = getCompleteQuestionsBySubject;
// to Fetch questions by subject and chapter with a limit -- esp for chapterwise tests
const getQuestionsIdsBySubjectAndChapter = (subject, chapter, limit, stream) => __awaiter(void 0, void 0, void 0, function* () {
    const limitValue = limit !== null && limit !== void 0 ? limit : 10;
    // Find the subject ID based on the subject name and stream
    const subjectRecord = yield prisma_1.default.subject.findUnique({
        where: { name: subject, stream },
        select: { id: true }
    });
    if (!subjectRecord) {
        console.warn(`Subject "${subject}" not found for stream "${stream}".`);
        return null;
    }
    // Find the chapter ID based on the chapter name and subjectId
    const chapterRecord = yield prisma_1.default.chapter.findUnique({
        where: {
            subjectId_name: {
                name: chapter,
                subjectId: subjectRecord.id
            }
        },
        select: { id: true }
    });
    if (!chapterRecord) {
        console.warn(`Chapter "${chapter}" not found for subject "${subject}" and stream "${stream}".`);
        return null;
    }
    const selectedQuestions = yield prisma_1.default.question.findManyRandom(limitValue, {
        where: {
            subjectId: subjectRecord.id,
            chapterId: chapterRecord.id,
        },
        select: { id: true }
    });
    if (!selectedQuestions || selectedQuestions.length === 0)
        return null;
    return selectedQuestions.map(question => question.id);
});
exports.getQuestionsIdsBySubjectAndChapter = getQuestionsIdsBySubjectAndChapter;
// get total questions count
const getTotalQuestionsCount = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalQuestions = yield prisma_1.default.question.count();
    return totalQuestions !== null && totalQuestions !== void 0 ? totalQuestions : null;
});
exports.getTotalQuestionsCount = getTotalQuestionsCount;
// get syllabus from the main syllabus
const getSyllabus = (stream) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    return (_a = syllabus_1.SYLLABUS[stream]) !== null && _a !== void 0 ? _a : null;
});
exports.getSyllabus = getSyllabus;
// get sream hierarchy from the main syllabus
const getStreamHierarchy = () => __awaiter(void 0, void 0, void 0, function* () {
    return global_data_1.STREAM_HIERARCHY !== null && global_data_1.STREAM_HIERARCHY !== void 0 ? global_data_1.STREAM_HIERARCHY : null;
});
exports.getStreamHierarchy = getStreamHierarchy;
// if subject exist from the main syllabus
const isSubjectInTheStream = (stream, subject) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, questions_methods_1.doesSubjectExist)(syllabus_1.SYLLABUS, stream, subject);
});
exports.isSubjectInTheStream = isSubjectInTheStream;
// get Subjects from the main syllabus
const getSubjects = (stream) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    return (_a = (0, questions_methods_1.getAllSubjects)(syllabus_1.SYLLABUS, stream)) !== null && _a !== void 0 ? _a : null;
});
exports.getSubjects = getSubjects;
// get chapters of a subject from the main syllabus
const getChaptersBySubject = (stream, subject) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, questions_methods_1.getAllTopicsBySubject)(syllabus_1.SYLLABUS, stream, subject);
});
exports.getChaptersBySubject = getChaptersBySubject;
// get count of questions in each subject from database
const getTotalQuestionsPerSubject = (stream) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subjects = yield prisma_1.default.subject.findMany({
            where: {
                stream: stream
            },
            select: {
                name: true,
                _count: {
                    select: {
                        questions: true
                    }
                }
            }
        });
        const result = subjects.map(subject => ({
            subject: subject.name,
            count: subject._count.questions
        })).sort((a, b) => b.count - a.count);
        return result;
    }
    catch (error) {
        console.error("Error fetching total questions per subject:", error);
        return null;
    }
});
exports.getTotalQuestionsPerSubject = getTotalQuestionsPerSubject;
// get count of questions in each chapter and its subject from databse
const getTotalQuestionsPerSubjectAndChapter = (stream) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allSubjects = yield prisma_1.default.subject.findMany({
            where: { stream: stream },
            select: {
                name: true,
                chapters: {
                    select: {
                        name: true,
                        _count: {
                            select: {
                                questions: true
                            }
                        }
                    },
                    orderBy: {
                        questions: {
                            _count: 'desc'
                        }
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });
        const result = {};
        allSubjects.forEach(subject => {
            result[subject.name] = {};
            subject.chapters.forEach(chapter => {
                result[subject.name][chapter.name] = chapter._count.questions;
            });
        });
        return result;
    }
    catch (error) {
        console.error('Error fetching all subjects and chapters with counts:', error);
        return null;
    }
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
// bulk update the questions ---- not needed now
const bulkUpdateCorrectedQuestions = (questions) => __awaiter(void 0, void 0, void 0, function* () {
    // Create an array of all the update promises we need to run.
    const updateOperations = questions.flatMap(q => [
        // Promise to update the main Question table
        prisma_1.default.question.update({
            where: { id: q.id },
            data: {
                question: q.question,
                answer: q.answer,
                explanation: q.explanation,
            },
        }),
        // Promise to update the related Option table
        prisma_1.default.option.update({
            where: { questionId: q.id },
            data: {
                a: q.options.a,
                b: q.options.b,
                c: q.options.c,
                d: q.options.d,
            },
        }),
    ]);
    // Execute all update operations within a single transaction for safety and performance.
    // If any single update fails, the entire transaction is rolled back.
    const result = yield prisma_1.default.$transaction(updateOperations);
    // The result of a transaction is an array of the results of each operation.
    // We count the successful question updates by dividing the total successful operations by 2.
    return { count: result.length / 2 };
});
exports.bulkUpdateCorrectedQuestions = bulkUpdateCorrectedQuestions;
// // get questions from a specific chapter from database -- same as above actually
// export const getQuestionsByChapter = async (stream: TStream, chapter: string, subject: string): Promise<TQuestionSchema[] | null> => {
//     try {
//         // First find the subject to get its ID
//         const subjectRecord = await prisma.subject.findFirst({
//             where: {
//                 stream: stream,
//                 name: subject
//             },
//             select: {
//                 id: true
//             }
//         });
//         if (!subjectRecord) return null;
//         // Now find the chapter using the subject ID
//         const chapterRecord = await prisma.chapter.findUnique({
//             where: {
//                 subjectId_name: {
//                     subjectId: subjectRecord.id,
//                     name: chapter
//                 }
//             },
//             select: {
//                 questions: {
//                     select: {
//                         id: true,
//                         question: true,
//                         subject: true,
//                         chapter: true,
//                         options: {
//                             select: {
//                                 a: true,
//                                 b: true,
//                                 c: true,
//                                 d: true,
//                             }
//                         },
//                         answer: true,
//                         explanation: true,
//                         difficulty: true,
//                         unit: true,
//                         stream: true,
//                         IsPast: true,
//                         subjectId: true,
//                         chapterId: true,
//                         images: {
//                             select: {
//                                 a: true,
//                                 b: true,
//                                 c: true,
//                                 d: true,
//                             }
//                         },
//                     }
//                 }
//             }
//         });
//         if (!chapterRecord) return null;
//         return chapterRecord.questions as TQuestionSchema[];
//     } catch (error) {
//         console.error('Error fetching questions by chapter:', error);
//         return null;
//     }
// };
// // //////////// do consider removing it
