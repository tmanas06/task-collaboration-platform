import axios from 'axios';
import type {
    AuthResponse,
    Board,
    List,
    Task,
    BoardMember,
    Activity,
    ApiResponse,
    PaginatedResponse,
    User,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: { 'Content-Type': 'application/json' },
});

import { auth } from '../config/firebase';

// Add token to all requests
api.interceptors.request.use(async (config) => {
    const user = auth.currentUser;
    if (user) {
        try {
            const token = await user.getIdToken();
            console.log(`API Interceptor: Attaching token for ${config.url}`);
            config.headers.Authorization = `Bearer ${token}`;
        } catch (error) {
            console.error('Error getting token', error);
        }
    } else {
        console.warn(`API Interceptor: No active Firebase user for ${config.url}`);
    }
    return config;
});

// Handle 401 responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Optional: Handle token refresh or logout if needed
        // Firebase handles token refresh automatically, but if backend rejects:
        return Promise.reject(error);
    }
);

// Auth
export const authApi = {
    syncUser: (data: { email: string; name?: string; photoURL?: string }) =>
        api.post<ApiResponse<User>>('/auth/sync', data).then((r) => r.data.data),

    me: () => api.get<ApiResponse<User>>('/auth/me').then((r) => r.data.data),
};

// Boards
export const boardsApi = {
    getAll: (page = 1, limit = 10, search?: string) =>
        api
            .get<PaginatedResponse<Board>>('/boards', { params: { page, limit, search } })
            .then((r) => r.data),

    getById: (id: string) =>
        api.get<ApiResponse<Board>>(`/boards/${id}`).then((r) => r.data.data),

    create: (data: { title: string; description?: string }) =>
        api.post<ApiResponse<Board>>('/boards', data).then((r) => r.data.data),

    update: (id: string, data: { title?: string; description?: string }) =>
        api.put<ApiResponse<Board>>(`/boards/${id}`, data).then((r) => r.data.data),

    delete: (id: string) => api.delete(`/boards/${id}`).then((r) => r.data),

    addMember: (id: string, data: { email: string; role?: 'ADMIN' | 'MEMBER' }) =>
        api.post<ApiResponse<BoardMember>>(`/boards/${id}/members`, data).then((r) => r.data.data),

    removeMember: (boardId: string, userId: string) =>
        api.delete(`/boards/${boardId}/members/${userId}`).then((r) => r.data),

    getActivities: (id: string, page = 1, limit = 20) =>
        api
            .get<PaginatedResponse<Activity>>(`/boards/${id}/activities`, {
                params: { page, limit },
            })
            .then((r) => r.data),
};

// Lists
export const listsApi = {
    create: (data: { title: string; boardId: string }) =>
        api.post<ApiResponse<List>>('/lists', data).then((r) => r.data.data),

    update: (id: string, data: { title?: string; position?: number }) =>
        api.put<ApiResponse<List>>(`/lists/${id}`, data).then((r) => r.data.data),

    delete: (id: string) => api.delete(`/lists/${id}`).then((r) => r.data),
};

// Tasks
export const tasksApi = {
    create: (data: { title: string; description?: string; listId: string; dueDate?: string }) =>
        api.post<ApiResponse<Task>>('/tasks', data).then((r) => r.data.data),

    update: (id: string, data: { title?: string; description?: string; dueDate?: string | null }) =>
        api.put<ApiResponse<Task>>(`/tasks/${id}`, data).then((r) => r.data.data),

    move: (id: string, data: { listId: string; position: number }) =>
        api.put<ApiResponse<Task>>(`/tasks/${id}/move`, data).then((r) => r.data.data),

    delete: (id: string) => api.delete(`/tasks/${id}`).then((r) => r.data),

    assign: (id: string, userId: string) =>
        api.post<ApiResponse<Task>>(`/tasks/${id}/assign`, { userId }).then((r) => r.data.data),

    unassign: (taskId: string, userId: string) =>
        api.delete(`/tasks/${taskId}/assign/${userId}`).then((r) => r.data),
};

// Users
export const usersApi = {
    search: (q: string) =>
        api.get<ApiResponse<User[]>>('/users/search', { params: { q } }).then((r) => r.data.data),
};

export default api;
