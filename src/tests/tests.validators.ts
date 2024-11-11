import { body, ValidationChain } from 'express-validator';
import { TCreateTestQuestionAnswer, TTypeOfTest } from './tests.schema';
import { STREAM, TypeOfTest } from '@prisma/client';

export const createCustomTestValidation: ValidationChain[] = [
    body('name')
        .notEmpty().withMessage('Test name must be provided')
        .isString().withMessage('Test name must be a string'),

    body('slug')
        .notEmpty().withMessage('Slug must be provided')
        .isString().withMessage('Slug must be a string'),
];


const typeOfStream: STREAM[] = Object.values(STREAM);
export const createPastTestValidation: ValidationChain[] = [
    body('year')
        .notEmpty().withMessage('year name must be provided')
        .isNumeric().withMessage('year name must be a number'),

    // body('affiliation') //make this optoional later on ----------
    //     .notEmpty().withMessage('affiliation must be provided')
    //     .isString().withMessage('affiliation must be a string'),

    body('stream')
        .notEmpty().withMessage('affiliation must be provided')
        .isString().withMessage('affiliation must be a string')
        .isIn(typeOfStream).withMessage('Not a valid stream'),

    // for questions in the body
    body('questions').isArray().withMessage('Questions must be an array'),
    body('questions.*.question')
        .notEmpty().withMessage('Question must be provided')
        .isString().withMessage('Question must be a string'),
    body('questions.*.answer')
        .notEmpty().withMessage('Answer must be provided')
        .isString().isIn(['a', 'b', 'c', 'd']).withMessage('Answer must be one of: A, B, C, D'),
    body('questions.*.subject')
        .notEmpty().withMessage('Subject must be provided')
        .isString().withMessage('Subject must be a string'),
    body('questions.*.chapter')
        .notEmpty().withMessage('Chapter must be provided')
        .isString().withMessage('Chapter must be a string'),
    // body('questions.*.unit')
    //     .notEmpty().withMessage('unit must be provided')
    //     .isString().withMessage('unit must be a string'),
    body('questions.*.explanation')
        .notEmpty().withMessage('explanation must be provided')
        .isString().withMessage('explanation must be a string'),
    // body('questions.*.difficulty')
    //     .notEmpty().withMessage('Difficulty must be provided')
    //     .isString().withMessage('Difficulty must be a string'),

    body('questions.*.options.a')
        .notEmpty().withMessage('Option A must be provided')
        .isString().withMessage('Option A must be a string'),
    body('questions.*.options.b')
        .notEmpty().withMessage('Option B must be provided')
        .isString().withMessage('Option B must be a string'),
    body('questions.*.options.c')
        .notEmpty().withMessage('Option C must be provided')
        .isString().withMessage('Option C must be a string'),
    body('questions.*.options.d')
        .notEmpty().withMessage('Option D must be provided')
        .isString().withMessage('Option D must be a string'),


];


const typeOfTestValues: TypeOfTest[] = Object.values(TypeOfTest);
export const createCustomTestByUserValidation: ValidationChain[] = [
    body('name')
        .notEmpty().withMessage('Test name must be provided')
        .isString().withMessage('Test name must be a string'),

    body('type')
        .notEmpty().withMessage('Test type must be provided')
        .isString().withMessage('Test type must be a string')
        .isIn(typeOfTestValues).withMessage('Test type must be a valid type'),
];


export const createTestAnalyticValidation: ValidationChain[] = [
    body('userId')
        .notEmpty().withMessage('User ID must be provided')
        .isString().withMessage('User ID must be a string'),

    body('customTestId')
        .notEmpty().withMessage('Custom Test ID must be provided')
        .isString().withMessage('Custom Test ID must be a string'),

    body('questionsWithAnswers')
        .isArray({ min: 1 }).withMessage('Questions with answers must be an array with at least one element')
        .custom((value) => {
            return value.every((item: TCreateTestQuestionAnswer) => {
                return typeof item.questionId === 'string' &&
                    item.questionId.startsWith('c') &&
                    item.questionId.length === 25 &&
                    typeof item.userAnswer === 'string'
            });
        }).withMessage('Each question in "questionsWithAnswers" must contain a valid question ID (CUID) and a non-empty user answer'),
];


export const saveUserScoreValidation: ValidationChain[] = [
    body('username')
        .notEmpty().withMessage('Username must be provided')
        .isString().withMessage('Username must be a string'),

    body('customTestId')
        .notEmpty().withMessage('Test ID must be provided')
        .isString().withMessage('Test ID must be a string'),

    body('totalScore')
        .isFloat().withMessage('score must be present') // Since it can be null
];


