"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubjectScoresForBarChart = void 0;
exports.calculateTotalQuestionsAttempt = calculateTotalQuestionsAttempt;
exports.calculateTotalCorrectAnswers = calculateTotalCorrectAnswers;
exports.calculateTotalUnattemptQuestions = calculateTotalUnattemptQuestions;
exports.generateRecentTests = generateRecentTests;
exports.calculateAverageScorePerTest = calculateAverageScorePerTest;
exports.calculateAverageScorePerQuestion = calculateAverageScorePerQuestion;
exports.generateDailyTestProgress = generateDailyTestProgress;
const functions_1 = require("../utils/functions");
// Function to calculate total questions attempted
function calculateTotalQuestionsAttempt(testAnalytics) {
    return testAnalytics.reduce((acc, test) => acc + test.testQuestionAnswer.length, 0);
}
// Function to calculate total correct answers
function calculateTotalCorrectAnswers(testAnalytics) {
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
function calculateTotalUnattemptQuestions(testAnalytics) {
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
function generateRecentTests(testAnalytics) {
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
function calculateAverageScorePerTest(totalCorrectAnswers, totalTests) {
    return totalTests > 0 ? (totalCorrectAnswers / totalTests) * 100 : 0;
}
// Function to calculate average score per question
function calculateAverageScorePerQuestion(totalCorrectAnswers, totalQuestionsAttempt) {
    return totalQuestionsAttempt > 0 ? (totalCorrectAnswers / totalQuestionsAttempt) * 100 : 0;
}
// generate daily test progress
function generateDailyTestProgress(testAnalytics) {
    const dailyScores = {};
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
    const color = (0, functions_1.getRandomColor)();
    // Prepare the final chart data
    const chartData = Object.entries(dailyScores).map(([date, { correct, total }]) => ({
        date,
        score: Math.round((correct / total) * 100), // Calculate percentage score and round it
        fill: color
    }));
    return chartData;
}
// subjectwise bar graph data
const getSubjectScoresForBarChart = (testAnalytics) => {
    const subjectScores = {};
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
    const chartData = Object.entries(subjectScores).map(([subject, { correct, total }]) => ({
        subject,
        total: total,
        score: total > 0 ? parseFloat(((correct / total) * 100).toFixed(2)) : 0, // Calculate percentage score and round to 2 decimal places
        fill: (0, functions_1.getRandomColor)(),
    }));
    return chartData;
};
exports.getSubjectScoresForBarChart = getSubjectScoresForBarChart;
