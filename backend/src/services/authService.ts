import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/client';
import { AppError } from '../middleware/errorHandler';
import { SignupInput, LoginInput, AuthPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '7d';

export const authService = {
    async syncUser(firebaseUid: string, email: string, name?: string, photoURL?: string) {
        let user = await prisma.user.findUnique({
            where: { firebaseUid },
        });

        if (user) {
            // Update metadata if needed
            if (name || photoURL) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        name: name || user.name,
                        avatar: photoURL || user.avatar,
                    },
                });
            }
            return user;
        }

        // Try to link by email (legacy account migration)
        user = await prisma.user.findUnique({
            where: { email },
        });

        if (user) {
            return await prisma.user.update({
                where: { id: user.id },
                data: {
                    firebaseUid,
                    name: name || user.name,
                    avatar: photoURL || user.avatar,
                },
            });
        }

        // Create new user
        return await prisma.user.create({
            data: {
                email,
                firebaseUid,
                name: name || 'User',
                avatar: photoURL,
                // Password is optional in schema now
            },
        });
    },

    async signup(input: SignupInput) {
        const existingUser = await prisma.user.findUnique({
            where: { email: input.email },
        });

        if (existingUser) {
            throw new AppError('Email already registered', 409);
        }

        const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

        const user = await prisma.user.create({
            data: {
                email: input.email,
                password: hashedPassword,
                name: input.name,
            },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                createdAt: true,
            },
        });

        const token = generateToken({ userId: user.id, email: user.email });

        return { user, token };
    },

    async login(input: LoginInput) {
        const user = await prisma.user.findUnique({
            where: { email: input.email },
        });

        if (!user || !user.password) {
            throw new AppError('Invalid email or password', 401);
        }

        const isValidPassword = await bcrypt.compare(input.password, user.password);

        if (!isValidPassword) {
            throw new AppError('Invalid email or password', 401);
        }

        const token = generateToken({ userId: user.id, email: user.email });

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatar: user.avatar,
                createdAt: user.createdAt,
            },
            token,
        };
    },

    async getUserById(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        return user;
    },
};

function generateToken(payload: AuthPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}
