import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { AuthRequest } from '../types';

export const userController = {
    async search(req: Request, res: Response, next: NextFunction) {
        try {
            const { q } = req.query;
            if (!q || typeof q !== 'string') {
                return res.json({ data: [] });
            }

            const users = await prisma.user.findMany({
                where: {
                    OR: [
                        { name: { contains: q, mode: 'insensitive' } },
                        { email: { contains: q, mode: 'insensitive' } },
                    ],
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                },
                take: 10,
            });

            res.json({ data: users });
        } catch (error) {
            next(error);
        }
    },
    async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: req.user!.userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    description: true,
                    createdAt: true,
                },
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({ data: user });
        } catch (error) {
            next(error);
        }
    },

    async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { name, avatar, description } = req.body;

            const updated = await prisma.user.update({
                where: { id: req.user!.userId },
                data: {
                    ...(name !== undefined && { name }),
                    ...(avatar !== undefined && { avatar }),
                    ...(description !== undefined && { description }),
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    description: true,
                    createdAt: true,
                },
            });

            res.json({ data: updated });
        } catch (error) {
            next(error);
        }
    },
};
