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
        const decodedToken = await auth.verifyIdToken(token);

        // Try to find user in DB
        const user = await prisma.user.findUnique({
            where: { firebaseUid: decodedToken.uid },
        });

        if (user) {
            // Check if email matches (optional security check)
            // Attach DB user
            req.user = { userId: user.id, email: user.email, role: 'MEMBER' }; // Role is not on User model but BoardMember, defaulting for now or removing role from payload
        } else {
            // For sync endpoint, we strictly need to pass through if token is valid
            // accessing req.path might be unreliable with routers, but let's try
            // Or we just attach firebaseUser and let controller handle "User not found"
            req.firebaseUser = decodedToken;
        }

        // We can also allow migration by email if firebaseUid is missing but email exists?
        // Better handle that in syncUser.

        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        res.status(401).json({ error: 'Invalid or expired token', details: (error as any).message });
    }
};
