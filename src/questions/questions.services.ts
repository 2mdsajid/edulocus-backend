import { STREAM_HIERARCHY } from "../utils/global-data";
import { TStream, TStreamHierarchy, TSyllabus } from "../utils/global-types";
import prisma from "../utils/prisma";
import { SYLLABUS } from "../utils/syllabus";
import { doesSubjectExist, getAllSubjects, getAllTopicsBySubject } from "./questions.methods";
import { TAddQuestion, TAddQuestionCount, TBaseOption, TBaseQuestion, TCreatePastQuestion, TQuestion, TReportQuestion, TTotalQuestionsPerSubject, TTotalQuestionsPerSubjectAndChapter } from "./questions.schema";


// add a single question
export const addSingleQuestion = async (questionObject: TAddQuestion, userId: string): Promise<string | null> => {
    const { question, answer, explanation, options, subject, chapter, unit, difficulty, stream } = questionObject;
    const newQuestion = await prisma.question.create({
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
    })
    if (!newQuestion) return null

    const newOption = await prisma.option.create({
        data: {
            ...options,
            questionId: newQuestion.id
        }
    })
    if (!newOption) return null

    // const isAddedByAdmin = ROLES_HIEARCHY.MODERATOR.includes(newQuestion.user.role as string) ? true : false
    const isVerified = await prisma.isVerified.create({
        data: {
            questionId: newQuestion.id,
            state: true,
            by: userId
        }
    })

    await updateQuestionCount({
        stream: newQuestion.stream,
        subject: newQuestion.subject,
        chapter: newQuestion.chapter,
        count: 1
    })

    return newQuestion.id ?? null
}

// check if question is reported
export const checkIfQuestionIsReported = async (questionId: string): Promise<boolean> => {
    const reportedQuestion = await prisma.isReported.findUnique({
        where: { questionId }
    })
    return reportedQuestion ? true : false
}

// report question
export const reportQuestion = async (questionId: string, description: string): Promise<string | null> => {
    const reportedQuestion = await prisma.isReported.create({
        data: {
            questionId,
            state: true,
            message: description
        }
    })
    return reportedQuestion.message
}


// get reported questions
export const getReportedQuestions = async (): Promise<TReportQuestion[]> => {
    const reportedQuestions = await prisma.isReported.findMany({
        select:{
            message:true,
            question: {
                select: {
                    id: true,
                    question: true,
                    subject: true,
                    chapter: true,
                    options: {
                        select:{
                            a:true,
                            b:true,
                            c:true,
                            d:true,
                        }
                    },
                    answer: true,
                    explanation: true,
                    images: {
                        select:{
                            qn:true,
                            a:true,
                            b:true,
                            c:true,
                            d:true,
                            exp:true,
                        }
                    },
                    difficulty: true,
                    unit: true,
                    stream: true,
                }
            }
        }
    });

    if (!reportedQuestions || reportedQuestions.length === 0) {
        return [];
    }

    return reportedQuestions.map(report => ({
        ...report.question,
        message: report.message,
        options: report.question.options || {
            a: '',
            b: '',
            c: '',
            d: ''
        },
        images: report.question.images
    }));
};

//update question
export const updateQuestion = async (questionData: TQuestion): Promise<TQuestion | null> => {
    const { id, question, answer, explanation, subject, chapter, unit, stream, difficulty, options, images } = questionData;

    const updatedQuestion = await prisma.question.update({
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
            options: true,
            images: true
        }
    });

    if (!updatedQuestion) return null;

    if (options) {
        await prisma.option.update({
            where: { questionId: id },
            data: options
        });
    }

    if (images) {
        await prisma.images.update({
            where: { questionId: id },
            data: images
        });
    }

    return {
        ...updatedQuestion,
        options: updatedQuestion.options || {
            a: '',
            b: '',
            c: '',
            d: ''
        },
        images: updatedQuestion.images
    };
};



