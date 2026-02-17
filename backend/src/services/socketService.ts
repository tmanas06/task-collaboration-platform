
import { Server } from 'socket.io';

class SocketService {
    private static instance: SocketService;
    private io: Server | null = null;

    private constructor() { }

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    public initialize(io: Server) {
        this.io = io;
    }

    public emit(event: string, data: any, room?: string) {
        if (!this.io) {
            console.warn('SocketService not initialized');
            return;
        }

        if (room) {
            this.io.to(room).emit(event, data);
        } else {
            this.io.emit(event, data);
        }
    }

    public emitToBoard(boardId: string, event: string, data: any) {
        this.emit(event, data, `board:${boardId}`);
    }
}

export const socketService = SocketService.getInstance();
