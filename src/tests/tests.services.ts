import { getQuestionsIdsBySubject, getQuestionsIdsBySubjectAndChapter } from "../questions/questions.services";
import { typeOfTestsAndDescriptionData } from "../utils/global-data";
import { TStream } from "../utils/global-types";
import prisma from "../utils/prisma";
import { calculateAverageScorePerQuestion, calculateAverageScorePerTest, calculateTotalCorrectAnswers, calculateTotalQuestionsAttempt, calculateTotalUnattemptQuestions, generateDailyTestProgress, generateRandomCodesForTest, generateRecentTests, getSubjectScoresForBarChart } from "./tests.methods";
import { TBaseCustomTest, TBasePastPaper, TBaseTestAnalytic, TBaseUserScore, TcreateCustomTest, TcreateCustomTestByUser, TCreatePastPaper, TCreateTestAnalytic, TCustomTestMetadata, TDashboardAnalyticData, TSaveUserScore, TScoreBreakdown, TSingleCustomTestWithQuestions, TTestArchiveResult, TTypeOfTest, TTypeOfTestsAndDescription } from "./tests.schema";

export const createCustomTest = async (customTestData: TcreateCustomTest): Promise<string | null> => {
    const { name, slug, createdById, mode, questions, type, stream, description, specialImage, specialUrl, imageUrl, isLocked } = customTestData;
    const newCustomTest = await prisma.customTest.create({
        data: {
            name,
            slug,
            stream,
            createdById,
            type,
            description,
            specialImage,
            specialUrl,
            imageUrl,
            mode: mode || 'ALL',
            questions: questions
        }
    })
    if (!newCustomTest) return null

    if (customTestData.isLocked) {
        const newLockedTest = await prisma.testLock.create({
            data: {
                testId: newCustomTest.id,
            }
        })

        if (!newLockedTest) return null
    }

    return newCustomTest.id
}

export const createTestCodes = async (testId: string, limit: number): Promise<string[] | null> => {
    try {
        // Get existing codes first
        const existingTestLock = await prisma.testLock.findUnique({
            where: { testId }
        });

        const existingCodes = existingTestLock?.lockCodes || [];
        const newCodes = generateRandomCodesForTest(limit);

        // Combine existing codes with new ones
        const updatedCodes = [...existingCodes, ...newCodes];

        const newTestCodes = await prisma.testLock.update({
            where: { testId },
            data: { lockCodes: updatedCodes }
        });

        if (!newTestCodes) return null;
        return newTestCodes.lockCodes;
    } catch (error) {
        console.error("Error creating test code:", error);
        return null;
    }
}


export const addTestToGroup = async (groupId: string, testId: string): Promise<boolean> => {
    try {
        const updatedTest = await prisma.customTest.update({
            where: { id: testId },
            data: {
                groupId: groupId
            }
        });

        return !!updatedTest;
    } catch (error) {
        console.error("Error adding test to group:", error);
        return false;
    }
}

export const updateTestQuestions = async (testId: string, questionIds: string[]): Promise<string | null> => {
    const updatedTest = await prisma.customTest.update({
        where: { id: testId },
        data: { questions: questionIds }
    })
    if (!updatedTest) return null
    return updatedTest.id
}


export const createPastTest = async (testData: TCreatePastPaper): Promise<TBasePastPaper | null> => {
    const {
        customTestId,
        affiliation,
        year,
        stream,
        category
    } = testData;

    const newPastPaper = await prisma.pastPaper.create({
        data: {
            stream,
            customTestId,
            affiliation,
            category,
            year
        }
    })
    if (!newPastPaper) return null
    return newPastPaper
}


export const createSubjectWiseCustomTestByUser = async (customTestData: TcreateCustomTestByUser, subject: string): Promise<string | null> => {
    const { name, createdById, type, mode, limit, stream } = customTestData;
    const questions = await getQuestionsIdsBySubject(subject, limit, stream)
    if (!questions || questions.length === 0) return null;

    const newCustomTest = await prisma.customTest.create({
        data: {
            name,
            type,
            stream,
            slug: name.toLowerCase().replace(/ /g, "_"),
            createdById,
            mode: mode || 'ALL',
            questions: questions
        }
    })
    if (!newCustomTest) return null
    return newCustomTest.id
}

export const createChapterWiseCustomTestByUser = async (customTestData: TcreateCustomTestByUser, subject: string, chapter: string): Promise<string | null> => {
    const { name, createdById, type, mode, limit, stream } = customTestData;
    const questions = await getQuestionsIdsBySubjectAndChapter(subject, chapter, limit, stream)
    if (!questions || questions.length === 0) return null;
    const newCustomTest = await prisma.customTest.create({
        data: {
            name,
            type,
            stream,
            slug: name.toLowerCase().replace(/ /g, "_"),
            createdById,
            mode: mode || 'ALL',
            questions: questions
        }
    })
    if (!newCustomTest) return null
    return newCustomTest.id
}

