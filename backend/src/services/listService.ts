import prisma from '../prisma/client';
import { AppError } from '../middleware/errorHandler';
import { activityService } from './activityService';
import { boardService } from './boardService';
import { socketService } from './socketService';
import { CreateListInput, UpdateListInput } from '../types';

export const listService = {
    async create(input: CreateListInput, userId: string) {
        // Verify board membership and edit permissions
        await boardService.verifyCanEdit(input.boardId, userId);

        // Get the next position
        const maxPosition = await prisma.list.aggregate({
            where: { boardId: input.boardId },
            _max: { position: true },
        });

        const position = (maxPosition._max.position ?? -1) + 1;

        const list = await prisma.list.create({
            data: {
                title: input.title,
                position,
                boardId: input.boardId,
            },
            include: {
                tasks: {
                    include: {
                        assignees: {
                            include: {
                                user: {
                                    select: { id: true, name: true, email: true, avatar: true },
                                },
                            },
                        },
                    },
                    orderBy: { position: 'asc' },
                },
            },
        });

        await activityService.log({
            action: 'LIST_CREATED',
            entityType: 'List',
            entityId: list.id,
            metadata: { title: list.title },
            userId,
            boardId: input.boardId,
        });

        socketService.emitToBoard(input.boardId, 'list:created', list);

        return list;
    },

    async update(listId: string, input: UpdateListInput, userId: string) {
        const list = await prisma.list.findUnique({ where: { id: listId } });
        if (!list) throw new AppError('List not found', 404);

        await boardService.verifyCanEdit(list.boardId, userId);

        // Handle position update
        if (input.position !== undefined && input.position !== list.position) {
            await this.updatePosition(listId, list.boardId, list.position, input.position);
        }

        const updated = await prisma.list.update({
            where: { id: listId },
            data: {
                ...(input.title !== undefined && { title: input.title }),
                ...(input.position !== undefined && { position: input.position }),
            },
            include: {
                tasks: {
                    include: {
                        assignees: {
                            include: {
                                user: {
                                    select: { id: true, name: true, email: true, avatar: true },
                                },
                            },
                        },
                    },
                    orderBy: { position: 'asc' },
                },
            },
        });

        await activityService.log({
            action: 'LIST_UPDATED',
            entityType: 'List',
            entityId: listId,
            metadata: { ...input, title: updated.title },
            userId,
            boardId: list.boardId,
        });

        const updatedList = { ...updated, boardId: list.boardId };
        socketService.emitToBoard(list.boardId, 'list:updated', updatedList);

        return updatedList;
    },

    async delete(listId: string, userId: string) {
        const list = await prisma.list.findUnique({ where: { id: listId } });
        if (!list) throw new AppError('List not found', 404);

        await boardService.verifyCanEdit(list.boardId, userId);

        await prisma.$transaction(async (tx) => {
            await tx.list.delete({ where: { id: listId } });

            // Recalculate positions for remaining lists
            await tx.list.updateMany({
                where: {
                    boardId: list.boardId,
                    position: { gt: list.position },
                },
                data: { position: { decrement: 1 } },
            });
        });

        await activityService.log({
            action: 'LIST_DELETED',
            entityType: 'List',
            entityId: listId,
            metadata: { title: list.title },
            userId,
            boardId: list.boardId,
        });

        socketService.emitToBoard(list.boardId, 'list:deleted', {
            listId,
            boardId: list.boardId
        });

        return { message: 'List deleted successfully', boardId: list.boardId };
    },

    async updatePosition(listId: string, boardId: string, oldPos: number, newPos: number) {
        await prisma.$transaction(async (tx) => {
            if (newPos > oldPos) {
                // Moving down: shift items between old+1 and new up by 1
                await tx.list.updateMany({
                    where: {
                        boardId,
                        id: { not: listId },
                        position: { gt: oldPos, lte: newPos },
                    },
                    data: { position: { decrement: 1 } },
                });
            } else {
                // Moving up: shift items between new and old-1 down by 1
                await tx.list.updateMany({
                    where: {
                        boardId,
                        id: { not: listId },
                        position: { gte: newPos, lt: oldPos },
                    },
                    data: { position: { increment: 1 } },
                });
            }
        });
    },
};
