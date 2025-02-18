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
exports.addMemberToGroup = exports.getAllGroups = exports.createGroup = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const createGroup = (createGroupData, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, image, slug } = createGroupData;
    const newGroup = yield prisma_1.default.group.create({
        data: {
            name,
            description,
            image,
            slug,
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
        }
    });
    if (!groups || groups.length === 0)
        return null;
    return groups;
});
exports.getAllGroups = getAllGroups;
const addMemberToGroup = (addMemberToGroupData, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const { groupId, userId: memberId } = addMemberToGroupData;
    const newMember = yield prisma_1.default.groupMember.create({
        data: {
            groupId,
            userId: memberId,
            groupRole: "MEMBER",
            status: "ACTIVE",
        }
    });
    if (!newMember)
        return null;
    return newMember.id;
});
exports.addMemberToGroup = addMemberToGroup;