export const findCustomTestBySlug = async (slug: string, stream:TStream): Promise<boolean> => {
    const customTest = await prisma.customTest.findFirst({
        where: {
            slug: slug,
            stream: stream
        }
    });
    if (!customTest) return false;
    return true
}


export const isDailyTestSlugExist = async (slug: string, stream: TStream): Promise<boolean> => {
    const dailyTest = await prisma.customTest.findFirst({
        where: {
            slug,
            type: "DAILY_TEST",
            stream: stream,
        }
    });
    if (!dailyTest) return false;
    return true
}

export const isTestLocked = async (id:string) : Promise<boolean | null> =>{
    const customTest = await prisma.customTest.findUnique({
        where: {
            id
        },
        select: {
            testLock: true
        }
    })

    if (!customTest) return null
    if(customTest.testLock?.isLocked) return true
    return false
}


export const checkTestValidity = async (id: string, testCode?: string): Promise<boolean | null> => {
    const customTest = await prisma.customTest.findUnique({
        where: {
            id
        },
        select: {
            testLock: true
        }
    })

    if (!customTest) return null

    if (customTest.testLock?.isLocked) {
        if (!testCode || testCode === '' || testCode === undefined) return false
        if (!customTest.testLock?.lockCodes.includes(testCode)) return false
        if (customTest.testLock?.keysUsed.includes(testCode)) return false

        await prisma.testLock.update({
            where: {
                testId: id
            },
            data: {
                keysUsed: {
                    push: testCode
                }
            }
        });

        return true

    }


    return true

}

export const getCustomTestById = async (id: string): Promise<TSingleCustomTestWithQuestions | null> => {
    const customTest = await prisma.customTest.findFirst({
        where: { id },
        select: {
            name: true,
            id: true,
            slug: true,
            stream: true,
            archive: true,
            createdBy: { select: { name: true } },
            questions: true
        }
    });
    if (!customTest) return null;

    const questions = await prisma.question.findMany({
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
            chapter: true,
            unit: true,
            difficulty: true,
            videoUrl:{
                select:{
                    id:true,
                    questionId:true,
                    url:true,
                }
            },
            IsPast: true,
            subjectId:true,
            chapterId: true,
        }
    });

    const modifiedQuestions = questions.map((q) => ({
        ...q,
        options: q.options || { a: "", b: "", c: "", d: "" },
        videoUrl: q.videoUrl?.url
    }));

    const modifiedCustomTest = {
        ...customTest,
        createdBy: customTest.createdBy.name,
        questions: modifiedQuestions,
    };

    return {
        ...modifiedCustomTest,
    };
};


export const getCustomTestBySlugAndStream = async (slug:string, stream:TStream): Promise<TSingleCustomTestWithQuestions | null> => {
    const customTest = await prisma.customTest.findFirst({
        where: { slug, stream },
        select: {
            name: true,
            id: true,
            slug: true,
            stream: true,
            archive: true,
            createdBy: { select: { name: true } },
            questions: true
        }
    });
    if (!customTest) return null;

    const questions = await prisma.question.findMany({
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
            chapter: true,
            unit: true,
            difficulty: true,
            videoUrl:{
                select:{
                    id:true,
                    questionId:true,
                    url:true,
                }
            },
            IsPast: true,
            subjectId:true,
            chapterId: true,
        }
    });

    const modifiedQuestions = questions.map((q) => ({
        ...q,
        options: q.options || { a: "", b: "", c: "", d: "" },
        videoUrl: q.videoUrl?.url
    }));

    const modifiedCustomTest = {
        ...customTest,
        createdBy: customTest.createdBy.name,
        questions: modifiedQuestions,
    };

    return {
        ...modifiedCustomTest,
    };
};


export const getTestBasicScores = async (testid: string): Promise<TScoreBreakdown | null> => {
    const test = await prisma.customTest.findUnique({
        where: { id: testid },
        select: {
            id: true,
            name: true,
            questions: true, // This will give us the total number of questions
            testAnalytic: {
                select: {
                    testQuestionAnswer: {
                        select: {
                            question: {
                                select: {
                                    answer: true // The correct answer
                                }
                            },
                            userAnswer: true // The user's submitted answer
                        }
                    }
                }
            }
        }
    });

    if (!test) return null;

    const total = test.questions.length;
    let attempt = 0;
    let correct = 0;
    let incorrect = 0;

    // testAnalytic is an array, typically it might contain one entry per test attempt
    // For calculating basic scores, we'll assume we're looking at the first (or only) analytic entry
    // You might need to adjust this logic if you have multiple testAnalytic entries for a single test and need to choose a specific one.
    if (test.testAnalytic && test.testAnalytic.length > 0) {
        const latestAnalytic = test.testAnalytic[0]; // Assuming we take the first analytic entry

        latestAnalytic.testQuestionAnswer.forEach(qa => {
            // A question is "attempted" if the userAnswer is not empty or null
            if (qa.userAnswer !== null && qa.userAnswer !== undefined && qa.userAnswer !== '') {
                attempt++;

                // Check if the user's answer matches the correct answer
                if (qa.userAnswer === qa.question.answer) {
                    correct++;
                } else {
                    incorrect++;
                }
            }
        });
    }

    return {
        total,
        unattempt: total - attempt,
        correct,
        incorrect,
    };
};

