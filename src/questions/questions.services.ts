import { STREAM_HIERARCHY } from "../utils/global-data";
import { TStream, TStreamHierarchy, TSyllabus } from "../utils/global-types";
import prisma from "../utils/prisma";
import { SYLLABUS } from "../utils/syllabus";
import { doesSubjectExist, getAllSubjects, getAllTopicsBySubject } from "./questions.methods";
import { TAddQuestionSchema, TAllSubjectsAndChaptersWithCounts, TChapterWithQuestionCountSchema, TCorrectedQuestionSchema, TCreatePastQuestionSchema, TQuestionSchema, TReportQuestionSchema, TTotalQuestionsPerSubjectAndChapterSchema, TTotalQuestionsPerSubjectSchema } from "./questions.schema";


// add a single question 
export const addSingleQuestion = async (questionObject: TAddQuestionSchema, userId: string): Promise<string | null> => {
    const { question, answer, explanation, options, subject, chapter, unit, difficulty, stream, videoUrl, images } = questionObject;

    // Check if the subject exists, create if not
    let subjectRecord = await prisma.subject.findUnique({
        where: { name: subject, stream },
        select: { id: true }
    });

    if (!subjectRecord) {
        subjectRecord = await prisma.subject.create({
            data: { name: subject, stream },
            select: { id: true }
        });
    }

    // Check if the chapter exists for the subject, create if not
    let chapterRecord = await prisma.chapter.findUnique({
        where: {
            subjectId_name: {
                name: chapter, 
                subjectId: subjectRecord.id
            }
        },
        select: { id: true }
    });

    if (!chapterRecord) {
        chapterRecord = await prisma.chapter.create({
            data: { name: chapter, subjectId: subjectRecord.id },
            select: { id: true }
        });
    }

    const newQuestion = await prisma.question.create({
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

    // Handle images if they exist and have valid URLs
    if (images) {
        const { a, b, c, d, qn, exp } = images;
        const hasValidImage = [a, b, c, d, qn, exp].some(url => url && url.trim() !== '');

        if (hasValidImage) {
            await prisma.images.create({
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
        const existingVideo = await prisma.questionVideo.findUnique({
            where: { questionId: newQuestion.id }
        });

        if (existingVideo) {
            await prisma.questionVideo.update({
                where: { questionId: newQuestion.id },
                data: { url: videoUrl }
            });
        } else {
            await prisma.questionVideo.create({
                data: {
                    questionId: newQuestion.id,
                    url: videoUrl
                }
            });
        }
    }

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
export const getReportedQuestions = async (): Promise<TReportQuestionSchema[]> => {
    const reportedQuestions = await prisma.isReported.findMany({
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

// just putting any coz sometimes there may be no chapter in the question
export const updateQuestion = async (questionData: any): Promise<TQuestionSchema | null> => {
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

    // await prisma.isReported.delete({
    //     where: { questionId: id }
    // })

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

// this will remove questions from the report page
export const removeReportedQuestions = async (questionId: string): Promise<boolean> => {
    try {
        await prisma.isReported.delete({
            where: { questionId }
        });
        return true;
    } catch (error) {
        console.error("Error removing reported question:", error);
        return false;
    }
};





// add multiple questions from same chapter and subject
export const addMultipleQuestionsForSameSubjectAndChapter = async (
    questions: TAddQuestionSchema[],
    userId: string
): Promise<string[] | null> => {
    if (!questions.length) return null;

    const { subject, chapter, stream } = questions[0];

     // Check if the subject exists, create if not
     let subjectRecord = await prisma.subject.findUnique({
        where: { name: subject, stream },
        select: { id: true }
    });

    if (!subjectRecord) {
        subjectRecord = await prisma.subject.create({
            data: { name: subject, stream },
            select: { id: true }
        });
    }

    // Check if the chapter exists for the subject, create if not
    let chapterRecord = await prisma.chapter.findUnique({
        where: {
            subjectId_name: {
                name: chapter, 
                subjectId: subjectRecord.id
            }
        },
        select: { id: true }
    });

    if (!chapterRecord) {
        chapterRecord = await prisma.chapter.create({
            data: { name: chapter, subjectId: subjectRecord.id },
            select: { id: true }
        });
    }

    const addedQuestionIds: string[] = [];
    for (const questionObject of questions) {
        const { question, answer, explanation, options, difficulty, stream, unit, images } = questionObject;

        const newQuestion = await prisma.question.create({
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

        if (!newQuestion) return null;

        const newOption = await prisma.option.create({
            data: {
                ...options,
                questionId: newQuestion.id,
            },
        });

        if (!newOption) return null;


        if (images) {
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


    return addedQuestionIds;
};



// add multiple questions from different chapter and subject
export const addMultipleQuestionsForDifferentSubjectAndChapter = async (
    questions: TAddQuestionSchema[],
    userId: string
): Promise<string[] | null> => {
    if (!questions.length) return null;

    const addedQuestionIds: string[] = [];

    for (const questionObject of questions) {
        const { question, answer, explanation, options, subject, chapter, unit, difficulty, stream, images } = questionObject;

        // Check if the subject exists, create if not
        let subjectRecord = await prisma.subject.findUnique({
            where: { name: subject, stream },
            select: { id: true }
        });

        if (!subjectRecord) {
            subjectRecord = await prisma.subject.create({
                data: { name: subject, stream },
                select: { id: true }
            });
        }

        // Check if the chapter exists for the subject, create if not
        let chapterRecord = await prisma.chapter.findUnique({
            where: {
                subjectId_name: {
                    name: chapter,
                    subjectId: subjectRecord.id
                }
            },
            select: { id: true }
        });

        if (!chapterRecord) {
            chapterRecord = await prisma.chapter.create({
                data: { name: chapter, subjectId: subjectRecord.id },
                select: { id: true }
            });
        }


        const newQuestion = await prisma.question.create({
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

        if (!newQuestion) return null;

        const newOption = await prisma.option.create({
            data: {
                ...options,
                questionId: newQuestion.id,
            },
        });

        if (!newOption) return null;

        if (images) {
            const { a, b, c, d, qn, exp } = images;
            const hasValidImage = [a, b, c, d, qn, exp].some(url => url && url.trim() !== '');

            if (hasValidImage) {
                await prisma.images.create({
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

        await prisma.isVerified.create({
            data: {
                questionId: newQuestion.id,
                state: true, //change to isAddedByAdmin when isAddedByAdmin is valid based on your auth or when needed
                by: userId,
            },
        });

        addedQuestionIds.push(newQuestion.id);
    }

    return addedQuestionIds;
};



// to add , update past questions table
export const updateIsPastQuestion = async (isPastQuestionData: TCreatePastQuestionSchema, questionsIds: string[]): Promise<string[] | null> => {
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


// to fetch a certain number of random question ids -- esp for creating custom tests
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

//  Fetch questions by subject with a limit -- esp for subjectwise tests
export const getQuestionsIdsBySubject = async (subject: string, limit: number, stream: TStream): Promise<string[] | null> => {
    const limitValue = limit ?? 10;

    // Find the subject ID based on the subject name and stream
    const subjectRecord = await prisma.subject.findUnique({
        where: { name: subject, stream },
        select: { id: true }
    });

    if (!subjectRecord) {
        console.warn(`Subject "${subject}" not found for stream "${stream}".`);
        return null;
    }

    const selectedQuestions = await prisma.question.findManyRandom(limitValue, {
        where: {
            subjectId: subjectRecord.id,
        },
        select: { id: true }
    });

    if (!selectedQuestions || selectedQuestions.length === 0) return null;
    return selectedQuestions.map(question => question.id);
};



// to Fetch questions by subject and chapter with a limit -- esp for chapterwise tests
export const getQuestionsIdsBySubjectAndChapter = async (subject: string, chapter: string, limit: number, stream: TStream): Promise<string[] | null> => {
    const limitValue = limit ?? 10;

     // Find the subject ID based on the subject name and stream
     const subjectRecord = await prisma.subject.findUnique({
        where: { name: subject, stream },
        select: { id: true }
    });

    if (!subjectRecord) {
        console.warn(`Subject "${subject}" not found for stream "${stream}".`);
        return null;
    }

    // Find the chapter ID based on the chapter name and subjectId
    const chapterRecord = await prisma.chapter.findUnique({
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


    const selectedQuestions = await prisma.question.findManyRandom(limitValue, {
        where: {
            subjectId: subjectRecord.id,
            chapterId: chapterRecord.id,
        },
        select: { id: true }
    });

    if (!selectedQuestions || selectedQuestions.length === 0) return null;
    return selectedQuestions.map(question => question.id);
};





// get total questions count
export const getTotalQuestionsCount = async (): Promise<number | null> => {
    const totalQuestions = await prisma.question.count()
    return totalQuestions ?? null
};


// get syllabus from the main syllabus
export const getSyllabus = async (stream: TStream): Promise<TSyllabus | null> => {
    return SYLLABUS[stream] ?? null
};

// get sream hierarchy from the main syllabus
export const getStreamHierarchy = async (): Promise<TStreamHierarchy[] | null> => {
    return STREAM_HIERARCHY ?? null
};

// if subject exist from the main syllabus
export const isSubjectInTheStream = async (stream: TStream, subject: string): Promise<boolean> => {
    return doesSubjectExist(SYLLABUS, stream, subject);
};


// get Subjects from the main syllabus
export const getSubjects = async (stream: TStream): Promise<string[] | null> => {
    return getAllSubjects(SYLLABUS, stream) ?? null
};


// get chapters of a subject from the main syllabus
export const getChaptersBySubject = async (stream: TStream, subject: string): Promise<string[] | null> => {
    return getAllTopicsBySubject(SYLLABUS, stream, subject)
}


// get count of questions in each subject from database
export const getTotalQuestionsPerSubject = async (stream: TStream): Promise<TTotalQuestionsPerSubjectSchema[] | null> => {
    try {
        const subjects = await prisma.subject.findMany({
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

        const result: TTotalQuestionsPerSubjectSchema[] = subjects.map(subject => ({
            subject: subject.name,
            count: subject._count.questions
        })).sort((a, b) => b.count - a.count);
        
        return result;
    } catch (error) {
        console.error("Error fetching total questions per subject:", error);
        return null;
    }
};


// get count of questions in each chapter and its subject from databse
export const getTotalQuestionsPerSubjectAndChapter = async (stream: TStream): Promise<TAllSubjectsAndChaptersWithCounts | null> => {
    try {
        const allSubjects = await prisma.subject.findMany({
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

        const result: TAllSubjectsAndChaptersWithCounts = {};
        
        allSubjects.forEach(subject => {
            result[subject.name] = {};
            subject.chapters.forEach(chapter => {
                result[subject.name][chapter.name] = chapter._count.questions;
            });
        });

        return result;
        
    } catch (error) {
        console.error('Error fetching all subjects and chapters with counts:', error);
        return null;
    }
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



// bulk update the questions ---- not needed now
export const bulkUpdateCorrectedQuestions = async (questions: TCorrectedQuestionSchema[]): Promise<{ count: number }> => {
    // Create an array of all the update promises we need to run.
    const updateOperations = questions.flatMap(q => [
        // Promise to update the main Question table
        prisma.question.update({
            where: { id: q.id },
            data: {
                question: q.question,
                answer: q.answer,
                explanation: q.explanation,
            },
        }),
        // Promise to update the related Option table
        prisma.option.update({
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
    const result = await prisma.$transaction(updateOperations);
    
    // The result of a transaction is an array of the results of each operation.
    // We count the successful question updates by dividing the total successful operations by 2.
    return { count: result.length / 2 };
};
    






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
