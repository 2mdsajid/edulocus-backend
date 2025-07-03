import express, { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { checkModerator, getUserSession, RequestExtended } from '../utils/middleware';
import * as UserServices from './users.services';
import { changeRoleValidation, createUserValidation, generateAuthTokenValidation, loginUserValidation, loginWithLuciaGoogleUserValidation, subscriptionRequestValidation, userFeedbackValidation } from './users.validators';
import { sendEmail } from '../mail/mail.services';
import { sendFeedbackMailToAdmin, sendSubscriptionRequestMailToAdmin, sendSubscriptionRequestMailToUser, sendWelcomeMailToUser } from '../mail/mail.templates';
import { getStreams } from '../utils/functions';


const router = express.Router();


// to get all the streams
router.get('/get-all-users', async (request: Request, response: Response) => {
    try {
        const users =await  UserServices.getAllUsers()
        if (!users || users.length === 0) {
            return response.status(400).json({ data: null, message: 'Users Not Found' })
        }
        return response.status(200).json({ data: users, message: 'Streams fetched successfully' });
    } catch (error) {
        console.log(error)
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
})

router.post('/signup', createUserValidation, async (request: Request, response: Response) => {
    try {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ message: errors.array()[0].msg });
        }

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

router.post('/lucia-google-auth', loginWithLuciaGoogleUserValidation, async (request: Request, response: Response) => {
    try {
        // Validate request body
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ data: null, message: errors.array()[0].msg });
        }

        const { googleId, email, name, image } = request.body;

        // Check if the email exists in the database
        const existingUserWithEmail = await UserServices.checkEmailExist(email);
        if (existingUserWithEmail) {
            const user = await UserServices.loginWithLuciaGoogleUser(request.body);
            //    check if user is null
            if (!user) {
                return response.status(404).json({ data: null, message: 'Incorrect credentials' });
            }
            return response.status(200).json({ data: user, message: 'Logged in successfully!' });
        }

        // If user doesn't exist, create a new user account
        const newUser = await UserServices.signupWithLuciaGoogleUser({
            email,
            googleId,
            name,
            image,
        });

        if (!newUser) {
            return response.status(404).json({ data: null, message: 'Incorrect credentials' });
        }

        const sendWelcomeEmail = sendEmail({
            to: request.body.email,
            subject: 'Welcome',
            html: sendWelcomeMailToUser({
                name: request.body.name,
                email: request.body.email,
            })
        })

        // Send the user in response
        return response.status(200).json({ data: newUser, message: 'Logged in successfully!' });

    } catch (error) {
        console.error("Error during Google login:", error);
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
});

router.post('/generate-auth-token', generateAuthTokenValidation, async (request: Request, response: Response) => {
    try {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ data: null, message: errors.array()[0].msg });
        }

        const existingUserWithEmail = await UserServices.checkEmailExist(request.body.email);
        if (!existingUserWithEmail) {
            return response.status(404).json({ data: null, message: 'Incorrect credentials' });
        }

        const authToken = await UserServices.generateAuthToken(request.body);
        if (!authToken) {
            return response.status(404).json({ data: null, message: 'Incorrect credentials' });
        }

        return response.status(200).json({ data: authToken, message: 'Logged in successfully!' });
    } catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
});


router.post('/edit-role', changeRoleValidation, async (request: Request, response: Response) => {
    try {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ message: errors.array()[0].msg });
        }

        const existingUserWithEmail = await UserServices.checkEmailExist(request.body.email)
        if (!existingUserWithEmail) return response.status(400).json({ message: 'Incorrect credentials' });

        const changedRoleUserId = await UserServices.changeRole(request.body)
        if (!changedRoleUserId) {
            return response.status(404).json({ message: 'Incorrect credentials' })
        }
        return response.status(200).json({ data: changedRoleUserId, message: 'Logged in successfully!' });
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

        const sendFeedbackEmail = sendEmail({
            to: request.body.email,
            subject: 'Feedback',
            html: sendFeedbackMailToAdmin({
                name: request.body.name,
                email: request.body.email,
                message: request.body.message
            })
        })

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

        const sendSubscriptionRequestEmail = sendEmail({
            to: request.body.email,
            subject: 'Subscription Request',
            html: sendSubscriptionRequestMailToUser(request.body.email)
        })

        const sentRequestToAdmin = sendEmail({
            to: process.env.ADMIN_EMAIL as string,
            subject: 'Subscription Request',
            html: sendSubscriptionRequestMailToAdmin({
                name: request.body.name,
                email: request.body.email,
                phone: request.body.phone
            })
        })

        return response.status(201).json({ data: subscriptionId, message: 'Subscription created successfully' });
    } catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
})


router.get('/set-user-subscription/:id', checkModerator, async (request: RequestExtended, response: Response) => {
    try {
        const { id } = request.params
        const isUserExist = await UserServices.isUserExist(id)
        if (!isUserExist) {
            return response.status(401).json({ message: 'User Not Found' });
        }

        const updatedUser = await UserServices.setUserSubscription(id)
        if (!updatedUser) {
            return response.status(401).json({ message: 'cant set subscription' });
        }

        return response.status(200).json({ data: updatedUser?.stream, message: 'Subscription set successfully' });
    } catch (error) {
        console.log(error)
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
})



// to get all the streams
router.get('/get-all-streams', async (request: Request, response: Response) => {
    try {
        const streams = getStreams()
        return response.status(200).json({ data: streams, message: 'Streams fetched successfully' });
    } catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
})

router.post('/set-user-stream', getUserSession, async (request: RequestExtended, response: Response) => {
    try {
        const stream = request.body.stream

        const streams = getStreams()
        if (!stream || !streams.includes(stream)) {
            return response.status(400).json({ message: 'Invalid stream' });
        }

        const user = request.user
        if (!user) {
            return response.status(401).json({ message: 'Unauthorized' });
        }

        const updatedUser = await UserServices.setUserStream(user.id, stream)
        return response.status(200).json({ data: updatedUser?.stream, message: 'Stream set successfully' });
    } catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
})

router.get('/get-user-session', getUserSession, async (request: RequestExtended, response: Response) => {
    try {
        const user = request.user
        return response.status(200).json({ data: user, message: 'Sesssion Found!' });
    } catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' })
    }
})


// register users for chapterwise tests
router.post('/register-chapterwise-test', async (request: Request, response: Response) => {
    try {
        const { name, email, phone, message } = request.body;

        if (!name || !email || !phone || !message) {
            return response.status(400).json({ data: null, message: 'Please provide all the required fields' });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return response.status(400).json({ data: null, message: 'Please provide a valid email address' });
        }

        // Basic phone validation (assuming a 10-digit US phone number)
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone)) {
            return response.status(400).json({ data: null, message: 'Please provide a valid 10-digit phone number' });
        }

        const registration = await UserServices.registerForChapterwiseTest({
            name,
            email,
            phone,
            message,
        });

        return response.status(200).json({ data: registration, message: 'Registered successfully!' });
    } catch (error) {
        console.error("Error during chapterwise test registration:", error);
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
});



export default router