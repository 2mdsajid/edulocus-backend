import { isUUID } from "../utils/functions";
import prisma from "../utils/prisma"
import { TBaseUser, TCreateSubscriptionRequest, TCreateUserFeedback, TJWT, TLogInUser, TLuciaGoogleAuth, TSignUpUser } from "./users.schema";
import jwt from 'jsonwebtoken';


export const checkEmailExist = async (email: string): Promise<boolean> => {
    const isUserWithEmailExist = await prisma.user.findFirst({
        where: { email }
    })
    if (isUserWithEmailExist) return true;
    return false;
}

export const isUserExist = async (id: string): Promise<boolean> => {
    const isIdUuid = isUUID(id)
    if (!isIdUuid) return false

    const user = await prisma.user.findUnique({
        where: { id }
    })

    if (!user) return false;
    return true;
}

export const userSignUp = async (userData: TSignUpUser): Promise<TLogInUser> => {
    const { name, email, password, role } = userData
    const newUser = await prisma.user.create({
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
    })
    return newUser
}

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


export const loginUser = async (userData: TLogInUser): Promise<string | null> => {
    try {
        const { password, email } = userData
        const existingUser = await prisma.user.findFirst({
            where: {
                email, password
            }
        })
        if (!existingUser) return null
        const token = jwt.sign({
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role
        }, process.env.SECRET_KEY_FOR_AUTH as string);
        return token
    } catch (error) {
        return null
    }
}

export const loginWithLuciaGoogleUser = async (userData: TLuciaGoogleAuth): Promise<TBaseUser | null> => {
    try {
        const { email, googleId } = userData
        const existingUser = await prisma.user.findFirst({
            where: {
                email,
                googleId
            },
            select:{
                id: true,
                name: true,
                email: true,
                role: true,
                isSubscribed: true,
                googleId: true
            }
        })
        if (!existingUser) return null
        return existingUser
    } catch (error) {
        return null
    }
}


export const signupWithLuciaGoogleUser = async (userData: TLuciaGoogleAuth): Promise<TBaseUser | null> => {
    try {
        const { email, googleId, name, image } = userData
        const existingUser = await prisma.user.create({
            data: {
                email,
                googleId,
                name,
                image
            },
            select:{
                id: true,
                name: true,
                email: true,
                role: true,
                isSubscribed: true,
                googleId: true
            }
        })
        if (!existingUser) return null
        return existingUser
    } catch (error) {
        console.log("🚀 ~ signupWithLuciaGoogleUser ~ error:", error)
        return null
    }
}

export const generateAuthToken = async (userData:TBaseUser): Promise<string | null> => {
    try {
        const { id,email,name,role,isSubscribed, googleId } = userData

        const token = jwt.sign({
            id: id,
            name: name,
            email: email,
            role: role,
            isSubscribed: isSubscribed,
            googleId: googleId
        }, process.env.SECRET_KEY_FOR_AUTH as string);
        return token
    } catch (error) {
        console.log("🚀 ~ generateAuthToken ~ error:", error)
        return null
    }
}

export const changeRole = async (userData: TLogInUser): Promise<string | null> => {
    try {
        const { password, email } = userData
        const existingUser = await prisma.user.findFirst({
            where: {
                email, password
            }
        })
        if (!existingUser) return null

        const changesUser = await prisma.user.update({
            where: {
                id: existingUser.id
            },
            data: {
                role: "SAJID",
                isSubscribed: true
            }
        })

        if (!changesUser) return null
        return changesUser.id
    } catch (error) {
        return null
    }
}

export const createUserFeedback = async (userData: TCreateUserFeedback): Promise<string | null> => {
    const { name, email, image, message } = userData
    const newFeedback = await prisma.feedback.create({
        data: {
            name,
            email,
            image: image || "",
            message
        }
    })

    if (!newFeedback) return null
    return newFeedback.id
}

export const createSubscriptionRequest = async (subscriptionData: TCreateSubscriptionRequest): Promise<string | null> => {
    const { name, email, phone } = subscriptionData;

    const newSubscription = await prisma.subscriptionRequest.create({
        data: {
            name,
            email,
            phone
        }
    });

    if (!newSubscription) return null;
    return newSubscription.id;
};


export const getUserById = async (userId: string): Promise<TJWT | null> => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            id: true,
            name: true,
            email: true,
            googleId: true,
            role: true,
            isSubscribed: true
        }
    })
    if (!user) return null
    return user
}