import prisma from "../utils/prisma"
import { TGroup,  TGroupBase, TGroupCreate, TGroupDetail } from "./groups.schema";

export const isGroupIdExist = async (groupId: string): Promise<boolean> => {
    const group = await prisma.group.findUnique({
        where: {
            id: groupId
        }
    });

    return !!group;
}


export const isUserAlreadyInGroup = async (email: string, groupId: string): Promise<boolean> => {
    const user = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (!user) return false;

    const groupMember = await prisma.groupMember.findFirst({
        where: {
            groupId,
            userId: user.id
        }
    });

    return !!groupMember;
}



export const createGroup = async (createGroupData: TGroupCreate, userId: string): Promise<string | null> => {
    const { name, description, image, slug } = createGroupData;

    const newGroup = await prisma.group.create({
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
            creator: {
                select: {
                    name: true
                }
            }
        }
    })

    if(!groups || groups.length === 0) return null

    const modifiedGroups = groups.map(group => ({
        ...group,
        creatorName: group.creator.name
    }));

    return modifiedGroups
}

export const getAllGroupsByModerator = async (userId: string): Promise<TGroupBase[] | null> => {
    const groups = await prisma.group.findMany({
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

    if (!groups || groups.length === 0) return null;

    const modifiedGroups = groups.map(group => ({
        ...group,
        creatorName: group.creator.name
    }));

    return modifiedGroups;
}

export const getGroupById = async (groupId: string): Promise<TGroupDetail | null> => {
    const group = await prisma.group.findUnique({
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
            customTests:{
                select:{
                    name:true,
                    id:true,
                    date:true,
                    archive:true,
                    testLock:{
                        select:{
                            isLocked:true,
                        }
                    }
                }
            },
            members:{
                select:{
                    user:{
                        select:{
                            id:true,
                            name:true,
                            email:true,
                            image:true,
                        },
                    },
                    joinedAt:true,
                }
            }
        }
    });

    if (!group) return null;

    return {
        ...group,
        creatorName: group.creator.name,
        customTests: group.customTests.map(test => ({
            ...test,
            isLocked: test.testLock?.isLocked || false
        }))
    };
}

export const addMemberToGroup = async (userToAddId:string, groupId:string): Promise<string | null> => {

    const newMember = await prisma.groupMember.create({
        data: {
            groupId,
            userId: userToAddId,
            groupRole: "MEMBER",
            status: "ACTIVE",
        }
    })

    if(!newMember) return null

    return newMember.id;
}