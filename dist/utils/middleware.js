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
exports.checkStreamMiddleware = exports.checkModerator = exports.getUserSession = exports.getSubscribedUserId = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const users_schema_1 = require("../users/users.schema");
const users_services_1 = require("../users/users.services");
const prisma_1 = __importDefault(require("./prisma"));
const functions_1 = require("./functions");
// this will check if the user logged in or not
// this will help create custom tests
//  if not logged in then it will use default admin as user for custom tests
const getSubscribedUserId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bearer = req.headers.authorization;
        const streamFromHeader = req.headers.stream;
        const token = bearer ? bearer.split(" ")[1] : null;
        if (token && token !== 'undefined' && token !== null) {
            const secretKey = process.env.SECRET_KEY_FOR_AUTH;
            const userFromJWT = jsonwebtoken_1.default.verify(token, secretKey);
            const user = yield (0, users_services_1.getUserById)(userFromJWT.id);
            if (user) {
                req.user = user;
                console.log('user', user);
                req.mode = user.isSubscribed ? 'USER' : 'PUBLIC';
                req.stream = user.stream;
                console.log('stream in user middleware', user.stream);
                next();
            }
        }
        else {
            // If no token or token is invalid, use default admin details
            const admin = yield prisma_1.default.user.findFirst({
                where: { role: 'SAJID' }
            });
            if (!admin) {
                return res.status(400).json({ message: "Can not create test!" });
            }
            // Handle case where stream could be string or string[] -- check if there is any present or not
            // if user logged stream will be from their database as above
            // if user not logged in then stream will be from header 
            const streamValue = Array.isArray(streamFromHeader) ? streamFromHeader[0] : streamFromHeader;
            const streamInUpperCase = streamValue === null || streamValue === void 0 ? void 0 : streamValue.toUpperCase();
            const streams = (0, functions_1.getStreams)();
            if (!streamValue || !streams.includes(streamInUpperCase)) {
                return res.status(400).json({ message: "Invalid Stream" });
            }
            req.stream = streamInUpperCase;
            req.user = admin;
            req.mode = 'PUBLIC'; //so unlogged ones will give only 10 questions
            req.user.isSubscribed = false;
            next();
        }
    }
    catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.getSubscribedUserId = getSubscribedUserId;
const getUserSession = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bearer = req.headers.authorization;
        const token = bearer ? bearer.split(" ")[1] : null;
        if (!token) {
            return res.status(401).json({ message: "Unauthenticated" });
        }
        const secretkey = process.env.SECRET_KEY_FOR_AUTH;
        const userFromJWT = jsonwebtoken_1.default.verify(token, secretkey);
        const user = (yield (0, users_services_1.getUserById)(userFromJWT.id));
        if (!user) {
            return res.status(401).json({ message: "Unauthenticated" });
        }
        req.user = user;
        req.stream = user.stream;
        next();
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.getUserSession = getUserSession;
const checkModerator = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bearer = req.headers.authorization;
        const token = bearer ? bearer.split(" ")[1] : null;
        if (!token) {
            return res.status(401).json({ message: "Unauthenticated" });
        }
        const secretkey = process.env.SECRET_KEY_FOR_AUTH;
        const userFromJWT = jsonwebtoken_1.default.verify(token, secretkey);
        const user = (yield (0, users_services_1.getUserById)(userFromJWT.id));
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!users_schema_1.ROLES_HIEARCHY.MODERATOR.includes(user.role)) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.checkModerator = checkModerator;
const checkStreamMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bearer = req.headers.authorization;
        const token = bearer ? bearer.split(" ")[1] : null;
        let user = null;
        let streamFromHeader = null;
        if (token) {
            const secretkey = process.env.SECRET_KEY_FOR_AUTH;
            try {
                const userFromJWT = jsonwebtoken_1.default.verify(token, secretkey);
                user = (yield (0, users_services_1.getUserById)(userFromJWT.id));
            }
            catch (jwtError) {
                // If JWT is invalid, consider them not logged in and proceed to check header
            }
        }
        if (user) {
            // User is logged in, set user and prioritize their stream
            req.user = user;
            req.stream = user.stream; // Assuming user object has a 'stream' property
        }
        else {
            // User is not logged in or JWT was invalid, check stream from header
            const stream = req.headers.stream;
            // Handle case where stream could be string or string[]
            const streamValue = Array.isArray(stream) ? stream[0] : stream;
            streamFromHeader = streamValue === null || streamValue === void 0 ? void 0 : streamValue.toUpperCase();
            const validStreams = (0, functions_1.getStreams)(); // Get your list of valid streams
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
    }
    catch (error) {
        console.error("checkStreamMiddleware: Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.checkStreamMiddleware = checkStreamMiddleware;
