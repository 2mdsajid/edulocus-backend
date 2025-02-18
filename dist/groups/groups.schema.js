"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupResponseSchema = exports.groupUpdateMemberSchema = exports.groupAddMemberSchema = exports.groupMemberBaseSchema = exports.groupUpdateSchema = exports.groupCreateSchema = exports.groupBaseSchema = exports.groupSchema = exports.groupMemberSchema = exports.memberStatusSchema = exports.groupRoleSchema = void 0;
const zod_1 = require("zod");
// Enum for Group Roles
exports.groupRoleSchema = zod_1.z.enum(["MEMBER", "MODERATOR", "ADMIN"]);
// Enum for Member Status
exports.memberStatusSchema = zod_1.z.enum(["ACTIVE", "INACTIVE", "BANNED"]);
// Schema for GroupMember
exports.groupMemberSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    userId: zod_1.z.string({
        required_error: "User ID is required",
    }),
    groupId: zod_1.z.string({
        required_error: "Group ID is required",
    }),
    groupRole: exports.groupRoleSchema.default("MEMBER"),
    status: exports.memberStatusSchema.default("ACTIVE"),
    joinedAt: zod_1.z.date().default(new Date()),
});
// Schema for Group
exports.groupSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string({
        required_error: "Group name is required",
    }),
    description: zod_1.z.string().nullable(),
    image: zod_1.z.string().nullable(),
    slug: zod_1.z.string({
        required_error: "Slug is required",
    }),
    createdAt: zod_1.z.date().default(new Date()),
    updatedAt: zod_1.z.date().nullable(),
});
// Base schema for Group
exports.groupBaseSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string({
        required_error: "Group name is required",
    }),
    description: zod_1.z.string().nullable(),
    image: zod_1.z.string().nullable(),
    slug: zod_1.z.string({
        required_error: "Slug is required",
    }),
});
// Schema for creating a Group
exports.groupCreateSchema = exports.groupBaseSchema;
// Schema for updating a Group
exports.groupUpdateSchema = exports.groupBaseSchema.partial();
// Schema for Group Member
exports.groupMemberBaseSchema = zod_1.z.object({
    userId: zod_1.z.string({
        required_error: "User ID is required",
    }),
    name: zod_1.z.string({
        required_error: "Name is required",
    }),
    image: zod_1.z.string().nullable(),
    groupRole: exports.groupRoleSchema.default("MEMBER"),
    status: exports.memberStatusSchema.default("ACTIVE"),
});
// Schema for adding a member to a Group
exports.groupAddMemberSchema = exports.groupMemberBaseSchema.extend({
    groupId: zod_1.z.string({
        required_error: "Group ID is required",
    }),
});
// Schema for updating a Group Member
exports.groupUpdateMemberSchema = exports.groupMemberSchema
    .pick({ groupRole: true, status: true })
    .partial();
// Schema for Group Response
exports.groupResponseSchema = exports.groupBaseSchema.extend({
    id: zod_1.z.string({
        required_error: "Group ID is required",
    }),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date().nullable(),
    members: zod_1.z.array(exports.groupMemberSchema).nullable(),
    customTests: zod_1.z.array(zod_1.z.string()).nullable(),
});
