"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveUserScoreValidation = exports.createTestAnalyticValidation = exports.createCustomTestByUserValidation = exports.createCustomTestValidation = void 0;
const express_validator_1 = require("express-validator");
const client_1 = require("@prisma/client");
exports.createCustomTestValidation = [
    (0, express_validator_1.body)('name')
        .notEmpty().withMessage('Test name must be provided')
        .isString().withMessage('Test name must be a string'),
    (0, express_validator_1.body)('slug')
        .notEmpty().withMessage('Test ID must be provided')
        .isString().withMessage('Test ID must be a string'),
    (0, express_validator_1.body)('createdById')
        .notEmpty().withMessage('Creator (User) ID must be provided')
        .isString().withMessage('Invalid User ID format'),
    (0, express_validator_1.body)('questions')
        .optional()
        .isArray().withMessage('Questions must be an array of Question IDs')
        .custom((value) => value.every((id) => {
        return typeof id === 'string' && id.startsWith('c') && id.length === 25;
    })).withMessage('Each Question ID must be a valid CUID (starting with "c" and 25 characters long)'),
];
const typeOfTestValues = Object.values(client_1.TypeOfTest);
exports.createCustomTestByUserValidation = [
    (0, express_validator_1.body)('name')
        .notEmpty().withMessage('Test name must be provided')
        .isString().withMessage('Test name must be a string'),
    (0, express_validator_1.body)('type')
        .notEmpty().withMessage('Test type must be provided')
        .isString().withMessage('Test type must be a string')
        .isIn(typeOfTestValues).withMessage('Test type must be a valid type'),
];
exports.createTestAnalyticValidation = [
    (0, express_validator_1.body)('userId')
        .notEmpty().withMessage('User ID must be provided')
        .isString().withMessage('User ID must be a string'),
    (0, express_validator_1.body)('customTestId')
        .notEmpty().withMessage('Custom Test ID must be provided')
        .isString().withMessage('Custom Test ID must be a string'),
    (0, express_validator_1.body)('questionsWithAnswers')
        .isArray({ min: 1 }).withMessage('Questions with answers must be an array with at least one element')
        .custom((value) => {
        return value.every((item) => {
            return typeof item.questionId === 'string' &&
                item.questionId.startsWith('c') &&
                item.questionId.length === 25 &&
                typeof item.userAnswer === 'string';
        });
    }).withMessage('Each question in "questionsWithAnswers" must contain a valid question ID (CUID) and a non-empty user answer'),
];
exports.saveUserScoreValidation = [
    (0, express_validator_1.body)('username')
        .notEmpty().withMessage('Username must be provided')
        .isString().withMessage('Username must be a string'),
    (0, express_validator_1.body)('customTestId')
        .notEmpty().withMessage('Test ID must be provided')
        .isString().withMessage('Test ID must be a string'),
    (0, express_validator_1.body)('totalScore')
        .isFloat().withMessage('score must be present') // Since it can be null
];
