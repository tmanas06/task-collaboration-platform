import prisma from '../prisma/client';

interface CreateNotificationInput {
    userId: string;
    title: string;
    message: string;
    type?: string;
    link?: string;
}

export const notificationService = {
    async create(input: CreateNotificationInput) {
        return prisma.notification.create({
            data: {
                userId: input.userId,
                title: input.title,
                message: input.message,
                type: input.type || 'info',
                link: input.link,
            },
        });
    },

    async getByUser(userId: string, limit = 50) {
        return prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    },

    async markAsRead(id: string, userId: string) {
        return prisma.notification.updateMany({
            where: { id, userId },
            data: { read: true },
        });
    },

    async markAllAsRead(userId: string) {
        return prisma.notification.updateMany({
            where: { userId },
            data: { read: true },
        });
    },

    async delete(id: string, userId: string) {
        return prisma.notification.deleteMany({
            where: { id, userId },
        });
    },
};
