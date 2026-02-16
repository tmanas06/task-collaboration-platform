import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';

export const authController = {
    async signup(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.signup(req.body);
            res.status(201).json({ data: result });
        } catch (error) {
            next(error);
        }
    },

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.login(req.body);
            res.json({ data: result });
        } catch (error) {
            next(error);
        }
    },

    async sync(req: Request, res: Response, next: NextFunction) {
        try {
            const firebaseUser = (req as any).firebaseUser;
            // Fallback if middleware didn't set it (shouldn't happen with correct middleware usage)
            if (!firebaseUser) {
                throw new Error('No Firebase user found in request');
            }

            const { uid, email, name, picture } = firebaseUser;
            const { name: bodyName, photoURL } = req.body;

            const result = await authService.syncUser(
                uid,
                email,
                bodyName || name,
                photoURL || picture
            );
            res.json({ data: result });
        } catch (error) {
            next(error);
        }
    },

    async me(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await authService.getUserById((req as any).user.userId);
            res.json({ data: user });
        } catch (error) {
            next(error);
        }
    },
};
