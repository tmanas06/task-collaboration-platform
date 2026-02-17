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
                className={`group flex flex-col w-[320px] shrink-0 h-full max-h-full bg-card/30 backdrop-blur-md border rounded-2xl transition-all duration-300 ${isOver ? 'border-accent-color/50 bg-card/50 shadow-[0_0_40px_rgba(var(--accent-rgb),0.1)]' : 'border-border'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <GripVertical className="w-4 h-4 text-muted-foreground/40 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity" />
                        {isEditingTitle ? (
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onBlur={handleTitleSave}
                                onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                                className="text-sm font-bold bg-background border border-accent-color/50 rounded-lg px-2 py-1 text-foreground outline-none ring-4 ring-accent-color/5"
                                autoFocus
                            />
                        ) : (
                            <div className="flex items-center gap-2 overflow-hidden">
                                <h3
                                    className={`text - sm font - black text - foreground ${canEdit ? 'cursor-pointer hover:text-accent-color' : ''} transition-colors uppercase tracking-widest truncate`}
                                    onClick={() => canEdit && setIsEditingTitle(true)}
                                >
                                    {list.title}
                                </h3>
                                <div className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-muted/20 rounded-md text-[10px] font-black text-muted-foreground">
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
                                        className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden shadow-lg"
                                    >
                                        <div className="p-2 space-y-1">
                                            <button
                                                onClick={() => { setIsEditingTitle(true); setShowMenu(false); }}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/10 rounded-xl transition-all"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                                Rename List
                                            </button>
                                            <button
                                                onClick={handleDelete}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
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
                        <div className="py-12 flex flex-col items-center justify-center gap-3 opacity-20 group-hover:opacity-40 transition-opacity">
                            <ListIcon className="w-8 h-8 text-muted-foreground" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Drop tasks here</span>
                        </div>
                    )}

                    {/* Ghost Drop Zone Hint */}
                    {isOver && (
                        <div className="h-16 rounded-xl border-2 border-dashed border-accent-color/30 bg-accent-color/5 animate-pulse" />
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
