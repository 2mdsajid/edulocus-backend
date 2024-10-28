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
    'createdAt'
>

export type TUserRole = ROLE
export type TSignUpUser = Omit<User,
    'id' |
    'image' |
    'isCompleted' |
    'ip' |
    'key' |
    'tokensUsed' |
    'institution' |
    'createdAt'
>

export type TLogInUser = {
    id?: string
    email: string;
    password: string
}

export type TJWT = TBaseUser


export type TCreateUserFeedback = Omit<Feedback, 'id' | 'createdAt'>
export type TCreateSubscriptionRequest = Omit<SubscriptionRequest, 'id' | 'createdAt'>