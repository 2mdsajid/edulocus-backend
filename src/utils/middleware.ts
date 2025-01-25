import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ROLES_HIEARCHY, TBaseUser, TJWT } from "../users/users.schema";
import { getUserById } from "../users/users.services";
import prisma from "./prisma";
import { ModeOfTest } from "@prisma/client";



export interface RequestWithUserIdAndRole extends Request {
  user?: TBaseUser
  idFromJWT?: string
}

export interface RequestWithUserIdAndSubscription extends Request {
  userId?: string
  isSubscribed?: boolean
  mode?: ModeOfTest
}

export const checkUserExists = async (
  req: RequestWithUserIdAndRole,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const bearer = req.headers.authorization;
    const token = bearer ? bearer.split(" ")[1] : null;
    if (!token) {
      return res.status(401).json({ message: "Unauthenticated" });
    }
    const secretkey = process.env.SECRET_KEY_FOR_AUTH as string;
    const userFromJWT = jwt.verify(token, secretkey) as TJWT;
    const user = (await getUserById(userFromJWT.id)) as TJWT;
    if (!user) {
      return res.status(401).json({ message: "Unauthenticated" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


// this will check if the user logged in or not
// this will help create custom tests
export const getSubscribedUserId = async (
  req: RequestWithUserIdAndSubscription,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const bearer = req.headers.authorization;
    const token = bearer ? bearer.split(" ")[1] : null;

    if (token && token !== 'undefined' && token !== null) {
      const secretKey = process.env.SECRET_KEY_FOR_AUTH as string;
      const userFromJWT = jwt.verify(token, secretKey) as TJWT;
      const user = await getUserById(userFromJWT.id) as TJWT;

      if (user) {
        req.userId = user.id;
        req.isSubscribed = user.isSubscribed || false;
        req.mode = user.isSubscribed ? 'USER' : 'PUBLIC';
        next();
      }
    } else {


      // If no token or token is invalid, use default admin details
      const admin = await prisma.user.findFirst({
        where: { role: 'SAJID' }
      });

      if (!admin) {
        return res.status(400).json({ message: "Can not create test!" });
      }

      req.userId = admin.id;
      req.isSubscribed = false;
      req.mode = 'PUBLIC';
      next();
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};



export const getUserSession = async (
  req: RequestWithUserIdAndRole,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const bearer = req.headers.authorization;
    const token = bearer ? bearer.split(" ")[1] : null;
    if (!token) {
      return res.status(401).json({ message: "Unauthenticated" });
    }
    const secretkey = process.env.SECRET_KEY_FOR_AUTH as string;
    const userFromJWT = jwt.verify(token, secretkey) as TJWT;
    const user = (await getUserById(userFromJWT.id)) as TJWT;
    if (!user) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};



export const checkModerator = async (
  req: RequestWithUserIdAndRole,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const bearer = req.headers.authorization;
    const token = bearer ? bearer.split(" ")[1] : null;
    if (!token) {
      return res.status(401).json({ message: "Unauthenticated" });
    }
    const secretkey = process.env.SECRET_KEY_FOR_AUTH as string;
    const userFromJWT = jwt.verify(token, secretkey) as TJWT;
    const user = (await getUserById(userFromJWT.id)) as TJWT;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!ROLES_HIEARCHY.MODERATOR.includes(user.role)) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
