import { Response, NextFunction } from 'express';
import { taskService } from '../services/taskService';
import { AuthRequest } from '../types';

export const taskController = {
    async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const task = await taskService.create(req.body, req.user!.userId);
            res.status(201).json({ data: task });
        } catch (error) {
            next(error);
        }
    },

    async update(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const task = await taskService.update(req.params.id as string, req.body, req.user!.userId);
            res.json({ data: task });
        } catch (error) {
            next(error);
        }
    },

    async move(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const task = await taskService.move(req.params.id as string, req.body, req.user!.userId);
            res.json({ data: task });
        } catch (error) {
            next(error);
        }
    },

    async delete(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await taskService.delete(req.params.id as string, req.user!.userId);
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    async assign(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const task = await taskService.assign(
                req.params.id as string,
                req.body.userId,
                req.user!.userId
            );
            res.json({ data: task });
        } catch (error) {
            next(error);
        }
    },

    async unassign(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const task = await taskService.unassign(
                req.params.id as string,
                req.params.userId as string,
                req.user!.userId
            );
            res.json({ data: task });
        } catch (error) {
            next(error);
        }
    },

    async getById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const task = await taskService.getById(req.params.id as string, req.user!.userId);
            res.json({ data: task });
        } catch (error) {
            next(error);
        }
    },
};
