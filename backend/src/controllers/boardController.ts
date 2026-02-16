import { Response, NextFunction } from 'express';
import { boardService } from '../services/boardService';
import { activityService } from '../services/activityService';
import { AuthRequest } from '../types';

export const boardController = {
    async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const board = await boardService.create(req.body, req.user!.userId);
            res.status(201).json({ data: board });
        } catch (error) {
            next(error);
        }
    },

    async getAll(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string | undefined;

            const result = await boardService.getAll(req.user!.userId, page, limit, search);
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    async getById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const board = await boardService.getById(req.params.id as string, req.user!.userId);
            res.json({ data: board });
        } catch (error) {
            next(error);
        }
    },

    async update(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const board = await boardService.update(req.params.id as string, req.body, req.user!.userId);
            res.json({ data: board });
        } catch (error) {
            next(error);
        }
    },

    async delete(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await boardService.delete(req.params.id as string, req.user!.userId);
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    async addMember(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const member = await boardService.addMember(req.params.id as string, req.body, req.user!.userId);
            res.status(201).json({ data: member });
        } catch (error) {
            next(error);
        }
    },

    async removeMember(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await boardService.removeMember(
                req.params.id as string,
                req.params.userId as string,
                req.user!.userId
            );
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    async getActivities(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await boardService.verifyMembership(req.params.id as string, req.user!.userId);

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;

            const result = await activityService.getByBoard(req.params.id as string, page, limit);
            res.json(result);
        } catch (error) {
            next(error);
        }
    },
};
