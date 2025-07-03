"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChapterwiseRegistrationSchema = exports.ROLES_HIEARCHY = void 0;
exports.ROLES_HIEARCHY = {
    SAJID: ['SAJID'],
    ADMIN: ['ADMIN', 'SAJID'],
    SUPERADMIN: ['ADMIN', 'SUPERADMIN', 'SAJID'],
    MODERATOR: ['ADMIN', 'SUPERADMIN', 'MODERATOR', 'SAJID'],
    USER: ['ADMIN', 'USER', 'SUPERADMIN', 'MODERATOR', 'SAJID'],
};
const zod_1 = require("zod");
exports.ChapterwiseRegistrationSchema = zod_1.z.object({
    name: zod_1.z.string(),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string(),
    message: zod_1.z.string(),
});
