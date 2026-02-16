import { Response, NextFunction } from 'express';
import { listService } from '../services/listService';
import { AuthRequest } from '../types';

export const listController = {
    async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const list = await listService.create(req.body, req.user!.userId);
            res.status(201).json({ data: list });
        } catch (error) {
            next(error);
        }
    },

    async update(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const list = await listService.update(req.params.id as string, req.body, req.user!.userId);
            res.json({ data: list });
        } catch (error) {
            next(error);
        }
    },

    async delete(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await listService.delete(req.params.id as string, req.user!.userId);
            res.json(result);
        } catch (error) {
            next(error);
        }
    },
};
