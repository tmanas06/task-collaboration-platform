import { create } from 'zustand';
import { boardsApi, listsApi, tasksApi } from '../services/api';
import type { Board, List, Task, Pagination, Activity } from '../types';

interface BoardState {
    boards: Board[];
    currentBoard: Board | null;
    pagination: Pagination | null;
    isLoading: boolean;
    error: string | null;
    activities: Activity[];
    activityPagination: Pagination | null;

    // Board CRUD
    fetchBoards: (page?: number, limit?: number, search?: string) => Promise<void>;
    fetchBoard: (id: string) => Promise<void>;
    createBoard: (title: string, description?: string) => Promise<Board>;
    updateBoard: (id: string, data: { title?: string; description?: string }) => Promise<void>;
    deleteBoard: (id: string) => Promise<void>;
    fetchActivities: (id: string, page?: number, limit?: number) => Promise<void>;

    // List CRUD
    createList: (title: string, boardId: string) => Promise<void>;
    updateList: (id: string, data: { title?: string }) => Promise<void>;
    deleteList: (id: string) => Promise<void>;

    // Task CRUD
    createTask: (title: string, listId: string, description?: string) => Promise<void>;
    updateTask: (id: string, data: { title?: string; description?: string; dueDate?: string | null }) => Promise<void>;
    moveTask: (taskId: string, toListId: string, newPosition: number) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    assignTask: (taskId: string, userId: string) => Promise<void>;
    unassignTask: (taskId: string, userId: string) => Promise<void>;

    // Real-time event handlers
    handleTaskCreated: (task: Task & { boardId: string }) => void;
    handleTaskUpdated: (task: Task & { boardId: string }) => void;
    handleTaskMoved: (task: Task & { boardId: string }) => void;
    handleTaskDeleted: (data: { boardId: string; listId: string; taskId: string }) => void;
    handleListCreated: (list: List & { boardId?: string }) => void;
    handleListUpdated: (list: List) => void;
    handleListDeleted: (data: { boardId: string; listId: string }) => void;
    handleMemberAdded: (data: any) => void;

    clearError: () => void;
    clearCurrentBoard: () => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
    boards: [],
    currentBoard: null,
    pagination: null,
    isLoading: false,
    error: null,
    activities: [],
    activityPagination: null,

    // ───── Board CRUD ─────

    fetchBoards: async (page = 1, limit = 10, search?: string) => {
        set({ isLoading: true, error: null });
        try {
            const result = await boardsApi.getAll(page, limit, search);
            set({ boards: result.data, pagination: result.pagination, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.error || 'Failed to fetch boards', isLoading: false });
        }
    },

