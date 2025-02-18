import prisma from "../utils/prisma"
import { TGroup, TGroupAddMember, TGroupBase, TGroupCreate } from "./groups.schema";

export const createGroup = async (createGroupData: TGroupCreate, userId: string): Promise<string | null> => {
    const { name, description, image, slug } = createGroupData;

    const newGroup = await prisma.group.create({
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
    })

    if(!newGroup) return null

    return newGroup.id;
    
}

export const getAllGroups = async (): Promise<TGroupBase[] | null> => {
    const groups = await prisma.group.findMany({
        select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            image: true,
        }
    })

    if(!groups || groups.length === 0) return null

    return groups
}

export const addMemberToGroup = async (addMemberToGroupData: TGroupAddMember, userId: string): Promise<string | null> => {
    const { groupId, userId: memberId } = addMemberToGroupData;

    const newMember = await prisma.groupMember.create({
        data: {
            groupId,
            userId: memberId,
            groupRole: "MEMBER",
            status: "ACTIVE",
        }
    })

    if(!newMember) return null

    return newMember.id;
}