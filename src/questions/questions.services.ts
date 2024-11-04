import { ROLES_HIEARCHY } from "../users/users.schema";
import { PG_SYLLABUS } from "../utils/global-data";
import { TPGSyllabus } from "../utils/global-types";
import prisma from "../utils/prisma";
import { getAllSubjects } from "./questions.methods";
import { TAddQuestion, TAddQuestionCount, TTotalQuestionsPerSubject, TTotalQuestionsPerSubjectAndChapter } from "./questions.schema";



export const addSingleQuestion = async (questionObject: TAddQuestion, userId: string): Promise<string | null> => {
    const { question, answer, explanation, options, subject, chapter, unit, difficulty, } = questionObject;
    const newQuestion = await prisma.question.create({
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
    })
    if (!newQuestion) return null

    const newOption = await prisma.option.create({
        data: {
            ...options,
            questionId: newQuestion.id
        }
    })
    if (!newOption) return null

    const isAddedByAdmin = ROLES_HIEARCHY.MODERATOR.includes(newQuestion.user.role as string) ? true : false
    const isVerified = await prisma.isVerified.create({
        data: {
            questionId: newQuestion.id,
            state: isAddedByAdmin,
            by: userId
        }
    })

    await updateQuestionCount({
        subject: newQuestion.subject,
        chapter: newQuestion.chapter,
        count: 1
    })

    return newQuestion.id ?? null
}

