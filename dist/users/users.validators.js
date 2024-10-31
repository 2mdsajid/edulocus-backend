"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionRequestValidation = exports.userFeedbackValidation = exports.changeRoleValidation = exports.loginUserValidation = exports.createUserValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createUserValidation = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name must be provided').isString().withMessage('Name must be a string'),
    (0, express_validator_1.body)('email').notEmpty().withMessage('Email must be provided').isEmail().withMessage('Email must be valid'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password must be provided').isString().withMessage('Password must be a number'),
];
exports.loginUserValidation = [
    (0, express_validator_1.body)('email').notEmpty().withMessage('Email must be provided').isEmail().withMessage('Email must be a number'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password must be provided').isString().withMessage('Password must be a number'),
];
exports.changeRoleValidation = [
    (0, express_validator_1.body)('email').notEmpty().withMessage('Email must be provided').isEmail().withMessage('Email must be a number'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password must be provided').isString().withMessage('Password must be a number'),
];
exports.userFeedbackValidation = [
    (0, express_validator_1.body)('message').notEmpty().withMessage('Message/Feedback must be provided').isString().withMessage('Password must be a number'),
];
exports.subscriptionRequestValidation = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required').isString().withMessage('Name must be a string'),
    (0, express_validator_1.body)('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
    (0, express_validator_1.body)('phone').notEmpty().withMessage('Phone is required').isString().withMessage('Phone must be a string')
];
// import { z } from 'zod';
// export const createUserSchema = z.object({
//   name: z.string().nonempty({ message: 'Name must be provided' }),
//   email: z.string().email({ message: 'Email must be a valid email' }),
//   password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
//   role: z.string().nonempty({ message: 'Role must be provided' }),
// });
// export const loginUserSchema = z.object({
//   email: z.string().email({ message: 'Email must be valid' }),
//   password: z.string().min(6, { message: 'Password must be provided' }),
// });
