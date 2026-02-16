import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';

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
};
