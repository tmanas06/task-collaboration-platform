import { Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service';
import { AuthRequest } from '../types';

export const notificationController = {
    async getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const notifications = await notificationService.getByUser(req.user!.userId);
            res.json({ data: notifications });
        } catch (error) {
            next(error);
        }
    },

    async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await notificationService.markAsRead(req.params.id as string, req.user!.userId);
            res.json({ message: 'Notification marked as read' });
        } catch (error) {
            next(error);
        }
    },

    async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await notificationService.markAllAsRead(req.user!.userId);
            res.json({ message: 'All notifications marked as read' });
        } catch (error) {
            next(error);
        }
    },

    async delete(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await notificationService.delete(req.params.id as string, req.user!.userId);
            res.json({ message: 'Notification deleted' });
        } catch (error) {
            next(error);
        }
    },
};
