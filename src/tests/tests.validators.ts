import { body, ValidationChain } from 'express-validator';
import { TCreateTestQuestionAnswer, TTypeOfTest } from './tests.schema';
import { TypeOfTest } from '@prisma/client';

export const createCustomTestValidation: ValidationChain[] = [
    body('name')
        .notEmpty().withMessage('Test name must be provided')
        .isString().withMessage('Test name must be a string'),

    body('slug')
        .notEmpty().withMessage('Slug must be provided')
        .isString().withMessage('Slug must be a string'),
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


