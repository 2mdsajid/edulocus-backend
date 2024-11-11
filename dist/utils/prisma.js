"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma_extension_random_1 = __importDefault(require("prisma-extension-random"));
const prisma = new client_1.PrismaClient().$extends((0, prisma_extension_random_1.default)());
exports.default = prisma;
