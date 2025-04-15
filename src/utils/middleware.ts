import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ROLES_HIEARCHY, TBaseUser, TJWT } from "../users/users.schema";
import { getUserById } from "../users/users.services";
import prisma from "./prisma";
import { ModeOfTest } from "@prisma/client";
import { getStreams } from "./functions";
import { TStream } from "./global-types";

export interface RequestExtended extends Request {
  user?: TBaseUser
  idFromJWT?: string
  stream?: TStream
  mode?: ModeOfTest
}


// this will check if the user logged in or not
// this will help create custom tests
//  if not logged in then it will use default admin as user for custom tests
export const getSubscribedUserId = async (
  req: RequestExtended,
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
        req.user = user;
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

      req.user = admin;
      req.mode = 'PUBLIC';
      next();
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};



export const getUserSession = async (
  req: RequestExtended,
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
  req: RequestExtended,
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


export const checkStreamMiddleware = async (
  req: RequestExtended,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const stream = req.headers.stream;

  // Handle case where stream could be string or string[]
  const streamValue = Array.isArray(stream) ? stream[0] : stream;
  const streamInUpperCase = streamValue?.toUpperCase() as TStream;
  console.log(streamInUpperCase)

  const streams = getStreams();
  if (!streamValue || !streams.includes(streamInUpperCase)) {
    return res.status(401).json({ message: "Stream Not Specified" });
  }

  req.stream = streamInUpperCase;
  next();
};