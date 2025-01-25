import { Feedback, ROLE, SubscriptionRequest, User } from "@prisma/client";

export const ROLES_HIEARCHY = {
    SAJID: ['SAJID'],
    ADMIN: ['ADMIN', 'SAJID'],
    SUPERADMIN: ['ADMIN', 'SUPERADMIN', 'SAJID'],
    MODERATOR: ['ADMIN', 'SUPERADMIN', 'MODERATOR', 'SAJID'],
    USER: ['ADMIN', 'USER', 'SUPERADMIN', 'MODERATOR', 'SAJID'],
}

export type TBaseUser = Omit<User,
    'image' |
    'password' |
    'isCompleted' |
    'ip' |
    'key' |
    'tokensUsed' |
    'institution' |
    'createdAt' | 
    'updatedAt' |
    'emailVerified' 
>

export type TUserRole = ROLE
export type TSignUpUser = Omit<User,
    'id' |
    'googleId' |
    'isCompleted' |
    'ip' |
    'key' |
    'tokensUsed' |
    'institution' |
    'createdAt' | 
    'updatedAt' |
    'emailVerified'
>

export type TLogInUser = {
    id?: string
    googleId?: string
    email: string;
    name?: string;
    image?: string 
    password: string | null
}


export type TLuciaGoogleAuth = {
    id?: string
    googleId: string
    email: string;
    name: string;
    image: string 
}

export type TJWT = TBaseUser


export type TCreateUserFeedback = Omit<Feedback, 'id' | 'createdAt'>
export type TCreateSubscriptionRequest = Omit<SubscriptionRequest, 'id' | 'createdAt'>