import prisma from '../prisma/client';
import { ActionType } from '@prisma/client';
import { notificationService } from './notification.service';
import { socketService } from './socketService';

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
        const activity = await prisma.activity.create({
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
                board: {
                    select: { title: true },
                },
            },
        });

        // Trigger notifications based on action
        try {
            await this.handleNotifications(activity);
        } catch (error) {
            console.error('Error handling notifications for activity:', error);
        }

        // Emit real-time event
        socketService.emitToBoard(input.boardId, 'activity:created', activity);

        return activity;
    },

    async handleNotifications(activity: any) {
        const { action, userId, boardId, metadata, user, board } = activity;

        // Example: Notify board owner when someone joins/is added (except owner)
        // This requires fetching board members which might be expensive here.
        // For now, let's focus on Task Assignment which is a direct notification.

        if (action === ActionType.TASK_ASSIGNED) {
            const assignedUserId = metadata?.assignedUserId;
            const taskTitle = metadata?.title;

            if (assignedUserId && assignedUserId !== userId) {
                await notificationService.create({
                    userId: assignedUserId,
                    title: 'New Task Assigned',
                    message: `${user.name} assigned you to task: ${taskTitle}`,
                    type: 'task',
                    link: `/board/${boardId}`,
                });
            }
        }

        if (action === ActionType.MEMBER_ADDED) {
            const addedUserId = metadata?.memberUserId;
            if (addedUserId && addedUserId !== userId) {
                await notificationService.create({
                    userId: addedUserId,
                    title: 'Added to Board',
                    message: `${user.name} added you to board: ${board.title}`,
                    type: 'board',
                    link: `/board/${boardId}`,
                });
            }
        }
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
                    board: {
                        select: { title: true },
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