export const archiveCustomTestBySlug = async (slug: string, stream: TStream):Promise< TTestArchiveResult | null>=> {
    try {
        // Find the custom test by slug and stream to get its ID
        const customTest = await prisma.customTest.findFirst({
            where: {
                stream: stream,
                slug: slug,
                type: "CHAPTER_WISE",
            },
            select: {
                id: true,
            },
        });

        if (!customTest) {
            return null;
        }

        // Update the custom test by ID
        const updatedTest = await prisma.customTest.update({
            where: {
                id: customTest.id,
            },
            data: {
                archive: true,
            },
            select: { // selecting userscore after archiving
                name: true,
                id: true,
                slug: true,
                usersAttended:true,
            },
        });

        return updatedTest;
    } catch (error) {
        console.error("Error archiving custom test:", error);
        return null;
    }
};



export const getDailyTestsBySlug = async (slug: string): Promise<TBaseCustomTest[] | null> => {
    const customTests = await prisma.customTest.findMany({
        where: {
            slug: slug,
            archive: false,
        },
        select: {
            name: true,
            id: true,
            date: true,
            archive: true,
            createdBy: { select: { name: true } },
            questions: true,
            pastPaper: true
        }
    })

    return customTests;

}

export const getCustomTestMetadata = async (id: string): Promise<TCustomTestMetadata | null> => {
    const customTest = await prisma.customTest.findFirst({
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
            description: true,
            imageUrl: true,
            specialImage: true,
            specialUrl: true,
            testLock: {
                select: {
                    isLocked: true,
                    keysUsed: true,
                    lockCodes: true,
                }
            },
            usersAttended: {
                select: {
                    username: true,
                    totalScore: true,
                }
            }
        }
    })

    if (!customTest) return null

    const modifiedTestData = {
        ...customTest,
        createdBy: customTest.createdBy.name,
        questionsCount: customTest.questions.length,
    }

    if (!modifiedTestData) return null
    return modifiedTestData
}

export const archiveTestById = async (id: string): Promise<boolean | null> => {
    const customTest = await prisma.customTest.findFirst({
        where: {
            id
        }
    });

    if (!customTest) return null

    const updatedTest = await prisma.customTest.update({
        where: {
            id
        },
        data: {
            archive: !customTest.archive
        }
    });

    if (!updatedTest) return null

    return true
}

export const deleteTestById = async (id: string): Promise<boolean | null> => {
    const customTest = await prisma.customTest.findFirst({
        where: {
            id
        }
    });

    if (!customTest) return null

    await prisma.customTest.delete({
        where: {
            id
        }
    });

    return true
}


export const archiveTestBySlugAndStream = async (slug: string, stream: TStream): Promise<boolean | null> => {
    const customTest = await prisma.customTest.findFirst({
        where: {
            slug,
            stream,
            type: 'DAILY_TEST'
        },
    });

    if (!customTest) return null

    await prisma.customTest.update({
        where: {
            id: customTest.id
        },
        data: {
            archive: true
        }
    })

    return true
}


export const getAllTestsByType = async (type: TTypeOfTest, stream: TStream): Promise<TBaseCustomTest[] | []> => {
    const customTests = await prisma.customTest.findMany({
        where: {
            type: type,
            stream: stream,
            mode: 'ALL',
        },
        select: {
            name: true,
            id: true,
            date: true,
            archive: true,
            questions: true,
            createdBy: {
                select: {
                    name: true
                }
            },
            pastPaper: {
                select: {
                    stream: true,
                    category: true,
                    isUnlocked: true,
                    year: true,
                    affiliation: true,
                }
            }
        }
    })

    if (!customTests || customTests.length === 0) return []

    // Map over tests to add creator field
    const modifiedTests = customTests.map(test => ({
        ...test,
        creator: test.createdBy.name
    }))

    return modifiedTests
}

