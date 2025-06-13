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
exports.addMemberToGroup = exports.getGroupById = exports.getAllGroupsByModerator = exports.getAllGroups = exports.createGroup = exports.isUserAlreadyInGroup = exports.isGroupIdExist = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const isGroupIdExist = (groupId) => __awaiter(void 0, void 0, void 0, function* () {
    const group = yield prisma_1.default.group.findUnique({
        where: {
            id: groupId
        }
    });
    return !!group;
});
exports.isGroupIdExist = isGroupIdExist;
const isUserAlreadyInGroup = (email, groupId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: {
            email
        }
    });
    if (!user)
        return false;
    const groupMember = yield prisma_1.default.groupMember.findFirst({
        where: {
            groupId,
            userId: user.id
        }
    });
    return !!groupMember;
});
exports.isUserAlreadyInGroup = isUserAlreadyInGroup;
const createGroup = (createGroupData, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, image, slug } = createGroupData;
    const newGroup = yield prisma_1.default.group.create({
        data: {
            name,
            description,
            image,
            slug,
            createdBy: userId,
            members: {
                create: {
                    userId,
                    groupRole: "ADMIN",
                }
            }
        }
    });
    if (!newGroup)
        return null;
    return newGroup.id;
});
exports.createGroup = createGroup;
const getAllGroups = () => __awaiter(void 0, void 0, void 0, function* () {
    const groups = yield prisma_1.default.group.findMany({
        select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            image: true,
            creator: {
                select: {
                    name: true
                }
            }
        }
    });
    if (!groups || groups.length === 0)
        return null;
    const modifiedGroups = groups.map(group => (Object.assign(Object.assign({}, group), { creatorName: group.creator.name })));
    return modifiedGroups;
});
exports.getAllGroups = getAllGroups;
const getAllGroupsByModerator = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const groups = yield prisma_1.default.group.findMany({
        where: {
            createdBy: userId
        },
        select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            image: true,
            creator: {
                select: {
                    name: true
                }
            }
        }
    });
    if (!groups || groups.length === 0)
        return null;
    const modifiedGroups = groups.map(group => (Object.assign(Object.assign({}, group), { creatorName: group.creator.name })));
    return modifiedGroups;
});
exports.getAllGroupsByModerator = getAllGroupsByModerator;
const getGroupById = (groupId) => __awaiter(void 0, void 0, void 0, function* () {
    const group = yield prisma_1.default.group.findUnique({
        where: {
            id: groupId
        },
        select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            image: true,
            creator: {
                select: {
                    name: true
                }
            },
            customTests: {
                select: {
                    name: true,
                    id: true,
                    date: true,
                }
            },
            members: {
                select: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                        },
                    },
                    joinedAt: true,
                }
            }
        }
    });
    if (!group)
        return null;
    return Object.assign(Object.assign({}, group), { creatorName: group.creator.name });
});
exports.getGroupById = getGroupById;
const addMemberToGroup = (userToAddId, groupId) => __awaiter(void 0, void 0, void 0, function* () {
    const newMember = yield prisma_1.default.groupMember.create({
        data: {
            groupId,
            userId: userToAddId,
            groupRole: "MEMBER",
            status: "ACTIVE",
        }
    });
    if (!newMember)
        return null;
    return newMember.id;
});
exports.addMemberToGroup = addMemberToGroup;
