"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailSchema = void 0;
const zod_1 = require("zod");
exports.sendEmailSchema = zod_1.z.object({
    to: zod_1.z.string().email(),
    subject: zod_1.z.string(),
    bcc: zod_1.z.array(zod_1.z.string()).optional(),
    html: zod_1.z.string(),
});
