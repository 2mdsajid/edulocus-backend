"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLES_HIEARCHY = void 0;
exports.ROLES_HIEARCHY = {
    SAJID: ['SAJID'],
    ADMIN: ['ADMIN', 'SAJID'],
    SUPERADMIN: ['ADMIN', 'SUPERADMIN', 'SAJID'],
    MODERATOR: ['ADMIN', 'SUPERADMIN', 'MODERATOR', 'SAJID'],
    USER: ['ADMIN', 'USER', 'SUPERADMIN', 'MODERATOR', 'SAJID'],
};
