import { z } from "zod";

// Enum for Group Roles
export const groupRoleSchema = z.enum(["MEMBER", "MODERATOR", "ADMIN"]);

// Enum for Member Status
export const memberStatusSchema = z.enum(["ACTIVE", "INACTIVE", "BANNED"]);

// Schema for GroupMember
export const groupMemberSchema = z.object({
  id: z.string().uuid(),
  userId: z.string({
    required_error: "User ID is required",
  }),
  groupId: z.string({
    required_error: "Group ID is required",
  }),
  groupRole: groupRoleSchema.default("MEMBER"),
  status: memberStatusSchema.default("ACTIVE"),
  joinedAt: z.date().default(new Date()),
});

// Schema for Group
export const groupSchema = z.object({
  id: z.string().uuid(),
  name: z.string({
    required_error: "Group name is required",
  }),
  createdBy: z.string({
    required_error :"User Id of Creator required"
  }),
  description: z.string().nullable(),
  image: z.string().nullable(),
  slug: z.string({
    required_error: "Slug is required",
  }),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().nullable(),
});


// Base schema for Group
export const groupBaseSchema = z.object({
  id: z.string().uuid(),
  name: z.string({
    required_error: "Group name is required",
  }),
  creatorName : z.string(),
  description: z.string().nullable(),
  image: z.string().nullable(),
  slug: z.string({
    required_error: "Slug is required",
  }),
});

export const GroupDetailSchema = z.object({
  id: z.string().uuid("Invalid group ID format."),
  name: z.string().min(1, "Group name cannot be empty."),
  slug: z.string().min(1, "Group slug cannot be empty."),
  description: z.string().nullable(), // Assuming description can be null
  image: z.string().url("Invalid image URL format.").nullable(), // Assuming image can be null
  creatorName:  z.string(), // Assuming creator.name is always a string,
  members: z.array(
    z.object({
      user: z.object({
        id: z.string().uuid("Invalid member user ID format."),
        name: z.string().nullable(), // Assuming member user name can be null
        email: z.string().email("Invalid email format."),
        image: z.string().url("Invalid image URL format.").nullable(), // Assuming member user image can be null
      }),
      joinedAt: z.date(), // Assuming joinedAt is a Date object
    })
  ),
  customTests: z.array(
    z.object({
      id: z.string().uuid("Invalid test ID format."),
      name: z.string().min(1, "Test name cannot be empty."),
      date: z.date(),
    })
  ),
});


export const addMemberSchema = z.object({
  email: z.string().email("Invalid email address. Please enter a valid email."),
});






// Schema for creating a Group
export const groupCreateSchema = groupBaseSchema.omit({
  creatorName:true,
  id:true
})

// Schema for updating a Group
export const groupUpdateSchema = groupBaseSchema.partial();

// Schema for Group Member
export const groupMemberBaseSchema = z.object({
  userId: z.string({
    required_error: "User ID is required",
  }),
  name: z.string({
    required_error: "Name is required",
  }),
  image: z.string().nullable(),
  groupRole: groupRoleSchema.default("MEMBER"),
  status: memberStatusSchema.default("ACTIVE"),
});


// Schema for updating a Group Member
export const groupUpdateMemberSchema = groupMemberSchema
.pick({ groupRole: true, status: true })
.partial();

// Schema for Group Response
export const groupResponseSchema = groupBaseSchema.extend({
  id: z.string({
    required_error: "Group ID is required",
  }),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
  members: z.array(groupMemberSchema).nullable(),
  customTests: z.array(z.string()).nullable(),
});



// Type inference for Group and GroupMember
export type TGroupRole = z.infer<typeof groupRoleSchema>;
export type TMemberStatus = z.infer<typeof memberStatusSchema>;

export type TGroup = z.infer<typeof groupSchema>;


export type TGroupBase = z.infer<typeof groupBaseSchema>;
export type TGroupDetail = z.infer<typeof GroupDetailSchema>;

export type TAddMember = z.infer<typeof addMemberSchema>;

export type TGroupCreate = z.infer<typeof groupCreateSchema>;
export type TGroupUpdate = z.infer<typeof groupUpdateSchema>;
export type TGroupMember = z.infer<typeof groupMemberSchema>;
export type TGroupUpdateMember = z.infer<typeof groupUpdateMemberSchema>;
export type TGroupResponse = z.infer<typeof groupResponseSchema>;