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
exports.checkModerator = exports.getUserSession = exports.getSubscribedUserId = exports.checkUserExists = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const users_schema_1 = require("../users/users.schema");
const users_services_1 = require("../users/users.services");
const prisma_1 = __importDefault(require("./prisma"));
const checkUserExists = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        next();
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.checkUserExists = checkUserExists;
// this will check if the user logged in or not
// this will help create custom tests
const getSubscribedUserId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bearer = req.headers.authorization;
        const token = bearer ? bearer.split(" ")[1] : null;
        if (token && token !== 'undefined' && token !== null) {
            const secretKey = process.env.SECRET_KEY_FOR_AUTH;
            const userFromJWT = jsonwebtoken_1.default.verify(token, secretKey);
            const user = yield (0, users_services_1.getUserById)(userFromJWT.id);
            if (user) {
                req.userId = user.id;
                req.isSubscribed = user.isSubscribed || false;
                req.mode = user.isSubscribed ? 'USER' : 'PUBLIC';
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
            req.userId = admin.id;
            req.isSubscribed = false;
            req.mode = 'PUBLIC';
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
