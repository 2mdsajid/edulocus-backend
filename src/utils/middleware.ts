import { Request, Response, NextFunction, response } from "express";
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
    const streamFromHeader = req.headers.stream;
    const token = bearer ? bearer.split(" ")[1] : null;

    if (token && token !== 'undefined' && token !== null) {
      const secretKey = process.env.SECRET_KEY_FOR_AUTH as string;
      const userFromJWT = jwt.verify(token, secretKey) as TJWT;
      const user = await getUserById(userFromJWT.id) as TJWT;

      if (user) {
        req.user = user;
        console.log('user', user)
        req.mode = user.isSubscribed ? 'USER' : 'PUBLIC';
        req.stream = user.stream
        console.log('stream in user middleware', user.stream)
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

      // Handle case where stream could be string or string[] -- check if there is any present or not
      // if user logged stream will be from their database as above
      // if user not logged in then stream will be from header 
      const streamValue = Array.isArray(streamFromHeader) ? streamFromHeader[0] : streamFromHeader;
      const streamInUpperCase = streamValue?.toUpperCase() as TStream;

      const streams = getStreams();
      if (!streamValue || !streams.includes(streamInUpperCase)) {
        return res.status(400).json({ message: "Invalid Stream" });
      }

      req.stream = streamInUpperCase as TStream

      req.user = admin;
      req.mode = 'PUBLIC'; //so unlogged ones will give only 10 questions
      req.user.isSubscribed = false;
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
    req.stream = user.stream
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
  try {
    const bearer = req.headers.authorization;
    const token = bearer ? bearer.split(" ")[1] : null;

    let user: TJWT | null = null;
    let streamFromHeader: TStream | null = null;

    if (token) {
      const secretkey = process.env.SECRET_KEY_FOR_AUTH as string;
      try {
        const userFromJWT = jwt.verify(token, secretkey) as TJWT;
        user = (await getUserById(userFromJWT.id)) as TJWT;
      } catch (jwtError) {
        // If JWT is invalid, consider them not logged in and proceed to check header
      }
    }

    if (user) {
      // User is logged in, set user and prioritize their stream
      req.user = user;
      req.stream = (user as any).stream; // Assuming user object has a 'stream' property
    } else {
      // User is not logged in or JWT was invalid, check stream from header
      const stream = req.headers.stream;

      // Handle case where stream could be string or string[]
      const streamValue = Array.isArray(stream) ? stream[0] : stream;
      streamFromHeader = streamValue?.toUpperCase() as TStream;

      const validStreams = getStreams(); // Get your list of valid streams
      if (!streamFromHeader || !validStreams.includes(streamFromHeader)) {
        return res.status(401).json({ message: "Stream Not Specified or Invalid" });
      }
      req.stream = streamFromHeader;
    }

    // If neither user session nor header provided a valid stream (shouldn't happen with the above logic,
    // but good for explicit safety), or if stream isn't set for some reason.
    if (!req.stream) {
      return res.status(401).json({ message: "Stream information missing." });
    }

    next();
  } catch (error) {
    console.error("checkStreamMiddleware: Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};