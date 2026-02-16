import prisma from '../prisma/client';
import { ActionType } from '@prisma/client';

interface LogActivityInput {
    action: ActionType;
    entityType: string;
    entityId: string;
    metadata?: Record<string, any>;
    userId: string;
    boardId: string;
}

export const activityService = {
    async log(input: LogActivityInput) {
        return prisma.activity.create({
            data: {
                action: input.action,
                entityType: input.entityType,
                entityId: input.entityId,
                metadata: input.metadata || {},
                userId: input.userId,
                boardId: input.boardId,
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true, avatar: true },
                },
            },
        });
    },

    async getByBoard(boardId: string, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [activities, total] = await Promise.all([
            prisma.activity.findMany({
                where: { boardId },
                include: {
                    user: {
                        select: { id: true, name: true, email: true, avatar: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.activity.count({ where: { boardId } }),
        ]);

        return {
            data: activities,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },
};
