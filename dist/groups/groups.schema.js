"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupResponseSchema = exports.groupUpdateMemberSchema = exports.groupMemberBaseSchema = exports.groupUpdateSchema = exports.groupCreateSchema = exports.addMemberSchema = exports.GroupDetailSchema = exports.groupBaseSchema = exports.groupSchema = exports.groupMemberSchema = exports.memberStatusSchema = exports.groupRoleSchema = void 0;
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
    createdBy: zod_1.z.string({
        required_error: "User Id of Creator required"
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
    creatorName: zod_1.z.string(),
    description: zod_1.z.string().nullable(),
    image: zod_1.z.string().nullable(),
    slug: zod_1.z.string({
        required_error: "Slug is required",
    }),
});
exports.GroupDetailSchema = zod_1.z.object({
    id: zod_1.z.string().uuid("Invalid group ID format."),
    name: zod_1.z.string().min(1, "Group name cannot be empty."),
    slug: zod_1.z.string().min(1, "Group slug cannot be empty."),
    description: zod_1.z.string().nullable(), // Assuming description can be null
    image: zod_1.z.string().url("Invalid image URL format.").nullable(), // Assuming image can be null
    creatorName: zod_1.z.string(), // Assuming creator.name is always a string,
    members: zod_1.z.array(zod_1.z.object({
        user: zod_1.z.object({
            id: zod_1.z.string().uuid("Invalid member user ID format."),
            name: zod_1.z.string().nullable(), // Assuming member user name can be null
            email: zod_1.z.string().email("Invalid email format."),
            image: zod_1.z.string().url("Invalid image URL format.").nullable(), // Assuming member user image can be null
        }),
        joinedAt: zod_1.z.date(), // Assuming joinedAt is a Date object
    })),
    customTests: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string().uuid("Invalid test ID format."),
        name: zod_1.z.string().min(1, "Test name cannot be empty."),
        date: zod_1.z.date(),
    })),
});
exports.addMemberSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address. Please enter a valid email."),
});
// Schema for creating a Group
exports.groupCreateSchema = exports.groupBaseSchema.omit({
    creatorName: true,
    id: true
});
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
