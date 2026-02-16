import { Server, Socket } from 'socket.io';
import { auth } from '../config/firebase';
import { AuthPayload } from '../types';

interface AuthenticatedSocket extends Socket {
    user?: AuthPayload;
}

export const setupSocketHandlers = (io: Server) => {
    // Authentication middleware for Socket.IO
    io.use(async (socket: AuthenticatedSocket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication required'));
        }

        try {
            const decodedToken = await auth.verifyIdToken(token);
            // In Firebase flow, the payload uses 'uid'
            socket.user = { userId: decodedToken.uid, email: decodedToken.email || '', role: 'MEMBER' };
            next();
        } catch (error) {
            console.error('Socket Auth Error:', error);
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket: AuthenticatedSocket) => {
        console.log(`User connected: ${socket.user?.userId}`);

        // Join a board room
        socket.on('join-board', (boardId: string) => {
            socket.join(`board:${boardId}`);
            console.log(`User ${socket.user?.userId} joined board:${boardId}`);
        });

        // Leave a board room
        socket.on('leave-board', (boardId: string) => {
            socket.leave(`board:${boardId}`);
            console.log(`User ${socket.user?.userId} left board:${boardId}`);
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user?.userId}`);
        });
    });

    return io;
};

// Helper to emit events to a board room
export const emitBoardEvent = (
    io: Server,
    boardId: string,
    event: string,
    data: any
) => {
    io.to(`board:${boardId}`).emit(event, data);
};
