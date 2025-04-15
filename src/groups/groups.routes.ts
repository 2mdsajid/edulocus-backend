import express, { Response } from 'express';
import { checkModerator, RequestExtended } from '../utils/middleware';
import { groupAddMemberSchema, groupCreateSchema } from './groups.schema';
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
        if (!groupId) {
            return response.status(400).json({ data: null, message: 'Group creation failed' });
        }
        return response.status(201).json({ data: groupId, message: 'Group created' });
    } catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
})


router.get('/get-all-groups', async (request: RequestExtended, response: Response) => {
    try {
        const groups = await GroupServices.getAllGroups();
        if (!groups || groups.length === 0) {
            return response.status(404).json({ data: null, message: 'No groups found' });
        }
        return response.status(200).json({ data: groups, message: 'Groups fetched' });
    } catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
})

// add member to group
router.post('/add-member-to-group', checkModerator, async (request: RequestExtended, response: Response) => {
    try {
        const validationResult = groupAddMemberSchema.safeParse(request.body);
        if (!validationResult.success) {
            const zodErrorElement = JSON.parse(validationResult.error.message)[0]
            return response.status(400).json({ data: null, message: zodErrorElement.message });
        }

        const userId = request.user?.id;
        if (!userId) {
            return response.status(400).json({ data: null, message: 'User not found' });
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


        const groupId = await GroupServices.addMemberToGroup(request.body, userId)



        if (!groupId) {
            return response.status(400).json({ data: null, message: 'Group not found' });
        }
        return response.status(200).json({ data: groupId, message: 'Member added to group' });
    } catch (error) {
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