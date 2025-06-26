import { CustomTest, ModeOfTest, PastPaper, Prisma, TestAnalytic, TestQuestionAnswer, TypeOfTest, UserScore } from "@prisma/client";
import { TQuestion, TQuestionVideo } from "../questions/questions.schema";
import { LucideIcon } from "lucide-react";

export type TcreateCustomTest = Pick<CustomTest,
    'name' |
    'createdById' |
    'slug' |
    'mode' |
    'type' |
    'questions' |
    'stream' |
    'description'|
    'imageUrl'|
    'specialImage'|
    'specialUrl'
> & {
    isLocked : boolean
}

export type TCreatePastPaper = PastPaper

export type TcreateCustomTestByUser = Pick<CustomTest,
    'name' |
    'type' |
    'createdById' |
    'mode' |
    'stream'
> & {
    limit: number,
}

export type TTestLock = {
    isLocked : boolean,
    keysUsed : string[],
    lockCodes:string[]
}


export type TCustomTestMetadata = Pick<CustomTest,
    'name' |
    'slug' |
    'date' |
    'archive' |
    'id' |
    'usersConnected' | 
    'description'|
    'specialImage'|
    'specialUrl'|
    'imageUrl' 
> & {
    createdBy: string,
    questionsCount: number
    usersAttended: TBaseUserScore[]
    testLock : TTestLock | null
}

export type TSingleCustomTestWithQuestions = Pick<CustomTest,
    'id' |
    'name' |
    'slug' |
    'stream' |
    'archive'
> & {
    createdBy: string,
    questions: TQuestion[]
}


export type TTypeOfTest = TypeOfTest
export type TTypeOfTestsAndDescription = {
    type: TTypeOfTest;
    description: string;
    icon: LucideIcon;
}
export type TBaseCustomTest = Pick<CustomTest,
    'id' |
    'name' |
    'date' |
    'archive'|
    'questions'
> & {
    creator?: string,
    pastPaper?: TBasePastPaper | null
}

export type TBasePastPaper = Omit<PastPaper, 'customTestId'>


// create array of questions and user answers
export type TCreateTestQuestionAnswer = Pick<TestQuestionAnswer,
    'questionId' |
    'userAnswer'
>

export type TBaseTestAnalytic = TestAnalytic

export type TCreateTestAnalytic = Pick<TestAnalytic,
    'userId' |
    'customTestId'
> & {
    questionsWithAnswers: TCreateTestQuestionAnswer[]
}

// dashboard data
export type TRecentTestInDashboardData = {
    id: string
    name: string
    date: string
    totalQuestions: number
    score: number
}

export type TScoreParametersData = {
    name: string;
    value: number;
    total: number;
}

export type TDailyTestProgressChartData = {
    date: string;
    score: number;
}

export type TSubjectwiseScoresChartData = {
    subject: string;
    score: number;
    total: number;
    fill: string;
}

export type TGroupDataInDashboard = {
    id:string
    name: string
}

export type TDashboardAnalyticData = {
    totalTests: number,
    totalQuestionsAttempt: number,
    totalCorrectAnswers: number,
    totalUnattemptQuestions: number,
    totalIncorrectanswers: number,
    averageScorePerTest: number,
    averageScorePerQuestion: number,
    scoreParametersData:TScoreParametersData[],
    recentTests: TRecentTestInDashboardData[],
    dailyTestProgressChartData: TDailyTestProgressChartData[],
    subjectWiseScoreChartData: TSubjectwiseScoresChartData[],
    groupData?:TGroupDataInDashboard[]
}

// to strongly type the dashboard process
export type TTestAnalyticsForDashboardData = Prisma.TestAnalyticGetPayload<{
    select: {
        testQuestionAnswer: {
            select: {
                userAnswer: true,
                question: {
                    select: {
                        answer: true,
                        subject: true,
                    },
                },
            },
        },
        createdAt: true,
        customTest: {
            select: {
                name: true,
                id: true,
            },
        },
    },
}>;

export type TScoreBreakdown = {
    total: number;
    correct: number;
    incorrect: number;
    unattempt: number;
}


// for leaderboard
export type TSaveUserScore = Omit<UserScore, 'id'>
export type TBaseUserScore = Pick<UserScore, 'username' | 'totalScore'>