// add multiple questions from same chapter and subject
export const addMultipleQuestionsForSameSubjectAndChapter = async (
    questions: TAddQuestion[],
    userId: string
): Promise<string[] | null> => {
    if (!questions.length) return null;

    const { subject, chapter, stream } = questions[0];

    const addedQuestionIds: string[] = [];
    for (const questionObject of questions) {
        const { question, answer, explanation, options, difficulty, stream, unit , images} = questionObject;

        const newQuestion = await prisma.question.create({
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

        if (!newQuestion) return null;

        const newOption = await prisma.option.create({
            data: {
                ...options,
                questionId: newQuestion.id,
            },
        });

        if (!newOption) return null;


        if(images){
            const newImages = await prisma.images.create({
                data: {
                    ...images,
                    questionId: newQuestion.id,
                },
            });

            if (!newImages) return null;
        }

        // const isAddedByAdmin = ROLES_HIEARCHY.MODERATOR.includes(newQuestion.user.role as string);

        await prisma.isVerified.create({
            data: {
                questionId: newQuestion.id,
                state: true,
                by: userId,
            },
        });

        addedQuestionIds.push(newQuestion.id);
    }

    await updateQuestionCount({
        stream,
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
        const { question, answer, explanation, options, subject, chapter, difficulty,unit, stream, images } = questionObject;

        const newQuestion = await prisma.question.create({
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

        if (!newQuestion) return null;

        const {a, b, c, d} = options

        const newOption = await prisma.option.create({
            data: {
                a,
                b,
                c,
                d,
                questionId: newQuestion.id,
            },
        });

        if (!newOption) return null;

        if(images){
            const newImages = await prisma.images.create({
                data: {
                    ...images,
                    questionId: newQuestion.id,
                },
            });

            if (!newImages) return null;
        }

        // const isAddedByAdmin = ROLES_HIEARCHY.MODERATOR.includes(newQuestion.user.role as string);

        await prisma.isVerified.create({
            data: {
                questionId: newQuestion.id,
                state: true, //change to isAddedByAdmin when isAddedByAdmin is valid based on your auth or when needed
                by: userId,
            },
        });

        addedQuestionIds.push(newQuestion.id);

        await updateQuestionCount({
            stream: newQuestion.stream,
            subject: newQuestion.subject,
            chapter: newQuestion.chapter,
            count: 1,
        });
    }

    return addedQuestionIds;
};

// to add , update past questions table
export const updateIsPastQuestion = async (isPastQuestionData: TCreatePastQuestion, questionsIds: string[]): Promise<string[] | null> => {
    const { category, affiliation, stream, year } = isPastQuestionData;
    const pastQuestionData = questionsIds.map((questionId) => ({
        stream,
        year,
        affiliation,
        category,
        questionId,
    }));
    const newPastQuestions = await prisma.isPastQuestion.createMany({
        data: pastQuestionData,
        skipDuplicates: true,
    });
    return newPastQuestions.count > 0 ? questionsIds : null;
};


// update the question counts in db for each chapter ans subject
// stream is optional for now but will be required later
// make unique combination of subject and chapter and stream --- which is not present now
export const updateQuestionCount = async (data: TAddQuestionCount) => {
    const { subject, chapter, count, stream } = data
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
                stream: stream
            },
        });
    }
};

// to fetch a certain number of question ids -- esp for creating custom tests
export const getQuestionsIds = async (limit: number, stream: TStream): Promise<string[] | null> => {
    // Validate that limit is a positive integer
    if (!Number.isInteger(limit) || limit <= 0) {
        console.error("Invalid limit:", limit);
        return null;
    }

    const questions = await prisma.question.findManyRandom(limit, {
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
};

// ot Fetch questions by subject with a limit -- esp for subjectwise tests
export const getQuestionsIdsBySubject = async (subject: string, limit: number, stream: TStream): Promise<string[] | null> => {
    const limitValue = limit ?? 10
    const selectedQuestions = await prisma.question.findManyRandom(limitValue, {
        where: {
            subject: subject,
        },
    });
    if (!selectedQuestions || selectedQuestions.length === 0) return null
    return selectedQuestions.map(question => question.id);
};

// to Fetch questions by subject and chapter with a limit -- esp for chapterwise tests
export const getQuestionsIdsBySubjectAndChapter = async (subject: string, chapter: string, limit: number, stream: TStream): Promise<string[] | null> => {
    const limitValue = limit ?? 10
    const selectedQuestions = await prisma.question.findManyRandom(limitValue, {
        where: {
            chapter: chapter,
        },
    });
    if (!selectedQuestions || selectedQuestions.length === 0) return null
    return selectedQuestions.map(question => question.id);
};


// reconside later this -- some buggy code this is
export const getQuestionsBySubject = async (subject: string): Promise<TQuestion[] | null> => {
    const questions = await prisma.question.findManyRandom(25, {
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
            images: {
                select:{
                    qn:true,
                    a:true,
                    b:true,
                    c:true,
                    d:true,
                    exp:true,
                }
            },
            difficulty: true,
            unit: true,
            stream: true,
        }
    });

    const modifiedQuestions = questions.map(question => {
        return {
            ...question,
            options: {
                a: question.options?.a || "",
                b: question.options?.b || "",
                c: question.options?.c || "",
                d: question.options?.d || "",
            }
        }
    });

    if (!modifiedQuestions || modifiedQuestions.length === 0) return null
    return modifiedQuestions 
}

// get total questions count
export const getTotalQuestionsCount = async (): Promise<number | null> => {
    const totalQuestions = await prisma.question.count()
    return totalQuestions ?? null
};

// get syllabus
export const getSyllabus = async (stream: TStream): Promise<TSyllabus | null> => {
    return SYLLABUS[stream] ?? null
};

// get sream hierarchy
export const getStreamHierarchy = async (): Promise<TStreamHierarchy[] | null> => {
    return STREAM_HIERARCHY ?? null
};

// if subject exist
export const isSubjectInTheStream = async (stream: TStream, subject: string): Promise<boolean> => {
    return doesSubjectExist(SYLLABUS, stream, subject);
};


// get Subjects
export const getSubjects = async (stream: TStream): Promise<string[] | null> => {
    return getAllSubjects(SYLLABUS, stream) ?? null
};





// get chapters of a subject
export const getChaptersBySubject = async (stream:TStream, subject:string) : Promise<string[] | null> =>{
    return getAllTopicsBySubject(SYLLABUS,stream, subject )
}

// get count of questions in each subject -- exp for subject wise test models
export const getTotalQuestionsPerSubject = async (stream: TStream): Promise<TTotalQuestionsPerSubject[] | null> => {
    const questionCounts = await prisma.questionCount.findMany({
        where: {
            stream: stream
        }
    }); // Retrieve all records
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

// get count of questions in each chapter and its subject -- exp for showing chapter wise tests models
export const getTotalQuestionsPerSubjectAndChapter = async (stream: TStream): Promise<TTotalQuestionsPerSubjectAndChapter | null> => {
    const questionCounts = await prisma.questionCount.findMany({
        where: {
            stream: stream
        }
    });
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




// a function that will read all the questions and options associated with them in the database and then return them
export const getAllQuestions = async (): Promise<any> => {
    const questions = await prisma.question.findMany({
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
    return null
    return questions;
};
