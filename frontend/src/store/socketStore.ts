import { create } from 'zustand';
import { socketService } from '../services/socket';

interface SocketState {
    isConnected: boolean;
    connect: (token: string) => void;
    disconnect: () => void;
    joinBoard: (boardId: string) => void;
    leaveBoard: (boardId: string) => void;
}

export const useSocketStore = create<SocketState>((set) => ({
    isConnected: false,

    connect: (token: string) => {
        const socket = socketService.connect(token);

        socket.on('connect', () => set({ isConnected: true }));
        socket.on('disconnect', () => set({ isConnected: false }));
    },

    disconnect: () => {
        socketService.disconnect();
        set({ isConnected: false });
    },

    joinBoard: (boardId: string) => {
        socketService.joinBoard(boardId);
    },

    leaveBoard: (boardId: string) => {
        socketService.leaveBoard(boardId);
    },
}));
