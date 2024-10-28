import express, { Request, Response } from 'express';
import { createUserValidation, loginUserValidation, subscriptionRequestValidation, userFeedbackValidation } from './users.validators';
import { validationResult } from 'express-validator';
import * as UserServices from './users.services'
import { z } from 'zod';
import { checkUserExists, getUserSession, RequestWithUserIdAndRole } from '../utils/middleware';


const router = express.Router();

router.post('/signup', createUserValidation, async (request: Request, response: Response) => {
    try {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ message: errors.array()[0].msg });
        }

        // const validatedData = await createUserSchema.parseAsync(request.body);

        const existingUserWithEmail = await UserServices.checkEmailExist(request.body.email)
        if (existingUserWithEmail) return response.status(400).json({ message: 'An User with email already exist' });

        const user = await UserServices.userSignUp(request.body)

        // login user after creating the account
        const loggedInUser = await UserServices.loginUser({
            email: user.email,
            password: user.password
        })
        return response.status(200).json({ data: loggedInUser, message: 'User Created' });
    } catch (error) {
        // if (error instanceof z.ZodError) {
        //     return response.status(400).json({ message: error.errors[0].message });
        // }
        return response.status(500).json({ data: null, message: 'Internal Server Error' })
    }
})

router.post('/login', loginUserValidation, async (request: Request, response: Response) => {
    try {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ message: errors.array()[0].msg });
        }

        const existingUserWithEmail = await UserServices.checkEmailExist(request.body.email)
        if (!existingUserWithEmail) return response.status(400).json({ message: 'Incorrect credentials' });

        const userLoginToken = await UserServices.loginUser(request.body)
        if (!userLoginToken) {
            return response.status(404).json({ message: 'Incorrect credentials' })
        }

        // this token will be ustored in cookie and will be sent back to bacnend server with every requests
        return response.status(200).json({ data: userLoginToken, message: 'Logged in successfully!' });
    } catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' })
    }
})


router.post('/create-user-feedback', userFeedbackValidation, async (request: Request, response: Response) => {
    try {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ message: errors.array()[0].msg });
        }
        const newUserFeedbackId = await UserServices.createUserFeedback(request.body)
        if (!newUserFeedbackId) return response.status(400).json({ message: 'Can not create feedback' });
        return response.status(200).json({ data: newUserFeedbackId, message: 'Feedback received successfully!' });
    } catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' })
    }
})


router.post('/create-subscription-request', subscriptionRequestValidation, async (request: Request, response: Response) => {
    try {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ message: errors.array()[0].msg });
        }

        const subscriptionId = await UserServices.createSubscriptionRequest(request.body);
        if (!subscriptionId) {
            return response.status(500).json({ message: 'Failed to create subscription' });
        }

        return response.status(201).json({ data: subscriptionId, message: 'Subscription created successfully' });
    } catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
})


router.get('/get-user-session', getUserSession, async (request: RequestWithUserIdAndRole, response: Response) => {
    try {
        const user = request.user
        return response.status(200).json({ data: user, message: 'Sesssion Found!' });
    } catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' })
    }
})


export default router