// add multiple questions from same chapter and subject
export const addMultipleQuestionsForSameSubjectAndChapter = async (
    questions: TAddQuestion[],
    userId: string
): Promise<string[] | null> => {
    if (!questions.length) return null;

    const { subject, chapter } = questions[0];
    const addedQuestionIds: string[] = [];
    for (const questionObject of questions) {
        const { question, answer, explanation, options, difficulty } = questionObject;

        const newQuestion = await prisma.question.create({
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

        if (!newQuestion) return null;

        const newOption = await prisma.option.create({
            data: {
                ...options,
                questionId: newQuestion.id,
            },
        });

        if (!newOption) return null;

        const isAddedByAdmin = ROLES_HIEARCHY.MODERATOR.includes(newQuestion.user.role as string);

        await prisma.isVerified.create({
            data: {
                questionId: newQuestion.id,
                state: isAddedByAdmin,
                by: userId,
            },
        });

        addedQuestionIds.push(newQuestion.id);
    }

    await updateQuestionCount({
        subject,
        chapter,
        count: questions.length,
    });

    return addedQuestionIds;
};


// add multiple questions from different chapter and subject
export const addMultipleQuestionsForDifferentSubjectAndChapter = async (
    questions: TAddQuestion[],
    userId: string
): Promise<string[] | null> => {
    if (!questions.length) return null;

    const addedQuestionIds: string[] = [];

    for (const questionObject of questions) {
        const { question, answer, explanation, options, subject, chapter, difficulty } = questionObject;

        const newQuestion = await prisma.question.create({
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

        if (!newQuestion) return null;

        const newOption = await prisma.option.create({
            data: {
                ...options,
                questionId: newQuestion.id,
            },
        });

        if (!newOption) return null;

        const isAddedByAdmin = ROLES_HIEARCHY.MODERATOR.includes(newQuestion.user.role as string);

        await prisma.isVerified.create({
            data: {
                questionId: newQuestion.id,
                state: isAddedByAdmin,
                by: userId,
            },
        });

        addedQuestionIds.push(newQuestion.id);

        await updateQuestionCount({
            subject: newQuestion.subject,
            chapter: newQuestion.chapter,
            count: 1,
        });
    }

    return addedQuestionIds;
};


export const getQuestionsIds = async (limit: number): Promise<string[] | null> => {
    // Validate that limit is a positive integer
    if (!Number.isInteger(limit) || limit <= 0) {
        console.error("Invalid limit:", limit);
        return null;
    }

    const questions = await prisma.question.findManyRandom(limit, {
        select: { id: true }
    });

    // Map IDs and check if array is empty
    const questionIds = questions.map(question => question.id);
    if (questionIds.length === 0) {
        console.warn("No questions found.");
        return null;
    }

    return questionIds;
};


// update the question counts in db for each chapter ans subject
export const updateQuestionCount = async (data: TAddQuestionCount) => {
    const { subject, chapter, count } = data
    const existingCount = await prisma.questionCount.findUnique({
        where: {
            subject_chapter: { subject, chapter }, // Check unique combination
        },
    });

    if (existingCount) {
        await prisma.questionCount.update({
            where: {
                subject_chapter: { subject, chapter },
            },
            data: {
                count: existingCount.count + count,
            }
        })
    } else {
        await prisma.questionCount.create({
            data: {
                subject,
                chapter,
                count: count,
            },
        });
    }
};


export const getTotalQuestionsPerSubject = async (): Promise<TTotalQuestionsPerSubject[] | null> => {
    const questionCounts = await prisma.questionCount.findMany(); // Retrieve all records
    const totalQuestionsPerSubject: { [subject: string]: number } = {}; // Object to store counts per subject

    questionCounts.forEach((record) => {
        const { subject, count } = record;
        if (totalQuestionsPerSubject[subject]) {
            totalQuestionsPerSubject[subject] += count;
        } else {
            totalQuestionsPerSubject[subject] = count;
        }
    });

    const result: TTotalQuestionsPerSubject[] = Object.entries(totalQuestionsPerSubject)
        .map(([subject, count]) => ({ subject, count }))
        .sort((a, b) => b.count - a.count); // Sort in descending order based on count

    return result;
};


export const getTotalQuestionsPerSubjectAndChapter = async (): Promise<TTotalQuestionsPerSubjectAndChapter | null> => {
    const questionCounts = await prisma.questionCount.findMany();
    const totalQuestionsPerSubjectAndChapter: { [subject: string]: { [chapter: string]: number } } = {};

    questionCounts.forEach((record) => {
        const { subject, chapter, count } = record;

        if (!totalQuestionsPerSubjectAndChapter[subject]) {
            totalQuestionsPerSubjectAndChapter[subject] = {};
        }

        if (totalQuestionsPerSubjectAndChapter[subject][chapter]) {
            totalQuestionsPerSubjectAndChapter[subject][chapter] += count;
        } else {
            totalQuestionsPerSubjectAndChapter[subject][chapter] = count;
        }
    });

    // Sort chapters by count in descending order within each subject while maintaining the nested object structure
    const result: TTotalQuestionsPerSubjectAndChapter = Object.fromEntries(
        Object.entries(totalQuestionsPerSubjectAndChapter).map(([subject, chapters]) => [
            subject,
            Object.fromEntries(
                Object.entries(chapters)
                    .sort(([, countA], [, countB]) => countB - countA) // Sort by count in descending order
            ),
        ])
    );

    return result;
};




// Fetch questions by subject with a limit
export const getQuestionsBySubject = async (subject: string, limit: boolean): Promise<string[] | null> => {
    const limitValue = limit ? 10 : 50
    const selectedQuestions = await prisma.question.findManyRandom(limitValue, {
        where: {
            subject: subject,
        },
    });
    if (!selectedQuestions || selectedQuestions.length === 0) return null
    return selectedQuestions.map(question => question.id);
};

// Fetch questions by subject and chapter with a limit
export const getQuestionsBySubjectAndChapter = async (subject: string, chapter: string, limit: boolean): Promise<string[] | null> => {
    const limitValue = limit ? 10 : 50
    const selectedQuestions = await prisma.question.findManyRandom(limitValue, {
        where: {
            subject: subject,
            chapter: chapter,
        },
    });
    if (!selectedQuestions || selectedQuestions.length === 0) return null
    return selectedQuestions.map(question => question.id);
};

// get syllabus
export const getSyllabus = async (): Promise<TPGSyllabus | null> => {
    return PG_SYLLABUS ?? null
};

// get Subjects
export const getSubjects = async (): Promise<string[] | null> => {
    return getAllSubjects(PG_SYLLABUS) ?? null
};

