"use strict";
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
exports.setUserSubscription = exports.setUserStream = exports.getUserById = exports.createSubscriptionRequest = exports.createUserFeedback = exports.changeRole = exports.generateAuthToken = exports.signupWithLuciaGoogleUser = exports.loginWithLuciaGoogleUser = exports.loginUser = exports.userSignUp = exports.getAllUsers = exports.isUserExist = exports.checkEmailExist = void 0;
const functions_1 = require("../utils/functions");
const prisma_1 = __importDefault(require("../utils/prisma"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const checkEmailExist = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserWithEmailExist = yield prisma_1.default.user.findFirst({
        where: { email }
    });
    if (isUserWithEmailExist)
        return true;
    return false;
});
exports.checkEmailExist = checkEmailExist;
const isUserExist = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isIdUuid = (0, functions_1.isUUID)(id);
    if (!isIdUuid)
        return false;
    const user = yield prisma_1.default.user.findUnique({
        where: { id }
    });
    if (!user)
        return false;
    return true;
});
exports.isUserExist = isUserExist;
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield prisma_1.default.user.findMany();
    if (!users) {
        return null;
    }
    return users;
});
exports.getAllUsers = getAllUsers;
const userSignUp = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, role } = userData;
    const newUser = yield prisma_1.default.user.create({
        data: {
            name,
            email,
            password,
            role
        },
        select: {
            id: true,
            email: true,
            password: true
        }
    });
    return newUser;
});
exports.userSignUp = userSignUp;
// export const updateUser = async (userData: TBaseUser): Promise<TBaseUser> => {
//     const newUser = await prisma.user.update({
//         where: {
//             id: userData.id
//         },
//         data: {
//             ...userData
//         }
//     })
//     return newUser
// }
// export const getAllUsers = async (): Promise<TBaseUser[] | null> => {
//     const users = await prisma.user.findMany({
//         where: {
//             role: {
//                 not: 'student'
//             }
//         }
//     });
//     return users;
// }
const loginUser = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { password, email } = userData;
        const existingUser = yield prisma_1.default.user.findFirst({
            where: {
                email, password
            }
        });
        if (!existingUser)
            return null;
        const token = jsonwebtoken_1.default.sign({
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role
        }, process.env.SECRET_KEY_FOR_AUTH);
        return token;
    }
    catch (error) {
        return null;
    }
});
exports.loginUser = loginUser;
const loginWithLuciaGoogleUser = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, googleId } = userData;
        const existingUser = yield prisma_1.default.user.findFirst({
            where: {
                email,
                googleId
            },
            select: {
                id: true,
                name: true,
                email: true,
                isCompleted: true,
                role: true,
                stream: true,
                isSubscribed: true,
                googleId: true
            }
        });
        if (!existingUser)
            return null;
        return existingUser;
    }
    catch (error) {
        return null;
    }
});
exports.loginWithLuciaGoogleUser = loginWithLuciaGoogleUser;
const signupWithLuciaGoogleUser = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, googleId, name, image } = userData;
        const existingUser = yield prisma_1.default.user.create({
            data: {
                email,
                googleId,
                name,
                image
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                stream: true,
                isSubscribed: true,
                googleId: true,
                isCompleted: true
            }
        });
        if (!existingUser)
            return null;
        return existingUser;
    }
    catch (error) {
        console.log("🚀 ~ signupWithLuciaGoogleUser ~ error:", error);
        return null;
    }
});
exports.signupWithLuciaGoogleUser = signupWithLuciaGoogleUser;
const generateAuthToken = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, email, name, role, isSubscribed, googleId } = userData;
        const token = jsonwebtoken_1.default.sign({
            id: id,
            name: name,
            email: email,
            role: role,
            isSubscribed: isSubscribed,
            googleId: googleId
        }, process.env.SECRET_KEY_FOR_AUTH);
        return token;
    }
    catch (error) {
        console.log("🚀 ~ generateAuthToken ~ error:", error);
        return null;
    }
});
exports.generateAuthToken = generateAuthToken;
const changeRole = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { password, email } = userData;
        const existingUser = yield prisma_1.default.user.findFirst({
            where: {
                email, password
            }
        });
        if (!existingUser)
            return null;
        const changesUser = yield prisma_1.default.user.update({
            where: {
                id: existingUser.id
            },
            data: {
                role: "SAJID",
                isSubscribed: true
            }
        });
        if (!changesUser)
            return null;
        return changesUser.id;
    }
    catch (error) {
        return null;
    }
});
exports.changeRole = changeRole;
const createUserFeedback = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, image, message } = userData;
    const newFeedback = yield prisma_1.default.feedback.create({
        data: {
            name,
            email,
            image: image || "",
            message
        }
    });
    if (!newFeedback)
        return null;
    return newFeedback.id;
});
exports.createUserFeedback = createUserFeedback;
const createSubscriptionRequest = (subscriptionData) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, phone, stream } = subscriptionData;
    const newSubscription = yield prisma_1.default.subscriptionRequest.create({
        data: {
            name,
            email,
            phone,
            stream
        }
    });
    if (!newSubscription)
        return null;
    return newSubscription.id;
});
exports.createSubscriptionRequest = createSubscriptionRequest;
const getUserById = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: {
            id: userId
        },
        select: {
            id: true,
            name: true,
            email: true,
            googleId: true,
            role: true,
            isSubscribed: true,
            stream: true,
            isCompleted: true
        }
    });
    if (!user)
        return null;
    return user;
});
exports.getUserById = getUserById;
const setUserStream = (userId, stream) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.update({
        where: { id: userId },
        data: { stream, isCompleted: true }
    });
    if (!user)
        return null;
    return user;
});
exports.setUserStream = setUserStream;
const setUserSubscription = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.update({
        where: { id: userId },
        data: { isSubscribed: true }
    });
    if (!user)
        return null;
    return user;
});
exports.setUserSubscription = setUserSubscription;
