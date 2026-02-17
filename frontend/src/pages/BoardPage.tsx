import { useEffect, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
    DragOverlay,
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
import TaskCard from '../components/task/TaskCard';
import CreateListButton from '../components/list/CreateListButton';
import ActivityHistory from '../components/board/ActivityHistory';
import Navbar from '../components/common/Navbar';
import { motion, AnimatePresence } from 'framer-motion';

export default function BoardPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Use individual selectors for stability
    const currentBoard = useBoardStore(state => state.currentBoard);
    const isLoading = useBoardStore(state => state.isLoading);
    const error = useBoardStore(state => state.error);
    const fetchBoard = useBoardStore(state => state.fetchBoard);
    const moveTask = useBoardStore(state => state.moveTask);
    const clearCurrentBoard = useBoardStore(state => state.clearCurrentBoard);

    const { user } = useAuth();
    const [showActivity, setShowActivity] = useState(false);
    const [activeTask, setActiveTask] = useState<any>(null);
    useSocket(id);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    useEffect(() => {
        if (id) {
            fetchBoard(id);
        }
        return () => {
            clearCurrentBoard();
        };
    }, [id]); // Only re-run if ID changes

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveTask(active.data.current?.task);
    };

    const handleDragOver = useCallback(
        (event: DragOverEvent) => {
            const { active, over } = event;
            if (!over || !currentBoard) return;

            const activeId = active.id as string;
            const overId = over.id as string;

            if (activeId === overId) return;

            const activeTask = active.data.current?.task;
            if (!activeTask) return;

            const overType = over.data.current?.type;
            const overTask = over.data.current?.task;

            // Find the lists
            const activeListId = activeTask.listId;
            const overListId = overType === 'list' ? over.data.current?.listId : overTask?.listId;

            if (!overListId || activeListId === overListId || !event.over) return;

            // If we are dragging over a different list, we need to move the task locally 
            // to that list so SortableContext can handle the rest
            const overList = currentBoard.lists.find(l => l.id === overListId);
            if (!overList) return;

            // Calculate new position in the destination list
            let newPos = 0;
            if (overTask && event.over.rect) {
                const overIndex = overList.tasks.findIndex(t => t.id === overId);
                const isBelowOverItem =
                    event.active.rect.current.translated &&
                    event.active.rect.current.translated.top >
                    event.over.rect.top + event.over.rect.height;

                const modifier = isBelowOverItem ? 1 : 0;
                newPos = overIndex >= 0 ? overIndex + modifier : overList.tasks.length;
            } else {
                newPos = overList.tasks.length;
            }

            // Trigger optimistic move in store (this will update currentBoard)
            moveTask(activeId, overListId, newPos);
        },
        [currentBoard, moveTask]
    );

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            setActiveTask(null);

            if (!over || !currentBoard) return;

            const taskId = active.id as string;
            const activeTask = active.data.current?.task;
            if (!activeTask) return;

            let targetListId: string;
            let targetPosition: number;

            if (over.data.current?.type === 'list') {
                targetListId = over.data.current.listId;
                const targetList = currentBoard.lists.find((l) => l.id === targetListId);
                targetPosition = targetList?.tasks.length || 0;
            } else {
                const overTask = over.data.current?.task;
                if (!overTask) return;
                targetListId = overTask.listId;
                targetPosition = overTask.position;
            }

            if (activeTask.listId === targetListId && activeTask.position === targetPosition) {
                return;
            }

            moveTask(taskId, targetListId, targetPosition);
        },
        [currentBoard, moveTask]
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
                <Navbar />
                <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                    <div className="relative">
                        <div className="w-12 h-12 border-4 border-border border-t-accent-color rounded-full animate-spin" />
                        <div className="absolute inset-0 blur-xl bg-accent-color/20 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (!currentBoard) {
        return (
            <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
                <Navbar />
                <div className="flex-1" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden transition-colors duration-300">
            {/* Parallax Background Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-color/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-accent-color/5 blur-[100px] rounded-full delay-1000 animate-pulse" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-20 brightness-100 dark:brightness-50 mix-blend-overlay" />
            </div>

            <Navbar />

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col relative z-10"
            >
                <BoardHeader
                    board={currentBoard}
                    currentUser={user!}
                    onToggleActivity={() => setShowActivity(!showActivity)}
                />

                <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden no-scrollbar">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                    >
                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="flex gap-6 p-8 h-full min-w-max items-start"
                        >
                            <AnimatePresence>
                                {currentBoard.lists
                                    .sort((a, b) => a.position - b.position)
                                    .map((list, idx) => (
                                        <motion.div
                                            key={list.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 * idx }}
                                        >
                                            <ListColumn
                                                list={list}
                                                boardMembers={currentBoard.members}
                                            />
                                        </motion.div>
                                    ))}
                            </AnimatePresence>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="w-[320px] shrink-0"
                            >
                                <CreateListButton boardId={currentBoard.id} />
                            </motion.div>
                        </motion.div>

                        <DragOverlay dropAnimation={null}>
                            {activeTask ? (
                                <div className="w-[300px] pointer-events-none transition-transform duration-200">
                                    <TaskCard
                                        task={activeTask}
                                        onClick={() => { }}
                                    />
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>
            </motion.div>

            <ActivityHistory
                boardId={currentBoard.id}
                isOpen={showActivity}
                onClose={() => setShowActivity(false)}
            />
        </div>
    );
}
