import { useEffect, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    DndContext,
    DragEndEvent,
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
import ActivityHistory from '../components/board/ActivityHistory';
import Navbar from '../components/common/Navbar';
import { motion, AnimatePresence } from 'framer-motion';

export default function BoardPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentBoard, isLoading, error, fetchBoard, moveTask, clearCurrentBoard } = useBoardStore();
    const { user } = useAuth();
    const [showActivity, setShowActivity] = useState(false);
    useSocket(id);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    useEffect(() => {
        if (id) fetchBoard(id);
        return () => clearCurrentBoard();
    }, [id, fetchBoard, clearCurrentBoard]);

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

    if (error || !currentBoard) {
        return (
            <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
                <Navbar />
                <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-6 p-6 text-center">
                    <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center border border-rose-500/20">
                        <span className="text-4xl text-rose-500 font-bold">!</span>
                    </div>
                    <p className="text-xl font-bold text-foreground">{error || 'Project not found'}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-8 py-3 bg-muted/20 border border-border text-foreground font-bold rounded-2xl hover:bg-muted/30 transition-all"
                    >
                        Back to Workspace
                    </button>
                </div>
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
