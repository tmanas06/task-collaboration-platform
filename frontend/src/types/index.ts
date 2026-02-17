export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string | null;
    description?: string | null;
    createdAt: string;
}

export type Role = 'ADMIN' | 'EDITOR' | 'VIEWER' | 'MEMBER';

export interface BoardMember {
    id: string;
    boardId: string;
    userId: string;
    role: Role;
    joinedAt: string;
    user: User;
}

export interface TaskAssignee {
    id: string;
    taskId: string;
    userId: string;
    assignedAt: string;
    user: User;
}

export interface Task {
    id: string;
    title: string;
    description?: string | null;
    position: number;
    listId: string;
    dueDate?: string | null;
    createdAt: string;
    updatedAt: string;
    assignees: TaskAssignee[];
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface List {
    id: string;
    title: string;
    position: number;
    boardId: string;
    createdAt: string;
    updatedAt: string;
    tasks: Task[];
}

export interface Board {
    id: string;
    title: string;
    description?: string | null;
    createdById: string;
    createdAt: string;
    updatedAt: string;
    createdBy: User;
    members: BoardMember[];
    lists: List[];
    _count?: { lists: number };
}

export interface Activity {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: Record<string, any>;
    userId: string;
    boardId: string;
    createdAt: string;
    user: User;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: Pagination;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface ApiResponse<T> {
    data: T;
}

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    link?: string | null;
    createdAt: string;
}
