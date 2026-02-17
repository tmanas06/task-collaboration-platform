import { useState, useEffect } from 'react';
import type { Task, BoardMember } from '../../types';
import { useBoardStore } from '../../store/boardStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User as UserIcon, Trash2, Check, Clock, AlignLeft, Type, AlertCircle } from 'lucide-react';

interface Props {
    task: Task;
    boardMembers: BoardMember[];
    onClose: () => void;
}

export default function TaskModal({ task, boardMembers, onClose }: Props) {
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || '');
    const [dueDate, setDueDate] = useState(
        task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    );
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const updateTask = useBoardStore(state => state.updateTask);
    const deleteTask = useBoardStore(state => state.deleteTask);
    const assignTask = useBoardStore(state => state.assignTask);
    const unassignTask = useBoardStore(state => state.unassignTask);
    const fetchTask = useBoardStore(state => state.fetchTask);

    useEffect(() => {
        const loadDetails = async () => {
            setIsLoadingDetails(true);
            try {
                const fullTask = await fetchTask(task.id);
                setTitle(fullTask.title);
                setDescription(fullTask.description || '');
                if (fullTask.dueDate) {
                    setDueDate(new Date(fullTask.dueDate).toISOString().split('T')[0]);
                }
            } catch (error) {
                console.error('Failed to load task details:', error);
            } finally {
                setIsLoadingDetails(false);
            }
        };
        loadDetails();
    }, [task.id, fetchTask]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateTask(task.id, {
                title: title.trim(),
                description: description.trim() || undefined,
                dueDate: dueDate ? new Date(dueDate).toISOString() : null,
            });
            onClose();
        } catch {
            // Error handled by store
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            await deleteTask(task.id);
            onClose();
        }
    };

    const handleAssign = async (userId: string) => {
        const isAssigned = task.assignees.some((a) => a.userId === userId);
        if (isAssigned) {
            await unassignTask(task.id, userId);
        } else {
            await assignTask(task.id, userId);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-card border-4 border-foreground rounded-[2.5rem] w-full max-w-lg shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(var(--accent-rgb),0.2)] max-h-[90vh] overflow-hidden flex flex-col transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Noise Texture */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-soft-light" />
                {/* Header */}
                <div className="relative z-10 flex items-center justify-between p-8 border-b-4 border-foreground bg-accent-color/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent-color rounded-xl border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                            <Type className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-widest text-foreground">Edit Task</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 rounded-xl transition-all border-2 border-transparent hover:border-rose-500"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 space-y-6 overflow-y-auto relative z-10 custom-scrollbar">
                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-5 py-4 bg-background border-4 border-foreground/20 focus:border-accent-color rounded-2xl text-lg font-bold text-foreground focus:ring-4 focus:ring-accent-color/10 outline-none transition-all shadow-sm focus:shadow-[4px_4px_0px_0px_rgba(var(--accent-rgb),0.5)]"
                            placeholder="Enter task title..."
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Description</label>
                            {isLoadingDetails && (
                                <div className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-accent-color rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-1.5 h-1.5 bg-accent-color rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-1.5 h-1.5 bg-accent-color rounded-full animate-bounce" />
                                </div>
                            )}
                        </div>
                        {isLoadingDetails && !description ? (
                            <div className="space-y-3 p-4 border-4 border-transparent">
                                <div className="h-4 bg-muted/20 rounded-md animate-pulse w-full" />
                                <div className="h-4 bg-muted/20 rounded-md animate-pulse w-[90%]" />
                                <div className="h-4 bg-muted/20 rounded-md animate-pulse w-[70%]" />
                            </div>
                        ) : (
                            <div className="relative group">
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-5 py-4 bg-background border-4 border-foreground/20 focus:border-accent-color rounded-2xl text-foreground placeholder-muted-foreground/50 focus:ring-4 focus:ring-accent-color/10 outline-none transition-all resize-none min-h-[140px] shadow-sm focus:shadow-[4px_4px_0px_0px_rgba(var(--accent-rgb),0.5)] font-medium leading-relaxed"
                                    rows={4}
                                    placeholder="Add more details to this task..."
                                />
                                <AlignLeft className="absolute top-4 right-4 w-5 h-5 text-muted-foreground/30 pointer-events-none" />
                            </div>
                        )}
                    </div>

                    {/* Due date */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Due Date</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full px-5 py-4 pl-12 bg-background border-4 border-foreground/20 focus:border-accent-color rounded-2xl text-foreground font-bold focus:ring-4 focus:ring-accent-color/10 outline-none transition-all shadow-sm focus:shadow-[4px_4px_0px_0px_rgba(var(--accent-rgb),0.5)]"
                            />
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        </div>
                    </div>

                    {/* Assignees */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Assign Members</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                            {boardMembers.map((member) => {
                                const isAssigned = task.assignees.some((a) => a.userId === member.userId);
                                return (
                                    <button
                                        key={member.id}
                                        onClick={() => handleAssign(member.userId)}
                                        className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all duration-200 ${isAssigned
                                            ? 'bg-foreground border-foreground text-background shadow-[4px_4px_0px_0px_rgba(var(--accent-rgb),0.3)] translate-x-[-2px] translate-y-[-2px]'
                                            : 'bg-background border-foreground/10 text-foreground hover:border-foreground/50 hover:bg-muted/10'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center text-xs font-black ${isAssigned
                                            ? 'bg-background text-foreground border-background'
                                            : 'bg-muted/20 border-border text-muted-foreground'
                                            }`}>
                                            {member.user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-bold flex-1 text-left line-clamp-1">{member.user.name}</span>
                                        {isAssigned && (
                                            <Check className="w-4 h-4 text-accent-color" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-6 mt-4 border-t-2 border-foreground/5">
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all font-bold text-sm hover:translate-x-1"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Task
                        </button>
                        <div className="flex gap-4">
                            <button
                                onClick={onClose}
                                className="px-6 py-3 font-bold text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted/10 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving || !title.trim()}
                                className="px-8 py-3 bg-foreground text-background font-black uppercase tracking-widest rounded-xl hover:bg-accent-color hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[6px_6px_0px_0px_rgba(var(--accent-rgb),0.2)] hover:shadow-[4px_4px_0px_0px_rgba(var(--accent-rgb),0.4)] hover:-translate-y-1 active:translate-y-0 active:shadow-none"
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
