import { getRandomColor } from "../utils/functions";
import { TTestAnalyticsForDashboardData, TRecentTestInDashboardData, TDailyTestProgressChartData, TSubjectwiseScoresChartData } from "./tests.schema";

// Function to calculate total questions attempted
export function calculateTotalQuestionsAttempt(testAnalytics: TTestAnalyticsForDashboardData[]): number {
    return testAnalytics.reduce((acc, test) => acc + test.testQuestionAnswer.length, 0);
}

// Function to calculate total correct answers
export function calculateTotalCorrectAnswers(testAnalytics: TTestAnalyticsForDashboardData[]): number {
    let totalCorrectAnswers = 0;

    testAnalytics.forEach((testAnalytic) => {
        testAnalytic.testQuestionAnswer.forEach((qa) => {
            if (qa.userAnswer === qa.question.answer) {
                totalCorrectAnswers++;
            }
        });
    });

    return totalCorrectAnswers;
}

export function calculateTotalUnattemptQuestions(testAnalytics: TTestAnalyticsForDashboardData[]): number {
    let totalUnattemptQuestions = 0;

    testAnalytics.forEach((testAnalytic) => {
        testAnalytic.testQuestionAnswer.forEach((qa) => {
            if (!qa.userAnswer) {
                totalUnattemptQuestions++;
            }
        });
    });

    return totalUnattemptQuestions;
}

// Function to generate recent tests data
export function generateRecentTests(testAnalytics: TTestAnalyticsForDashboardData[]): TRecentTestInDashboardData[] {
    const recentTests = testAnalytics.map((testAnalytic) => {
        const questions = testAnalytic.testQuestionAnswer;
        const correctAnswers = questions.filter((qa) => qa.userAnswer === qa.question.answer).length;

        return {
            id: testAnalytic.customTest.id,
            name: testAnalytic.customTest.name,
            date: testAnalytic.createdAt.toISOString(),
            totalQuestions: questions.length,
            score: Math.round((correctAnswers / questions.length) * 100),
        };
    });

    return recentTests.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Function to calculate average score per test
export function calculateAverageScorePerTest(totalCorrectAnswers: number, totalTests: number): number {
    return totalTests > 0 ? (totalCorrectAnswers / totalTests) * 100 : 0;
}

// Function to calculate average score per question
export function calculateAverageScorePerQuestion(totalCorrectAnswers: number, totalQuestionsAttempt: number): number {
    return totalQuestionsAttempt > 0 ? (totalCorrectAnswers / totalQuestionsAttempt) * 100 : 0;
}

// generate daily test progress
export function generateDailyTestProgress(testAnalytics: TTestAnalyticsForDashboardData[]): TDailyTestProgressChartData[] {
    const dailyScores: Record<string, { correct: number; total: number }> = {};

    testAnalytics.forEach(testAnalytic => {
        const testDate = new Date(testAnalytic.createdAt).toISOString().split('T')[0]; // Extract the date (YYYY-MM-DD)
        const questions = testAnalytic.testQuestionAnswer;

        if (!dailyScores[testDate]) {
            dailyScores[testDate] = { correct: 0, total: 0 };
        }

        // Calculate correct answers and total attempts for this test
        questions.forEach(qa => {
            const { userAnswer, question } = qa;
            const { answer } = question;

            if (userAnswer === answer) {
                dailyScores[testDate].correct++;
            }
            dailyScores[testDate].total++;
        });
    });
    const color = getRandomColor()
    // Prepare the final chart data
    const chartData = Object.entries(dailyScores).map(([date, { correct, total }]) => ({
        date,
        score: Math.round((correct / total) * 100), // Calculate percentage score and round it
        fill: color
    }));

    return chartData;
}

// subjectwise bar graph data
export const getSubjectScoresForBarChart = (
    testAnalytics: TTestAnalyticsForDashboardData[]
): TSubjectwiseScoresChartData[] => {
    const subjectScores: Record<string, { correct: number; total: number }> = {};

    // Iterate through the test analytics to calculate subject scores
    testAnalytics.forEach((testAnalytic) => {
        const questions = testAnalytic.testQuestionAnswer;

        questions.forEach((qa) => {
            const { userAnswer, question } = qa;
            const { answer, subject } = question;

            // Update scores
            if (!subjectScores[subject]) {
                subjectScores[subject] = { correct: 0, total: 0 };
            }

            // Increment total questions for the subject
            subjectScores[subject].total++;

            // Count correct answers
            if (userAnswer === answer) {
                subjectScores[subject].correct++;
            }
        });
    });

    // Transform subject scores into the desired bar chart data format
    const chartData: TSubjectwiseScoresChartData[] = Object.entries(subjectScores).map(
        ([subject, { correct, total }]) => ({
            subject,
            total: total,
            score: total > 0 ? parseFloat(((correct / total) * 100).toFixed(2)) : 0, // Calculate percentage score and round to 2 decimal places
            fill: getRandomColor(),
        })
    );


    return chartData;
};