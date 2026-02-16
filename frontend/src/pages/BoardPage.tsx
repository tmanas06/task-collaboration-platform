import { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
} from '@dnd-kit/core';
import { useBoardStore } from '../store/boardStore';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';
import BoardHeader from '../components/board/BoardHeader';
import ListColumn from '../components/list/ListColumn';
import CreateListButton from '../components/list/CreateListButton';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Navbar from '../components/common/Navbar';

export default function BoardPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentBoard, isLoading, error, fetchBoard, moveTask, clearCurrentBoard } = useBoardStore();
    const { user } = useAuth();
    useSocket(id);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    useEffect(() => {
        if (id) fetchBoard(id);
        return () => clearCurrentBoard();
    }, [id]);

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            if (!over || !currentBoard) return;

            const taskId = active.id as string;
            const activeTask = active.data.current?.task;
            if (!activeTask) return;

            let targetListId: string;
            let targetPosition: number;

            if (over.data.current?.type === 'list') {
                // Dropped on an empty list
                targetListId = over.data.current.listId;
                const targetList = currentBoard.lists.find((l) => l.id === targetListId);
                targetPosition = targetList?.tasks.length || 0;
            } else {
                // Dropped on a task
                const overTask = over.data.current?.task;
                if (!overTask) return;
                targetListId = overTask.listId;
                targetPosition = overTask.position;
            }

            // Only move if something actually changed
            if (activeTask.listId === targetListId && activeTask.position === targetPosition) {
                return;
            }

            moveTask(taskId, targetListId, targetPosition);
        },
        [currentBoard, moveTask]
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-dark-950">
                <Navbar />
                <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                    <LoadingSpinner size="lg" />
                </div>
            </div>
        );
    }

    if (error || !currentBoard) {
        return (
            <div className="min-h-screen bg-dark-950">
                <Navbar />
                <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-4">
                    <p className="text-red-400">{error || 'Board not found'}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2 bg-dark-800 text-white rounded-lg hover:bg-dark-700 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-950 flex flex-col">
            <Navbar />
            <BoardHeader board={currentBoard} currentUser={user!} />

            {/* Board content - scrollable horizontally */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex gap-4 p-6 h-[calc(100vh-140px)] items-start">
                        {currentBoard.lists
                            .sort((a, b) => a.position - b.position)
                            .map((list) => (
                                <ListColumn
                                    key={list.id}
                                    list={list}
                                    boardMembers={currentBoard.members}
                                />
                            ))}
                        <CreateListButton boardId={currentBoard.id} />
                    </div>
                </DndContext>
            </div>
        </div>
    );
}
