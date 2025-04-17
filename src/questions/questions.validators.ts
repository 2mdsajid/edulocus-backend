import { body, ValidationChain } from 'express-validator';

export const addSingleQuestionValidation: ValidationChain[] = [
    body('question').notEmpty().withMessage('Question must be provided').isString().withMessage('Question must be a string'),
    body('answer').notEmpty().withMessage('Answer must be provided').isString().isIn(['a', 'b', 'c', 'd']).withMessage('Answer must be one of: A, B, C, D'),
    body('explanation').notEmpty().withMessage('Explanation must be provided').isString().withMessage('Explanation must be a string'),
    body('subject').notEmpty().withMessage('Subject must be provided').isString().withMessage('Subject must be a string'),
    body('chapter').notEmpty().withMessage('Chapter must be provided').isString().withMessage('Chapter must be a string'),
    body('unit').notEmpty().withMessage('Unit must be provided').isString().withMessage('Unit must be a string'),
    body('difficulty').notEmpty().withMessage('Difficulty must be provided').isString().withMessage('Difficulty must be a string'),
    
    // Validation for options object
    body('options.a').notEmpty().withMessage('Option A must be provided').isString().withMessage('Option A must be a string'),
    body('options.b').notEmpty().withMessage('Option B must be provided').isString().withMessage('Option B must be a string'),
    body('options.c').notEmpty().withMessage('Option C must be provided').isString().withMessage('Option C must be a string'),
    body('options.d').notEmpty().withMessage('Option D must be provided').isString().withMessage('Option D must be a string'),
];

export const reportQuestionValidation: ValidationChain[] = [
    body('description').notEmpty().withMessage('Description must be provided').isString().withMessage('Description must be a string'),
];

export const addMultipleQuestionsValidation: ValidationChain[] = [
    body('questions').isArray().withMessage('Questions must be an array'),
    body('questions.*.question').notEmpty().withMessage('Question must be provided').isString().withMessage('Question must be a string'),
    body('questions.*.answer').notEmpty().withMessage('Answer must be provided').isString().isIn(['a', 'b', 'c', 'd']).withMessage('Answer must be one of: A, B, C, D'),
    body('questions.*.subject').notEmpty().withMessage('Subject must be provided').isString().withMessage('Subject must be a string'),
    body('questions.*.chapter').notEmpty().withMessage('Chapter must be provided').isString().withMessage('Chapter must be a string'),
    body('questions.*.difficulty').notEmpty().withMessage('Difficulty must be provided').isString().withMessage('Difficulty must be a string'),
    body('questions.*.stream').notEmpty().withMessage('Stream must be provided').isString().withMessage('Stream must be a string'),
    
    body('questions.*.options.a').notEmpty().withMessage('Option A must be provided').isString().withMessage('Option A must be a string'),
    body('questions.*.options.b').notEmpty().withMessage('Option B must be provided').isString().withMessage('Option B must be a string'),
    body('questions.*.options.c').notEmpty().withMessage('Option C must be provided').isString().withMessage('Option C must be a string'),
    body('questions.*.options.d').notEmpty().withMessage('Option D must be provided').isString().withMessage('Option D must be a string'),
];

/* 
    body('questions.*.unit').notEmpty().withMessage('Unit must be provided').isString().withMessage('Unit must be a string'),
    body('questions.*.explanation').notEmpty().withMessage('Explanation must be provided').isString().withMessage('Explanation must be a string'),
 */



