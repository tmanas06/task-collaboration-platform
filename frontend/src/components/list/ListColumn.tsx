import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { List, BoardMember, Task, User } from '../../types';
import TaskCard from '../task/TaskCard';
import TaskModal from '../task/TaskModal';
import CreateTaskButton from '../task/CreateTaskButton';
import { useBoardStore } from '../../store/boardStore';
import { MoreVertical, Trash2, Edit3, GripVertical, List as ListIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    list: List;
    boardMembers: BoardMember[];
    currentUser: User | null;
}

export default function ListColumn({ list, boardMembers, currentUser }: Props) {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [title, setTitle] = useState(list.title);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const { updateList, deleteList } = useBoardStore();
    const [showMenu, setShowMenu] = useState(false);

    const userRole = boardMembers.find(m => m.userId === currentUser?.id)?.role;
    const canEdit = userRole !== 'VIEWER';

    const { setNodeRef, isOver } = useDroppable({
        id: `list-${list.id}`,
        data: { type: 'list', listId: list.id },
    });

    const handleTitleSave = async () => {
        if (title.trim() && title !== list.title) {
            await updateList(list.id, { title: title.trim() });
        }
        setIsEditingTitle(false);
    };

    const handleDelete = async () => {
        if (window.confirm(`Delete list "${list.title}" and all its tasks?`)) {
            await deleteList(list.id);
        }
        setShowMenu(false);
    };

    const taskIds = list.tasks.map((t) => t.id);

    return (
        <>
            <div
                ref={setNodeRef}
                className={`group flex flex-col w-[320px] shrink-0 h-full max-h-full bg-card border-4 rounded-[2rem] transition-all duration-300 relative overflow-hidden ${isOver
                    ? 'border-accent-color shadow-[0_0_40px_rgba(var(--accent-rgb),0.2)] scale-[1.02]'
                    : 'border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
                    }`}
            >
                {/* Noise Texture */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-soft-light" />
                {/* Header */}
                <div className="relative z-10 flex items-center justify-between px-6 py-5 border-b-4 border-foreground bg-accent-color/5">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <GripVertical className="w-5 h-5 text-foreground/40 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity" />
                        {isEditingTitle ? (
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onBlur={handleTitleSave}
                                onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                                className="text-lg font-black uppercase tracking-tight bg-background border-2 border-accent-color rounded-lg px-2 py-1 text-foreground outline-none shadow-[4px_4px_0px_0px_rgba(var(--accent-rgb),0.2)]"
                                autoFocus
                            />
                        ) : (
                            <div className="flex items-center gap-3 overflow-hidden">
                                <h3
                                    className={`text-lg font-black text-foreground ${canEdit ? 'cursor-pointer hover:text-accent-color' : ''} transition-colors uppercase tracking-tight truncate`}
                                    onClick={() => canEdit && setIsEditingTitle(true)}
                                >
                                    {list.title}
                                </h3>
                                <div className="flex items-center justify-center min-w-[24px] h-6 px-2 bg-foreground text-background rounded-md text-xs font-black shadow-sm">
                                    {list.tasks.length}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Menu */}
                    {canEdit && (
                        <div className="relative">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className={`p - 2 rounded - xl transition - all ${showMenu ? 'bg-muted/20 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/10'} `}
                            >
                                <MoreVertical className="w-4 h-4" />
                            </button>

                            <AnimatePresence>
                                {showMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        className="absolute right-0 mt-2 w-48 bg-card border-2 border-foreground rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 overflow-hidden"
                                    >
                                        <div className="p-2 space-y-1">
                                            <button
                                                onClick={() => { setIsEditingTitle(true); setShowMenu(false); }}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/10 rounded-lg transition-all"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                                Rename List
                                            </button>
                                            <button
                                                onClick={handleDelete}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Remove List
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Tasks - Independent Scroll Utility */}
                <div
                    ref={setNodeRef}
                    className="flex-1 px-4 py-4 space-y-3 overflow-y-auto overflow-x-hidden no-scrollbar min-h-[100px]"
                >
                    <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                        <div className="space-y-3">
                            {list.tasks
                                .sort((a, b) => a.position - b.position)
                                .map((task) => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        onClick={() => setSelectedTask(task)}
                                    />
                                ))}
                        </div>
                    </SortableContext>

                    {list.tasks.length === 0 && !isOver && (
                        <div className="py-12 flex flex-col items-center justify-center gap-4 opacity-30 group-hover:opacity-50 transition-opacity">
                            <div className="w-16 h-16 border-4 border-dashed border-foreground/30 rounded-2xl flex items-center justify-center">
                                <ListIcon className="w-8 h-8 text-foreground/50" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-foreground/50">Drop tasks here</span>
                        </div>
                    )}

                    {/* Ghost Drop Zone Hint */}
                    {isOver && (
                        <div className="h-24 rounded-xl border-4 border-dashed border-accent-color bg-accent-color/5 animate-pulse shadow-[inset_0_0_20px_rgba(var(--accent-rgb),0.1)]" />
                    )}
                </div>

                {/* Footer / Add Task */}
                {canEdit && (
                    <div className="p-4 bg-muted/5">
                        <CreateTaskButton listId={list.id} />
                    </div>
                )}
            </div>

            {/* Task modal with Side Panel feel potentially or just updated theme */}
            {selectedTask && (
                <TaskModal
                    task={selectedTask}
                    boardMembers={boardMembers}
                    onClose={() => setSelectedTask(null)}
                />
            )}
        </>
    );
}
