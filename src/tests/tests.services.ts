import { getQuestionsIdsBySubject, getQuestionsIdsBySubjectAndChapter } from "../questions/questions.services";
import { typeOfTestsAndDescriptionData } from "../utils/global-data";
import { TStream } from "../utils/global-types";
import prisma from "../utils/prisma";
import { calculateAverageScorePerQuestion, calculateAverageScorePerTest, calculateTotalCorrectAnswers, calculateTotalQuestionsAttempt, calculateTotalUnattemptQuestions, generateDailyTestProgress, generateRecentTests, getSubjectScoresForBarChart } from "./tests.methods";
import { TBaseCustomTest, TBasePastPaper, TBaseTestAnalytic, TBaseUserScore, TcreateCustomTest, TcreateCustomTestByUser, TCreatePastPaper, TCreateTestAnalytic, TCustomTestMetadata, TDashboardAnalyticData, TSaveUserScore, TSingleCustomTestWithQuestions, TTypeOfTest, TTypeOfTestsAndDescription } from "./tests.schema";

export const createCustomTest = async (customTestData: TcreateCustomTest): Promise<string | null> => {
    const { name, slug, createdById, mode, questions, type, stream } = customTestData;
    const newCustomTest = await prisma.customTest.create({
        data: {
            name,
            slug,
            stream,
            createdById,
            type,
            mode: mode || 'ALL',
            questions: questions
        }
    })
    if (!newCustomTest) return null
    return newCustomTest.id
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
    console.log("🚀 ~ createPastTest ~ testData:", testData)
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

export const isDailyTestSlugExist = async (slug: string): Promise<boolean> => {
    const dailyTest = await prisma.customTest.findFirst({
        where: {
            slug,
            type:"DAILY_TEST"
        }
    });
    if (!dailyTest) return false;
    return true
}

export const getCustomTestById = async (id: string): Promise<TSingleCustomTestWithQuestions | null> => {
    const customTest = await prisma.customTest.findFirst({
        where: { id },
        select: {
            name: true,
            id: true,
            slug: true,
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
            chapter: true,
            unit: true,
            difficulty: true,
        }
    });

    const modifiedQuestions = questions.map((q) => ({
        ...q,
        options: q.options || { a: "", b: "", c: "", d: "" }
    }));

    const modifiedCustomTest = {
        ...customTest,
        createdBy: customTest.createdBy.name,
        questions: modifiedQuestions,
    };

    return modifiedCustomTest;
};


export const getDailyTestBySlug = async (slug: string): Promise<TSingleCustomTestWithQuestions | null> => {
    const customTest = await prisma.customTest.findFirst({
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
    })

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
            chapter: true,
            stream: true,
            unit: true,
            difficulty: true,
        }
    });

    const modifiedQuestions = questions.map((q) => ({
        ...q,
        options: q.options || { a: "", b: "", c: "", d: "" }
    }));

    const modifiedCustomTest = {
        ...customTest,
        createdBy: customTest.createdBy.name,
        questions: modifiedQuestions
    };

    return modifiedCustomTest;

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

export const getAllTestsByType = async (type: TTypeOfTest, stream: TStream): Promise<TBaseCustomTest[] | []> => {
    const customTests = await prisma.customTest.findMany({
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

export const getAllTests = async (): Promise<TBaseCustomTest[] | []> => {
    const customTests = await prisma.customTest.findMany({
        select: {
            name: true,
            id: true,
            date: true,
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
        subjectWiseScoreChartData
    };

    return analyticData;
};
