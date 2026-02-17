import { useEffect, useRef } from 'react';
import { socketService } from '../services/socket';
import { useSocketStore } from '../store/socketStore';
import { useAuthStore } from '../store/authStore';
import { useBoardStore } from '../store/boardStore';

export const useSocket = (boardId?: string) => {
    const { token } = useAuthStore();
    const { connect, disconnect, joinBoard, leaveBoard, isConnected } = useSocketStore();
    const {
        handleTaskCreated,
        handleTaskUpdated,
        handleTaskMoved,
        handleTaskDeleted,
        handleListCreated,
        handleListUpdated,
        handleListDeleted,
        handleMemberAdded,
        handleActivityCreated,
    } = useBoardStore();
    const boardIdRef = useRef(boardId);

    useEffect(() => {
        if (token) {
            connect(token);
        }
        return () => {
            disconnect();
        };
    }, [token]);

    useEffect(() => {
        boardIdRef.current = boardId;

        if (!boardId || !isConnected) return;

        joinBoard(boardId);

        // Register socket event listeners
        const events = {
            'task:created': handleTaskCreated,
            'task:updated': handleTaskUpdated,
            'task:moved': handleTaskMoved,
            'task:deleted': handleTaskDeleted,
            'list:created': handleListCreated,
            'list:updated': handleListUpdated,
            'list:deleted': handleListDeleted,
            'member:added': handleMemberAdded,
            'activity:created': handleActivityCreated,
        };

        Object.entries(events).forEach(([event, handler]) => {
            socketService.on(event, handler);
        });

        return () => {
            leaveBoard(boardId);
            Object.entries(events).forEach(([event, handler]) => {
                socketService.off(event, handler);
            });
        };
    }, [boardId, isConnected]);

    return { isConnected };
};
