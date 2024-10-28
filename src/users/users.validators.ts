import { body, ValidationChain } from 'express-validator';

export const createUserValidation: ValidationChain[] = [
    body('name').notEmpty().withMessage('Name must be provided').isString().withMessage('Name must be a string'),
    body('email').notEmpty().withMessage('Email must be provided').isEmail().withMessage('Email must be valid'),
    body('password').notEmpty().withMessage('Password must be provided').isString().withMessage('Password must be a number'),
];

export const loginUserValidation: ValidationChain[] = [
    body('email').notEmpty().withMessage('Email must be provided').isEmail().withMessage('Email must be a number'),
    body('password').notEmpty().withMessage('Password must be provided').isString().withMessage('Password must be a number'),
];


export const userFeedbackValidation: ValidationChain[] = [
    body('message').notEmpty().withMessage('Message/Feedback must be provided').isString().withMessage('Password must be a number'),
];


export const subscriptionRequestValidation: ValidationChain[] = [
    body('name').notEmpty().withMessage('Name is required').isString().withMessage('Name must be a string'),
    body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
    body('phone').notEmpty().withMessage('Phone is required').isString().withMessage('Phone must be a string')
]


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
