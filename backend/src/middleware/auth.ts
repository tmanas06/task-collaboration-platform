import { Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import { AuthRequest } from '../types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }

        const token = authHeader.split(' ')[1];
        console.log(`Auth middleware: Verifying token for request to ${req.path}`);

        const decodedToken = await auth.verifyIdToken(token);
        console.log(`Auth middleware: Token verified for UID ${decodedToken.uid}`);

        // Always attach firebaseUser for sync and other logic
        req.firebaseUser = decodedToken;

        // Try to find user in DB
        const user = await prisma.user.findUnique({
            where: { firebaseUid: decodedToken.uid },
        });

        if (user) {
            console.log(`Auth middleware: Found DB user ${user.id}`);
            // Attach DB user
            req.user = { userId: user.id, email: user.email, role: 'MEMBER' };
        } else {
            console.warn(`Auth middleware: No DB user found for UID ${decodedToken.uid}`);
        }

        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error);

        // Distinguish between auth errors and DB/Runtime errors
        if ((error as any).code?.startsWith('P') || (error as any).message?.includes('Prisma')) {
            res.status(500).json({
                error: 'Database connection error',
                details: 'The server is unable to reach the database. Please check connectivity.'
            });
            return;
        }

        res.status(401).json({ error: 'Invalid or expired token', details: (error as any).message });
    }
};
