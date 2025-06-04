"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const middleware_1 = require("../utils/middleware");
const UserServices = __importStar(require("./users.services"));
const users_validators_1 = require("./users.validators");
const mail_services_1 = require("../mail/mail.services");
const mail_templates_1 = require("../mail/mail.templates");
const functions_1 = require("../utils/functions");
const router = express_1.default.Router();
// to get all the streams
router.get('/get-all-users', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield UserServices.getAllUsers();
        if (!users || users.length === 0) {
            return response.status(400).json({ data: null, message: 'Users Not Found' });
        }
        return response.status(200).json({ data: users, message: 'Streams fetched successfully' });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.post('/signup', users_validators_1.createUserValidation, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ message: errors.array()[0].msg });
        }
        const existingUserWithEmail = yield UserServices.checkEmailExist(request.body.email);
        if (existingUserWithEmail)
            return response.status(400).json({ message: 'An User with email already exist' });
        const user = yield UserServices.userSignUp(request.body);
        // login user after creating the account
        const loggedInUser = yield UserServices.loginUser({
            email: user.email,
            password: user.password
        });
        return response.status(200).json({ data: loggedInUser, message: 'User Created' });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.post('/login', users_validators_1.loginUserValidation, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ message: errors.array()[0].msg });
        }
        const existingUserWithEmail = yield UserServices.checkEmailExist(request.body.email);
        if (!existingUserWithEmail)
            return response.status(400).json({ message: 'Incorrect credentials' });
        const userLoginToken = yield UserServices.loginUser(request.body);
        if (!userLoginToken) {
            return response.status(404).json({ message: 'Incorrect credentials' });
        }
        // this token will be ustored in cookie and will be sent back to bacnend server with every requests
        return response.status(200).json({ data: userLoginToken, message: 'Logged in successfully!' });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.post('/lucia-google-auth', users_validators_1.loginWithLuciaGoogleUserValidation, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate request body
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ data: null, message: errors.array()[0].msg });
        }
        const { googleId, email, name, image } = request.body;
        // Check if the email exists in the database
        const existingUserWithEmail = yield UserServices.checkEmailExist(email);
        if (existingUserWithEmail) {
            const user = yield UserServices.loginWithLuciaGoogleUser(request.body);
            //    check if user is null
            if (!user) {
                return response.status(404).json({ data: null, message: 'Incorrect credentials' });
            }
            return response.status(200).json({ data: user, message: 'Logged in successfully!' });
        }
        // If user doesn't exist, create a new user account
        const newUser = yield UserServices.signupWithLuciaGoogleUser({
            email,
            googleId,
            name,
            image,
        });
        if (!newUser) {
            return response.status(404).json({ data: null, message: 'Incorrect credentials' });
        }
        const sendWelcomeEmail = (0, mail_services_1.sendEmail)({
            to: request.body.email,
            subject: 'Welcome',
            html: (0, mail_templates_1.sendWelcomeMailToUser)({
                name: request.body.name,
                email: request.body.email,
            })
        });
        // Send the user in response
        return response.status(200).json({ data: newUser, message: 'Logged in successfully!' });
    }
    catch (error) {
        console.error("Error during Google login:", error);
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.post('/generate-auth-token', users_validators_1.generateAuthTokenValidation, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ data: null, message: errors.array()[0].msg });
        }
        const existingUserWithEmail = yield UserServices.checkEmailExist(request.body.email);
        if (!existingUserWithEmail) {
            return response.status(404).json({ data: null, message: 'Incorrect credentials' });
        }
        const authToken = yield UserServices.generateAuthToken(request.body);
        if (!authToken) {
            return response.status(404).json({ data: null, message: 'Incorrect credentials' });
        }
        return response.status(200).json({ data: authToken, message: 'Logged in successfully!' });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.post('/edit-role', users_validators_1.changeRoleValidation, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ message: errors.array()[0].msg });
        }
        const existingUserWithEmail = yield UserServices.checkEmailExist(request.body.email);
        if (!existingUserWithEmail)
            return response.status(400).json({ message: 'Incorrect credentials' });
        const changedRoleUserId = yield UserServices.changeRole(request.body);
        if (!changedRoleUserId) {
            return response.status(404).json({ message: 'Incorrect credentials' });
        }
        return response.status(200).json({ data: changedRoleUserId, message: 'Logged in successfully!' });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.post('/create-user-feedback', users_validators_1.userFeedbackValidation, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ message: errors.array()[0].msg });
        }
        const newUserFeedbackId = yield UserServices.createUserFeedback(request.body);
        if (!newUserFeedbackId)
            return response.status(400).json({ message: 'Can not create feedback' });
        const sendFeedbackEmail = (0, mail_services_1.sendEmail)({
            to: request.body.email,
            subject: 'Feedback',
            html: (0, mail_templates_1.sendFeedbackMailToAdmin)({
                name: request.body.name,
                email: request.body.email,
                message: request.body.message
            })
        });
        return response.status(200).json({ data: newUserFeedbackId, message: 'Feedback received successfully!' });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.post('/create-subscription-request', users_validators_1.subscriptionRequestValidation, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ message: errors.array()[0].msg });
        }
        const subscriptionId = yield UserServices.createSubscriptionRequest(request.body);
        if (!subscriptionId) {
            return response.status(500).json({ message: 'Failed to create subscription' });
        }
        const sendSubscriptionRequestEmail = (0, mail_services_1.sendEmail)({
            to: request.body.email,
            subject: 'Subscription Request',
            html: (0, mail_templates_1.sendSubscriptionRequestMailToUser)(request.body.email)
        });
        const sentRequestToAdmin = (0, mail_services_1.sendEmail)({
            to: process.env.ADMIN_EMAIL,
            subject: 'Subscription Request',
            html: (0, mail_templates_1.sendSubscriptionRequestMailToAdmin)({
                name: request.body.name,
                email: request.body.email,
                phone: request.body.phone
            })
        });
        return response.status(201).json({ data: subscriptionId, message: 'Subscription created successfully' });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.get('/set-user-subscription/:id', middleware_1.checkModerator, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = request.params;
        const isUserExist = yield UserServices.isUserExist(id);
        if (!isUserExist) {
            return response.status(401).json({ message: 'User Not Found' });
        }
        const updatedUser = yield UserServices.setUserSubscription(id);
        if (!updatedUser) {
            return response.status(401).json({ message: 'cant set subscription' });
        }
        return response.status(200).json({ data: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.stream, message: 'Subscription set successfully' });
    }
    catch (error) {
        console.log(error);
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
// to get all the streams
router.get('/get-all-streams', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const streams = (0, functions_1.getStreams)();
        return response.status(200).json({ data: streams, message: 'Streams fetched successfully' });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.post('/set-user-stream', middleware_1.getUserSession, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stream = request.body.stream;
        const streams = (0, functions_1.getStreams)();
        if (!stream || !streams.includes(stream)) {
            return response.status(400).json({ message: 'Invalid stream' });
        }
        const user = request.user;
        if (!user) {
            return response.status(401).json({ message: 'Unauthorized' });
        }
        const updatedUser = yield UserServices.setUserStream(user.id, stream);
        return response.status(200).json({ data: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.stream, message: 'Stream set successfully' });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.get('/get-user-session', middleware_1.getUserSession, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = request.user;
        return response.status(200).json({ data: user, message: 'Sesssion Found!' });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
exports.default = router;
