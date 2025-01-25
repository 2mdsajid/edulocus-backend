"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionRequestValidation = exports.userFeedbackValidation = exports.changeRoleValidation = exports.generateAuthTokenValidation = exports.loginWithLuciaGoogleUserValidation = exports.loginUserValidation = exports.createUserValidation = void 0;
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
exports.loginWithLuciaGoogleUserValidation = [
    (0, express_validator_1.body)('googleId').notEmpty().withMessage('Google ID is required'),
    (0, express_validator_1.body)('email').isEmail().withMessage('A valid email is required'),
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('image').notEmpty().withMessage('Image is required')
];
exports.generateAuthTokenValidation = [
    (0, express_validator_1.body)('name')
        .notEmpty()
        .withMessage('Name must be provided')
        .isString()
        .withMessage('Name must be a string'),
    (0, express_validator_1.body)('email')
        .notEmpty()
        .withMessage('Email must be provided')
        .isEmail()
        .withMessage('Email must be a valid email'),
    (0, express_validator_1.body)('id')
        .notEmpty()
        .withMessage('ID must be provided')
        .isString()
        .withMessage('ID must be a string'),
    (0, express_validator_1.body)('role')
        .notEmpty()
        .withMessage('Role must be provided')
        .isIn(['USER', 'ADMIN', 'SUPERADMIN', 'MODERATOR', 'SAJID'])
        .withMessage('Role must be a valid enum value'),
    (0, express_validator_1.body)('isSubscribed')
        .notEmpty()
        .withMessage('Subscription status must be provided')
        .isBoolean()
        .withMessage('isSubscribed must be a boolean'),
    // for googleId
    (0, express_validator_1.body)('googleId')
        .isString()
        .withMessage('Google ID must be a string')
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