export const getAllTests = async (): Promise<TBaseCustomTest[] | []> => {
    const customTests = await prisma.customTest.findMany({
        select: {
            name: true,
            id: true,
            date: true,
            archive: true,
            questions: true,
            pastPaper: {
                select: {
                    stream: true,
                    category: true,
                    isUnlocked: true,
                    year: true,
                    affiliation: true,
                }
            }
        }
    })

    if (!customTests || customTests.length === 0) return []
    return customTests
}

export const getAllTestsCreatedByUser = async (userId: string): Promise<TBaseCustomTest[] | []> => {
    const customTests = await prisma.customTest.findMany({
        where: {
            createdById: userId
        },
        select: {
            name: true,
            id: true,
            date: true,
            archive: true,
            questions: true,
            createdBy: {
                select: {
                    name: true
                }
            }
        }
    })

    if (!customTests || customTests.length === 0) return []

    // Map over tests to add creator field
    const modifiedTests = customTests.map(test => ({
        ...test,
        creator: test.createdBy.name
    }))

    return modifiedTests
}


export const getTypesOfTests = (): TTypeOfTestsAndDescription[] | [] => {
    return typeOfTestsAndDescriptionData.length > 0 ? typeOfTestsAndDescriptionData : []
}

export const createTestAnalytic = async (data: TCreateTestAnalytic): Promise<TBaseTestAnalytic | null> => {
    const { userId, customTestId, questionsWithAnswers } = data
    const newTestAnalytic = await prisma.testAnalytic.create({
        data: {
            userId,
            customTestId,
        }
    })
    if (!newTestAnalytic) return null

    // Prepare the array of objects for TestQuestionAnswer creation
    const testQuestionAnswersData = questionsWithAnswers.map((qa) => ({
        testAnalyticId: newTestAnalytic.id,
        questionId: qa.questionId,
        userAnswer: qa.userAnswer
    }));

    // Create many TestQuestionAnswer records
    const newTestQuestionAnswers = await prisma.testQuestionAnswer.createMany({
        data: testQuestionAnswersData
    });

    if (!newTestQuestionAnswers) return null;
    return newTestAnalytic

}

export const saveUserScore = async (userScoreData: TSaveUserScore): Promise<TBaseUserScore | null> => {
    const { username, customTestId, totalScore } = userScoreData
    const newUserScore = await prisma.userScore.create({
        data: {
            username,
            customTestId,
            totalScore
        },
        select: {
            username: true,
            totalScore: true,
        }
    })
    if (!newUserScore) return null
    return newUserScore
}

export const getDashboardAnalytics = async (userId: string): Promise<TDashboardAnalyticData | null> => {
    const currentUser = await prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            GroupMember: {
                select: {
                    group: {
                        select: {
                            name: true,
                            id: true,
                        }
                    }
                }
            },
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
    const totalQuestionsAttempt = calculateTotalQuestionsAttempt(currentUser.testAnalytics);
    const totalCorrectAnswers = calculateTotalCorrectAnswers(currentUser.testAnalytics);
    const totalUnattemptQuestions = calculateTotalUnattemptQuestions(currentUser.testAnalytics);
    const totalIncorrectanswers = totalQuestionsAttempt - (totalCorrectAnswers + totalUnattemptQuestions)

    // const subjectScores = calculateSubjectScores(currentUser.testAnalytics);
    const recentTests = generateRecentTests(currentUser.testAnalytics);

    const averageScorePerTest = calculateAverageScorePerTest(totalCorrectAnswers, totalTests);
    const averageScorePerQuestion = calculateAverageScorePerQuestion(totalCorrectAnswers, totalQuestionsAttempt);

    // Round the averages
    const roundedAverageScorePerTest = Math.round(averageScorePerTest * 100) / 100;
    const roundedAverageScorePerQuestion = Math.round(averageScorePerQuestion * 100) / 100;


    const dailyTestProgressData = generateDailyTestProgress(currentUser.testAnalytics)
    const subjectWiseScoreChartData = getSubjectScoresForBarChart(currentUser.testAnalytics)

    const scoreParametersData = [
        { name: 'correct', value: totalCorrectAnswers, total: totalQuestionsAttempt, fill: `var(--color-correct)` },
        { name: 'incorrect', value: totalIncorrectanswers, total: totalQuestionsAttempt, fill: `var(--color-incorrect)` },
        { name: 'unattempt', value: totalUnattemptQuestions, total: totalQuestionsAttempt, fill: `var(--color-unattempt)` },
    ]



    const groupData =
        currentUser.GroupMember && Array.isArray(currentUser.GroupMember)
            ? currentUser.GroupMember
                .map((gm: any) => gm.group)
                .filter((g: any) => g && g.id && g.name)
            : [];

    const analyticData: TDashboardAnalyticData = {
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
        subjectWiseScoreChartData,
        groupData, // {id, name}[]
    };

    return analyticData;
};
