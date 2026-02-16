import prisma from '../prisma/client';
import { AppError } from '../middleware/errorHandler';
import { activityService } from './activityService';
import { boardService } from './boardService';
import { CreateTaskInput, UpdateTaskInput, MoveTaskInput } from '../types';

const taskInclude = {
    assignees: {
        include: {
            user: {
                select: { id: true, name: true, email: true, avatar: true },
            },
        },
    },
    list: {
        select: { id: true, title: true, boardId: true },
    },
};

export const taskService = {
    async create(input: CreateTaskInput, userId: string) {
        // Find the list and verify board membership
        const list = await prisma.list.findUnique({
            where: { id: input.listId },
            select: { id: true, boardId: true },
        });

        if (!list) throw new AppError('List not found', 404);

        await boardService.verifyMembership(list.boardId, userId);

        // Get the next position
        const maxPosition = await prisma.task.aggregate({
            where: { listId: input.listId },
            _max: { position: true },
        });

        const position = (maxPosition._max.position ?? -1) + 1;

        const task = await prisma.task.create({
            data: {
                title: input.title,
                description: input.description,
                position,
                listId: input.listId,
                dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
            },
            include: taskInclude,
        });

        await activityService.log({
            action: 'TASK_CREATED',
            entityType: 'Task',
            entityId: task.id,
            metadata: { title: task.title, listTitle: task.list.title },
            userId,
            boardId: list.boardId,
        });

        return { ...task, boardId: list.boardId };
    },

    async update(taskId: string, input: UpdateTaskInput, userId: string) {
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { list: { select: { boardId: true } } },
        });

        if (!task) throw new AppError('Task not found', 404);

        await boardService.verifyMembership(task.list.boardId, userId);

        const updated = await prisma.task.update({
            where: { id: taskId },
            data: {
                ...(input.title !== undefined && { title: input.title }),
                ...(input.description !== undefined && { description: input.description }),
                ...(input.dueDate !== undefined && {
                    dueDate: input.dueDate ? new Date(input.dueDate) : null,
                }),
            },
            include: taskInclude,
        });

        await activityService.log({
            action: 'TASK_UPDATED',
            entityType: 'Task',
            entityId: taskId,
            metadata: input,
            userId,
            boardId: task.list.boardId,
        });

        return { ...updated, boardId: task.list.boardId };
    },

    async move(taskId: string, input: MoveTaskInput, userId: string) {
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { list: { select: { id: true, boardId: true, title: true } } },
        });

        if (!task) throw new AppError('Task not found', 404);

        const boardId = task.list.boardId;
        await boardService.verifyMembership(boardId, userId);

        // Verify destination list belongs to same board
        const destList = await prisma.list.findUnique({
            where: { id: input.listId },
            select: { id: true, boardId: true, title: true },
        });

        if (!destList) throw new AppError('Destination list not found', 404);
        if (destList.boardId !== boardId) {
            throw new AppError('Cannot move task to a different board', 400);
        }

        const oldListId = task.listId;
        const oldPosition = task.position;
        const newListId = input.listId;
        const newPosition = input.position;

        await prisma.$transaction(async (tx) => {
            if (oldListId === newListId) {
                // Moving within the same list
                if (newPosition > oldPosition) {
                    // Moving down
                    await tx.task.updateMany({
                        where: {
                            listId: oldListId,
                            id: { not: taskId },
                            position: { gt: oldPosition, lte: newPosition },
                        },
                        data: { position: { decrement: 1 } },
                    });
                } else if (newPosition < oldPosition) {
                    // Moving up
                    await tx.task.updateMany({
                        where: {
                            listId: oldListId,
                            id: { not: taskId },
                            position: { gte: newPosition, lt: oldPosition },
                        },
                        data: { position: { increment: 1 } },
                    });
                }
            } else {
                // Moving to a different list
                // Decrement positions in old list for tasks after the moved task
                await tx.task.updateMany({
                    where: {
                        listId: oldListId,
                        position: { gt: oldPosition },
                    },
                    data: { position: { decrement: 1 } },
                });

                // Increment positions in new list for tasks at or after the insertion point
                await tx.task.updateMany({
                    where: {
                        listId: newListId,
                        position: { gte: newPosition },
                    },
                    data: { position: { increment: 1 } },
                });
            }

            // Update the task's list and position
            await tx.task.update({
                where: { id: taskId },
                data: {
                    listId: newListId,
                    position: newPosition,
                },
            });
        });

        // Fetch the updated task
        const updatedTask = await prisma.task.findUnique({
            where: { id: taskId },
            include: taskInclude,
        });

        await activityService.log({
            action: 'TASK_MOVED',
            entityType: 'Task',
            entityId: taskId,
            metadata: {
                title: task.title,
                fromList: task.list.title,
                toList: destList.title,
                newPosition,
            },
            userId,
            boardId,
        });

        return { ...updatedTask, boardId };
    },

    async delete(taskId: string, userId: string) {
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { list: { select: { boardId: true } } },
        });

        if (!task) throw new AppError('Task not found', 404);

        await boardService.verifyMembership(task.list.boardId, userId);

        await prisma.$transaction(async (tx) => {
            await tx.task.delete({ where: { id: taskId } });

            // Recalculate positions
            await tx.task.updateMany({
                where: {
                    listId: task.listId,
                    position: { gt: task.position },
                },
                data: { position: { decrement: 1 } },
            });
        });

        await activityService.log({
            action: 'TASK_DELETED',
            entityType: 'Task',
            entityId: taskId,
            metadata: { title: task.title },
            userId,
            boardId: task.list.boardId,
        });

        return { message: 'Task deleted successfully', boardId: task.list.boardId, listId: task.listId };
    },

    async assign(taskId: string, assignUserId: string, userId: string) {
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { list: { select: { boardId: true } } },
        });

        if (!task) throw new AppError('Task not found', 404);

        const boardId = task.list.boardId;
        await boardService.verifyMembership(boardId, userId);

        // Verify the user to assign is a board member
        await boardService.verifyMembership(boardId, assignUserId);

        const existing = await prisma.taskAssignee.findUnique({
            where: { taskId_userId: { taskId, userId: assignUserId } },
        });

        if (existing) {
            throw new AppError('User is already assigned to this task', 409);
        }

        await prisma.taskAssignee.create({
            data: { taskId, userId: assignUserId },
        });

        const updatedTask = await prisma.task.findUnique({
            where: { id: taskId },
            include: taskInclude,
        });

        const assignedUser = await prisma.user.findUnique({
            where: { id: assignUserId },
            select: { name: true },
        });

        await activityService.log({
            action: 'TASK_ASSIGNED',
            entityType: 'Task',
            entityId: taskId,
            metadata: { title: task.title, assignedUser: assignedUser?.name },
            userId,
            boardId,
        });

        return { ...updatedTask, boardId };
    },

    async unassign(taskId: string, removeUserId: string, userId: string) {
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { list: { select: { boardId: true } } },
        });

        if (!task) throw new AppError('Task not found', 404);

        const boardId = task.list.boardId;
        await boardService.verifyMembership(boardId, userId);

        const assignee = await prisma.taskAssignee.findUnique({
            where: { taskId_userId: { taskId, userId: removeUserId } },
        });

        if (!assignee) {
            throw new AppError('User is not assigned to this task', 404);
        }

        await prisma.taskAssignee.delete({
            where: { id: assignee.id },
        });

        const updatedTask = await prisma.task.findUnique({
            where: { id: taskId },
            include: taskInclude,
        });

        await activityService.log({
            action: 'TASK_UNASSIGNED',
            entityType: 'Task',
            entityId: taskId,
            metadata: { title: task.title },
            userId,
            boardId,
        });

        return { ...updatedTask, boardId };
    },
};
