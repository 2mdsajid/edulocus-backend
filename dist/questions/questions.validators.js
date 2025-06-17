"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMultipleQuestionsValidation = exports.reportQuestionValidation = exports.addSingleQuestionValidation = void 0;
const express_validator_1 = require("express-validator");
exports.addSingleQuestionValidation = [
    (0, express_validator_1.body)('question').notEmpty().withMessage('Question must be provided').isString().withMessage('Question must be a string'),
    (0, express_validator_1.body)('answer').notEmpty().withMessage('Answer must be provided').isString().isIn(['a', 'b', 'c', 'd']).withMessage('Answer must be one of: A, B, C, D'),
    (0, express_validator_1.body)('explanation').notEmpty().withMessage('Explanation must be provided').isString().withMessage('Explanation must be a string'),
    (0, express_validator_1.body)('subject').notEmpty().withMessage('Subject must be provided').isString().withMessage('Subject must be a string'),
    (0, express_validator_1.body)('chapter').notEmpty().withMessage('Chapter must be provided').isString().withMessage('Chapter must be a string'),
    (0, express_validator_1.body)('difficulty').notEmpty().withMessage('Difficulty must be provided').isString().withMessage('Difficulty must be a string'),
    // Validation for options object
    (0, express_validator_1.body)('options.a').notEmpty().withMessage('Option A must be provided').isString().withMessage('Option A must be a string'),
    (0, express_validator_1.body)('options.b').notEmpty().withMessage('Option B must be provided').isString().withMessage('Option B must be a string'),
    (0, express_validator_1.body)('options.c').notEmpty().withMessage('Option C must be provided').isString().withMessage('Option C must be a string'),
    (0, express_validator_1.body)('options.d').notEmpty().withMessage('Option D must be provided').isString().withMessage('Option D must be a string'),
];
exports.reportQuestionValidation = [
    (0, express_validator_1.body)('description').notEmpty().withMessage('Description must be provided').isString().withMessage('Description must be a string'),
];
exports.addMultipleQuestionsValidation = [
    (0, express_validator_1.body)('questions').isArray().withMessage('Questions must be an array'),
    (0, express_validator_1.body)('questions.*.question').notEmpty().withMessage('Question must be provided').isString().withMessage('Question must be a string'),
    (0, express_validator_1.body)('questions.*.answer').notEmpty().withMessage('Answer must be provided').isString().isIn(['a', 'b', 'c', 'd']).withMessage('Answer must be one of: A, B, C, D'),
    (0, express_validator_1.body)('questions.*.subject').notEmpty().withMessage('Subject must be provided').isString().withMessage('Subject must be a string'),
    (0, express_validator_1.body)('questions.*.chapter').notEmpty().withMessage('Chapter must be provided').isString().withMessage('Chapter must be a string'),
    (0, express_validator_1.body)('questions.*.difficulty').notEmpty().withMessage('Difficulty must be provided').isString().withMessage('Difficulty must be a string'),
    (0, express_validator_1.body)('questions.*.stream').notEmpty().withMessage('Stream must be provided').isString().withMessage('Stream must be a string'),
    (0, express_validator_1.body)('questions.*.options.a').notEmpty().withMessage('Option A must be provided').isString().withMessage('Option A must be a string'),
    (0, express_validator_1.body)('questions.*.options.b').notEmpty().withMessage('Option B must be provided').isString().withMessage('Option B must be a string'),
    (0, express_validator_1.body)('questions.*.options.c').notEmpty().withMessage('Option C must be provided').isString().withMessage('Option C must be a string'),
    (0, express_validator_1.body)('questions.*.options.d').notEmpty().withMessage('Option D must be provided').isString().withMessage('Option D must be a string'),
];
/*
    body('questions.*.unit').notEmpty().withMessage('Unit must be provided').isString().withMessage('Unit must be a string'),
    body('questions.*.explanation').notEmpty().withMessage('Explanation must be provided').isString().withMessage('Explanation must be a string'),
 */