    fetchBoard: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const board = await boardsApi.getById(id);
            set({ currentBoard: board, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.error || 'Failed to fetch board', isLoading: false });
        }
    },

    createBoard: async (title: string, description?: string) => {
        try {
            const board = await boardsApi.create({ title, description });
            set((state) => ({ boards: [board, ...state.boards] }));
            return board;
        } catch (error: any) {
            set({ error: error.response?.data?.error || 'Failed to create board' });
            throw error;
        }
    },

    updateBoard: async (id: string, data) => {
        try {
            const updated = await boardsApi.update(id, data);
            set((state) => ({
                boards: state.boards.map((b) => (b.id === id ? updated : b)),
                currentBoard: state.currentBoard?.id === id ? updated : state.currentBoard,
            }));
        } catch (error: any) {
            set({ error: error.response?.data?.error || 'Failed to update board' });
            throw error;
        }
    },

    deleteBoard: async (id: string) => {
        try {
            await boardsApi.delete(id);
            set((state) => ({
                boards: state.boards.filter((b) => b.id !== id),
                currentBoard: state.currentBoard?.id === id ? null : state.currentBoard,
            }));
        } catch (error: any) {
            set({ error: error.response?.data?.error || 'Failed to delete board' });
            throw error;
        }
    },

    fetchActivities: async (id: string, page = 1, limit = 20) => {
        set({ isLoading: true, error: null });
        try {
            const result = await boardsApi.getActivities(id, page, limit);
            set((state) => ({
                activities: page === 1 ? result.data : [...state.activities, ...result.data],
                activityPagination: result.pagination,
                isLoading: false,
            }));
        } catch (error: any) {
            set({ error: error.response?.data?.error || 'Failed to fetch activities', isLoading: false });
        }
    },

    // ───── List CRUD ─────

    createList: async (title: string, boardId: string) => {
        try {
            const list = await listsApi.create({ title, boardId });
            set((state) => {
                if (!state.currentBoard) return state;
                return {
                    currentBoard: {
                        ...state.currentBoard,
                        lists: [...state.currentBoard.lists, { ...list, boardId }],
                    },
                };
            });
        } catch (error: any) {
            set({ error: error.response?.data?.error || 'Failed to create list' });
            throw error;
        }
    },

    updateList: async (id: string, data) => {
        try {
            const updated = await listsApi.update(id, data);
            set((state) => {
                if (!state.currentBoard) return state;
                return {
                    currentBoard: {
                        ...state.currentBoard,
                        lists: state.currentBoard.lists.map((l) =>
                            l.id === id ? { ...l, ...updated } : l
                        ),
                    },
                };
            });
        } catch (error: any) {
            set({ error: error.response?.data?.error || 'Failed to update list' });
            throw error;
        }
    },

    deleteList: async (id: string) => {
        // Optimistic update
        const prevBoard = get().currentBoard;
        set((state) => {
            if (!state.currentBoard) return state;
            return {
                currentBoard: {
                    ...state.currentBoard,
                    lists: state.currentBoard.lists.filter((l) => l.id !== id),
                },
            };
        });

        try {
            await listsApi.delete(id);
        } catch (error: any) {
            // Rollback
            set({ currentBoard: prevBoard, error: error.response?.data?.error || 'Failed to delete list' });
            throw error;
        }
    },

    // ───── Task CRUD ─────

    createTask: async (title: string, listId: string, description?: string) => {
        try {
            const task = await tasksApi.create({ title, listId, description });
            set((state) => {
                if (!state.currentBoard) return state;
                return {
                    currentBoard: {
                        ...state.currentBoard,
                        lists: state.currentBoard.lists.map((l) =>
                            l.id === listId ? { ...l, tasks: [...l.tasks, task] } : l
                        ),
                    },
                };
            });
        } catch (error: any) {
            set({ error: error.response?.data?.error || 'Failed to create task' });
            throw error;
        }
    },

    updateTask: async (id: string, data) => {
        try {
            const updated = await tasksApi.update(id, data);
            set((state) => {
                if (!state.currentBoard) return state;
                return {
                    currentBoard: {
                        ...state.currentBoard,
                        lists: state.currentBoard.lists.map((l) => ({
                            ...l,
                            tasks: l.tasks.map((t) => (t.id === id ? { ...t, ...updated } : t)),
                        })),
                    },
                };
            });
        } catch (error: any) {
            set({ error: error.response?.data?.error || 'Failed to update task' });
            throw error;
        }
    },

    moveTask: async (taskId: string, toListId: string, newPosition: number) => {
        // Optimistic update
        const prevBoard = get().currentBoard;

        set((state) => {
            if (!state.currentBoard) return state;
            const board = { ...state.currentBoard };
            let movedTask: Task | null = null;

            // Remove task from source list
            const updatedLists = board.lists.map((list) => {
                const taskIndex = list.tasks.findIndex((t) => t.id === taskId);
                if (taskIndex !== -1) {
                    movedTask = { ...list.tasks[taskIndex] };
                    return {
                        ...list,
                        tasks: list.tasks.filter((t) => t.id !== taskId),
                    };
                }
                return list;
            });

            if (!movedTask) return state;

            // Add task to destination list at position
            const finalLists = updatedLists.map((list) => {
                if (list.id === toListId) {
                    const tasks = [...list.tasks];
                    tasks.splice(newPosition, 0, { ...movedTask!, listId: toListId, position: newPosition });
                    return { ...list, tasks: tasks.map((t, i) => ({ ...t, position: i })) };
                }
                return {
                    ...list,
                    tasks: list.tasks.map((t, i) => ({ ...t, position: i })),
                };
            });

            return { currentBoard: { ...board, lists: finalLists } };
        });

        try {
            await tasksApi.move(taskId, { listId: toListId, position: newPosition });
        } catch (error: any) {
            // Rollback
            set({ currentBoard: prevBoard, error: error.response?.data?.error || 'Failed to move task' });
        }
    },

    deleteTask: async (id: string) => {
        const prevBoard = get().currentBoard;
        set((state) => {
            if (!state.currentBoard) return state;
            return {
                currentBoard: {
                    ...state.currentBoard,
                    lists: state.currentBoard.lists.map((l) => ({
                        ...l,
                        tasks: l.tasks.filter((t) => t.id !== id),
                    })),
                },
            };
        });

        try {
            await tasksApi.delete(id);
        } catch (error: any) {
            set({ currentBoard: prevBoard, error: error.response?.data?.error || 'Failed to delete task' });
        }
    },

    assignTask: async (taskId: string, userId: string) => {
        try {
            const updated = await tasksApi.assign(taskId, userId);
            set((state) => {
                if (!state.currentBoard) return state;
                return {
                    currentBoard: {
                        ...state.currentBoard,
                        lists: state.currentBoard.lists.map((l) => ({
                            ...l,
                            tasks: l.tasks.map((t) => (t.id === taskId ? { ...t, ...updated } : t)),
                        })),
                    },
                };
            });
        } catch (error: any) {
            set({ error: error.response?.data?.error || 'Failed to assign task' });
        }
    },

    unassignTask: async (taskId: string, userId: string) => {
        try {
            await tasksApi.unassign(taskId, userId);
            set((state) => {
                if (!state.currentBoard) return state;
                return {
                    currentBoard: {
                        ...state.currentBoard,
                        lists: state.currentBoard.lists.map((l) => ({
                            ...l,
                            tasks: l.tasks.map((t) =>
                                t.id === taskId
                                    ? { ...t, assignees: t.assignees.filter((a) => a.userId !== userId) }
                                    : t
                            ),
                        })),
                    },
                };
            });
        } catch (error: any) {
            set({ error: error.response?.data?.error || 'Failed to unassign task' });
        }
    },

    // ───── Real-time Event Handlers ─────

    handleTaskCreated: (task) => {
        set((state) => {
            if (!state.currentBoard) return state;
            // Skip if task already exists (created by current user)
            const exists = state.currentBoard.lists.some((l) =>
                l.tasks.some((t) => t.id === task.id)
            );
            if (exists) return state;

            return {
                currentBoard: {
                    ...state.currentBoard,
                    lists: state.currentBoard.lists.map((l) =>
                        l.id === task.listId ? { ...l, tasks: [...l.tasks, task] } : l
                    ),
                },
            };
        });
    },

    handleTaskUpdated: (task) => {
        set((state) => {
            if (!state.currentBoard) return state;
            return {
                currentBoard: {
                    ...state.currentBoard,
                    lists: state.currentBoard.lists.map((l) => ({
                        ...l,
                        tasks: l.tasks.map((t) => (t.id === task.id ? { ...t, ...task } : t)),
                    })),
                },
            };
        });
    },

    handleTaskMoved: (task) => {
        set((state) => {
            if (!state.currentBoard) return state;
            // Remove from all lists, add to correct list
            const listsWithoutTask = state.currentBoard.lists.map((l) => ({
                ...l,
                tasks: l.tasks.filter((t) => t.id !== task.id),
            }));

            return {
                currentBoard: {
                    ...state.currentBoard,
                    lists: listsWithoutTask.map((l) =>
                        l.id === task.listId
                            ? { ...l, tasks: [...l.tasks, task].sort((a, b) => a.position - b.position) }
                            : l
                    ),
                },
            };
        });
    },

    handleTaskDeleted: (data) => {
        set((state) => {
            if (!state.currentBoard) return state;
            return {
                currentBoard: {
                    ...state.currentBoard,
                    lists: state.currentBoard.lists.map((l) => ({
                        ...l,
                        tasks: l.tasks.filter((t) => t.id !== data.taskId),
                    })),
                },
            };
        });
    },

    handleListCreated: (list) => {
        set((state) => {
            if (!state.currentBoard) return state;
            const exists = state.currentBoard.lists.some((l) => l.id === list.id);
            if (exists) return state;
            return {
                currentBoard: {
                    ...state.currentBoard,
                    lists: [...state.currentBoard.lists, { ...list, tasks: list.tasks || [] }],
                },
            };
        });
    },

    handleListUpdated: (list) => {
        set((state) => {
            if (!state.currentBoard) return state;
            return {
                currentBoard: {
                    ...state.currentBoard,
                    lists: state.currentBoard.lists.map((l) =>
                        l.id === list.id ? { ...l, ...list } : l
                    ),
                },
            };
        });
    },

    handleListDeleted: (data) => {
        set((state) => {
            if (!state.currentBoard) return state;
            return {
                currentBoard: {
                    ...state.currentBoard,
                    lists: state.currentBoard.lists.filter((l) => l.id !== data.listId),
                },
            };
        });
    },

    handleMemberAdded: () => {
        // Refetch board to get updated members
        const { currentBoard, fetchBoard } = get();
        if (currentBoard) {
            fetchBoard(currentBoard.id);
        }
    },

    clearError: () => set({ error: null }),
    clearCurrentBoard: () => set({ currentBoard: null }),
}));
