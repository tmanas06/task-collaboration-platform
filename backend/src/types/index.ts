import { Request } from 'express';

import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthPayload {
    userId: string;
    email: string;
    role?: string; // Optional for now
}

export interface AuthRequest extends Request {
    user?: AuthPayload;
    firebaseUser?: DecodedIdToken;
}

export interface PaginationQuery {
    page?: string;
    limit?: string;
    search?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface CreateBoardInput {
    title: string;
    description?: string;
}

export interface UpdateBoardInput {
    title?: string;
    description?: string;
}

export interface CreateListInput {
    title: string;
    boardId: string;
}

export interface UpdateListInput {
    title?: string;
    position?: number;
}

export interface CreateTaskInput {
    title: string;
    description?: string;
    listId: string;
    dueDate?: string;
}

export interface UpdateTaskInput {
    title?: string;
    description?: string;
    dueDate?: string | null;
}

export interface MoveTaskInput {
    listId: string;
    position: number;
}

export interface AssignTaskInput {
    userId: string;
}

export interface AddMemberInput {
    email: string;
    role?: 'ADMIN' | 'MEMBER';
}

export interface SignupInput {
    email: string;
    password: string;
    name: string;
}

export interface LoginInput {
    email: string;
    password: string;
}
