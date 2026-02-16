import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Validation schemas
export const signupSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(1, 'Name is required').max(100),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const syncSchema = z.object({
    name: z.string().optional(),
    photoURL: z.string().url('Invalid photo URL').optional().or(z.literal('')),
});

export const createBoardSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().max(1000).optional(),
});

export const updateBoardSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
});

export const createListSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    boardId: z.string().uuid('Invalid board ID'),
});

export const updateListSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    position: z.number().int().min(0).optional(),
});

export const createTaskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(500),
    description: z.string().max(5000).optional(),
    listId: z.string().uuid('Invalid list ID'),
    dueDate: z.string().datetime().optional(),
});

export const updateTaskSchema = z.object({
    title: z.string().min(1).max(500).optional(),
    description: z.string().max(5000).optional().nullable(),
    dueDate: z.string().datetime().optional().nullable(),
});

export const moveTaskSchema = z.object({
    listId: z.string().uuid('Invalid list ID'),
    position: z.number().int().min(0),
});

export const assignTaskSchema = z.object({
    userId: z.string().uuid('Invalid user ID'),
});

export const addMemberSchema = z.object({
    email: z.string().email('Invalid email address'),
    role: z.enum(['ADMIN', 'MEMBER']).optional(),
});

// Generic validation middleware factory
export const validate = (schema: z.ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const message = error.errors.map((e) => e.message).join(', ');
                res.status(400).json({ error: message });
                return;
            }
            next(error);
        }
    };
};
