"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const express_1 = __importDefault(require("express"));
const UserServices = __importStar(require("../users/users.services"));
const middleware_1 = require("../utils/middleware");
const groups_schema_1 = require("./groups.schema");
const GroupServices = __importStar(require("./groups.services"));
const router = express_1.default.Router();
router.post('/create-group', middleware_1.checkModerator, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const validationResult = groups_schema_1.groupCreateSchema.safeParse(request.body);
        if (!validationResult.success) {
            const zodErrorElement = JSON.parse(validationResult.error.message)[0];
            return response.status(400).json({ data: null, message: zodErrorElement.message });
        }
        const userId = (_a = request.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return response.status(400).json({ data: null, message: 'User not found' });
        }
        const groupId = yield GroupServices.createGroup(request.body, userId);
        console.log(groupId);
        if (!groupId) {
            return response.status(400).json({ data: null, message: 'Group creation failed' });
        }
        return response.status(201).json({ data: groupId, message: 'Group created' });
    }
    catch (error) {
        console.log(error);
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.get('/get-all-groups-by-moderator', middleware_1.checkModerator, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = request.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return response.status(400).json({ data: null, message: 'User not found' });
        }
        const groups = yield GroupServices.getAllGroupsByModerator(userId);
        if (!groups || groups.length === 0) {
            return response.status(404).json({ data: null, message: 'No groups found' });
        }
        return response.status(200).json({ data: groups, message: 'Groups fetched' });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.get('/get-group-by-id/:groupId', middleware_1.checkModerator, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const groupId = request.params.groupId;
        if (!groupId) {
            return response.status(400).json({ data: null, message: 'Group ID is required' });
        }
        const group = yield GroupServices.getGroupById(groupId);
        if (!group) {
            return response.status(404).json({ data: null, message: 'Group not found' });
        }
        return response.status(200).json({ data: group, message: 'Group fetched successfully' });
    }
    catch (error) {
        console.error('Error fetching group:', error);
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
// add member to group
router.post('/add-member/:groupId', middleware_1.checkModerator, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const validationResult = groups_schema_1.addMemberSchema.safeParse(request.body);
        if (!validationResult.success) {
            const zodErrorElement = JSON.parse(validationResult.error.message)[0];
            return response.status(400).json({ data: null, message: zodErrorElement.message });
        }
        const email = request.body.email;
        const { groupId } = request.params;
        const isGroupExist = yield GroupServices.isGroupIdExist(groupId);
        if (!isGroupExist) {
            return response.status(404).json({ data: null, message: "Group Does not exist" });
        }
        const adminUserId = (_a = request.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!adminUserId) {
            return response.status(400).json({ data: null, message: 'Not authorized' });
        }
        const userToAddId = yield UserServices.getUserIdByEmail(email);
        if (!userToAddId) {
            return response.status(400).json({ data: null, message: 'There is no user with this email address' });
        }
        const isUserAlreadyInGroup = yield GroupServices.isUserAlreadyInGroup(email, groupId);
        console.log(isUserAlreadyInGroup);
        if (isUserAlreadyInGroup) {
            return response.status(400).json({ data: null, message: 'User with this email already in the group' });
        }
        // const sendGroupInvititationEmail = sendEmail({
        //     to: request.body.email,
        //     subject: 'Invitation to join a group',
        //     html: sendGroupInvitationMailToUser({
        //         name: request.body.name,
        //         email: request.body.email,
        //         groupTitle: request.body.groupTitle
        //     })
        // })
        const newGroupMember = yield GroupServices.addMemberToGroup(userToAddId, groupId);
        if (!newGroupMember) {
            return response.status(400).json({ data: null, message: 'Unable to add member to the group' });
        }
        return response.status(200).json({ data: groupId, message: 'Member added to group successfully' });
    }
    catch (error) {
        console.log(error);
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
// delete a group
// router.delete('/delete-group', checkModerator, async (request: RequestExtended, response: Response) => {
//     try {
//         const groupId = request.body.groupId;
//         if (!groupId) {
//             return response.status(400).json({ data: null, message: 'Group not found' });
//         }
//         const deletedGroupId = await GroupServices.deleteGroup(groupId);
//         if (!deletedGroupId) {
//             return response.status(400).json({ data: null, message: 'Group not found' });
//         }
//         return response.status(200).json({ data: deletedGroupId, message: 'Group deleted' });
//     } catch (error) {
//         return response.status(500).json({ data: null, message: 'Internal Server Error' });
//     }
// })
exports.default = router;
