import prisma from '../prisma/client';
import { AppError } from '../middleware/errorHandler';
import { activityService } from './activityService';
import { CreateBoardInput, UpdateBoardInput, AddMemberInput } from '../types';

export const boardService = {
    async create(input: CreateBoardInput, userId: string) {
        const board = await prisma.board.create({
            data: {
                title: input.title,
                description: input.description,
                createdById: userId,
                members: {
                    create: {
                        userId,
                        role: 'ADMIN',
                    },
                },
            },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true, avatar: true },
                },
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, avatar: true },
                        },
                    },
                },
                lists: {
                    include: {
                        tasks: {
                            include: {
                                assignees: {
                                    include: {
                                        user: {
                                            select: { id: true, name: true, email: true, avatar: true },
                                        },
                                    },
                                },
                            },
                            orderBy: { position: 'asc' },
                        },
                    },
                    orderBy: { position: 'asc' },
                },
                _count: { select: { lists: true } },
            },
        });

        await activityService.log({
            action: 'BOARD_CREATED',
            entityType: 'Board',
            entityId: board.id,
            metadata: { title: board.title },
            userId,
            boardId: board.id,
        });

        return board;
    },

    async getAll(userId: string, page: number = 1, limit: number = 10, search?: string) {
        const skip = (page - 1) * limit;

        const where = {
            members: { some: { userId } },
            ...(search
                ? { title: { contains: search, mode: 'insensitive' as const } }
                : {}),
        };

        const [boards, total] = await Promise.all([
            prisma.board.findMany({
                where,
                include: {
                    createdBy: {
                        select: { id: true, name: true, email: true, avatar: true },
                    },
                    members: {
                        include: {
                            user: {
                                select: { id: true, name: true, email: true, avatar: true },
                            },
                        },
                    },
                    _count: { select: { lists: true } },
                },
                orderBy: { updatedAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.board.count({ where }),
        ]);

        return {
            data: boards,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    async getById(boardId: string, userId: string) {
        // Verify membership
        const membership = await prisma.boardMember.findUnique({
            where: { boardId_userId: { boardId, userId } },
        });

        if (!membership) {
            throw new AppError('Board not found or access denied', 404);
        }

        const board = await prisma.board.findUnique({
            where: { id: boardId },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true, avatar: true },
                },
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, avatar: true },
                        },
                    },
                },
                lists: {
                    include: {
                        tasks: {
                            include: {
                                assignees: {
                                    include: {
                                        user: {
                                            select: { id: true, name: true, email: true, avatar: true },
                                        },
                                    },
                                },
                            },
                            orderBy: { position: 'asc' },
                        },
                    },
                    orderBy: { position: 'asc' },
                },
            },
        });

        if (!board) {
            throw new AppError('Board not found', 404);
        }

        return board;
    },

    async update(boardId: string, input: UpdateBoardInput, userId: string) {
        await this.verifyAdmin(boardId, userId);

        const board = await prisma.board.update({
            where: { id: boardId },
            data: {
                ...(input.title !== undefined && { title: input.title }),
                ...(input.description !== undefined && { description: input.description }),
            },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true, avatar: true },
                },
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, avatar: true },
                        },
                    },
                },
                lists: {
                    include: {
                        tasks: {
                            include: {
                                assignees: {
                                    include: {
                                        user: {
                                            select: { id: true, name: true, email: true, avatar: true },
                                        },
                                    },
                                },
                            },
                            orderBy: { position: 'asc' },
                        },
                    },
                    orderBy: { position: 'asc' },
                },
            },
        });

        await activityService.log({
            action: 'BOARD_UPDATED',
            entityType: 'Board',
            entityId: boardId,
            metadata: input,
            userId,
            boardId,
        });

        return board;
    },

    async delete(boardId: string, userId: string) {
        await this.verifyAdmin(boardId, userId);

        await prisma.board.delete({ where: { id: boardId } });

        return { message: 'Board deleted successfully' };
    },

    async addMember(boardId: string, input: AddMemberInput, userId: string) {
        await this.verifyAdmin(boardId, userId);

        const userToAdd = await prisma.user.findUnique({
            where: { email: input.email },
        });

        if (!userToAdd) {
            throw new AppError('User not found with that email', 404);
        }

        const existingMember = await prisma.boardMember.findUnique({
            where: { boardId_userId: { boardId, userId: userToAdd.id } },
        });

        if (existingMember) {
            throw new AppError('User is already a member of this board', 409);
        }

        const member = await prisma.boardMember.create({
            data: {
                boardId,
                userId: userToAdd.id,
                role: input.role || 'MEMBER',
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true, avatar: true },
                },
            },
        });

        await activityService.log({
            action: 'MEMBER_ADDED',
            entityType: 'BoardMember',
            entityId: member.id,
            metadata: { memberName: userToAdd.name, memberEmail: userToAdd.email },
            userId,
            boardId,
        });

        return member;
    },

    async removeMember(boardId: string, memberUserId: string, userId: string) {
        await this.verifyAdmin(boardId, userId);

        if (memberUserId === userId) {
            throw new AppError('Cannot remove yourself from the board', 400);
        }

        const member = await prisma.boardMember.findUnique({
            where: { boardId_userId: { boardId, userId: memberUserId } },
            include: {
                user: { select: { name: true, email: true } },
            },
        });

        if (!member) {
            throw new AppError('Member not found', 404);
        }

        await prisma.boardMember.delete({
            where: { id: member.id },
        });

        await activityService.log({
            action: 'MEMBER_REMOVED',
            entityType: 'BoardMember',
            entityId: member.id,
            metadata: { memberName: member.user.name },
            userId,
            boardId,
        });

        return { message: 'Member removed successfully' };
    },

    async verifyMembership(boardId: string, userId: string) {
        const membership = await prisma.boardMember.findUnique({
            where: { boardId_userId: { boardId, userId } },
        });

        if (!membership) {
            throw new AppError('Access denied', 403);
        }

        return membership;
    },

    async verifyAdmin(boardId: string, userId: string) {
        const membership = await prisma.boardMember.findUnique({
            where: { boardId_userId: { boardId, userId } },
        });

        if (!membership) {
            throw new AppError('Access denied', 403);
        }

        if (membership.role !== 'ADMIN') {
            throw new AppError('Admin access required', 403);
        }

        return membership;
    },
};
