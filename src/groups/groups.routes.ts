import express, { Response } from 'express';
import * as UserServices from '../users/users.services';
import { checkModerator, getUserSession, RequestExtended } from '../utils/middleware';
import { addMemberSchema, groupCreateSchema } from './groups.schema';
import * as GroupServices from './groups.services';
const router = express.Router();


router.post('/create-group', checkModerator, async (request: RequestExtended, response: Response) => {
    try {
        const validationResult = groupCreateSchema.safeParse(request.body);
        if (!validationResult.success) {
            const zodErrorElement = JSON.parse(validationResult.error.message)[0]
            return response.status(400).json({ data: null, message: zodErrorElement.message });
        }

        const userId = request.user?.id;
        if (!userId) {
            return response.status(400).json({ data: null, message: 'User not found' });
        }

        const groupId = await GroupServices.createGroup(request.body, userId)
        console.log(groupId)
        if (!groupId) {
            return response.status(400).json({ data: null, message: 'Group creation failed' });
        }
        return response.status(201).json({ data: groupId, message: 'Group created' });
    } catch (error) {
        console.log(error)
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
})


router.get('/get-all-groups-by-moderator', checkModerator, async (request: RequestExtended, response: Response) => {
    try {
        const userId = request.user?.id
        if (!userId) {
            return response.status(400).json({ data: null, message: 'User not found' });
        }

        const groups = await GroupServices.getAllGroupsByModerator(userId);
        if (!groups || groups.length === 0) {
            return response.status(404).json({ data: null, message: 'No groups found' });
        }
        return response.status(200).json({ data: groups, message: 'Groups fetched' });
    } catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
})


router.get('/get-group-by-id/:groupId', getUserSession, async (request: RequestExtended, response: Response) => {
    try {
        const groupId = request.params.groupId;
        if (!groupId) {
            return response.status(400).json({ data: null, message: 'Group ID is required' });
        }

        const group = await GroupServices.getGroupById(groupId);
        if (!group) {
            return response.status(404).json({ data: null, message: 'Group not found' });
        }

        return response.status(200).json({ data: group, message: 'Group fetched successfully' });
    } catch (error) {
        console.error('Error fetching group:', error);
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
});


// add member to group
router.post('/add-member/:groupId', checkModerator, async (request: RequestExtended, response: Response) => {
    try {
        const validationResult = addMemberSchema.safeParse(request.body);
        if (!validationResult.success) {
            const zodErrorElement = JSON.parse(validationResult.error.message)[0]
            return response.status(400).json({ data: null, message: zodErrorElement.message });
        }

        const email = request.body.email

        const { groupId } = request.params
        const isGroupExist = await GroupServices.isGroupIdExist(groupId)
        if (!isGroupExist) {
            return response.status(404).json({ data: null, message: "Group Does not exist" });
        }

        const adminUserId = request.user?.id;
        if (!adminUserId) {
            return response.status(400).json({ data: null, message: 'Not authorized' });
        }

        const userToAddId = await UserServices.getUserIdByEmail(email)
        if (!userToAddId) {
            return response.status(400).json({ data: null, message: 'There is no user with this email address' });
        }

        const isUserAlreadyInGroup = await GroupServices.isUserAlreadyInGroup(email, groupId)
        console.log(isUserAlreadyInGroup)
        if(isUserAlreadyInGroup){
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

        const newGroupMember = await GroupServices.addMemberToGroup(userToAddId, groupId)
        if (!newGroupMember) {
            return response.status(400).json({ data: null, message: 'Unable to add member to the group' });
        }
        return response.status(200).json({ data: groupId, message: 'Member added to group successfully' });
    } catch (error) {
        console.log(error)
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
})

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


export default router;