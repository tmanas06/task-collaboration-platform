import { useState, useEffect } from 'react';
import type { Task, BoardMember } from '../../types';
import { useBoardStore } from '../../store/boardStore';

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
    const { updateTask, deleteTask, assignTask, unassignTask, fetchTask } = useBoardStore();

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
            <div
                className="relative bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto transition-colors"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-0">
                    <h2 className="text-lg font-bold text-foreground">Edit Task</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1.5">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 bg-muted/20 border border-border rounded-xl text-foreground focus:ring-2 focus:ring-accent-color focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1.5">Description</label>
                        {isLoadingDetails ? (
                            <div className="w-full h-32 bg-muted/10 animate-pulse rounded-xl flex items-center justify-center">
                                <span className="text-xs text-muted-foreground">Loading details...</span>
                            </div>
                        ) : (
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-3 bg-muted/20 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-accent-color focus:border-transparent outline-none transition-all resize-none"
                                rows={4}
                                placeholder="Add a description..."
                            />
                        )}
                    </div>

                    {/* Due date */}
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1.5">Due Date</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full px-4 py-3 bg-muted/20 border border-border rounded-xl text-foreground focus:ring-2 focus:ring-accent-color focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    {/* Assignees */}
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Assign Members</label>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                            {boardMembers.map((member) => {
                                const isAssigned = task.assignees.some((a) => a.userId === member.userId);
                                return (
                                    <button
                                        key={member.id}
                                        onClick={() => handleAssign(member.userId)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isAssigned
                                            ? 'bg-accent-color/10 border border-accent-color/30'
                                            : 'bg-muted/10 border border-transparent hover:bg-muted/20'
                                            }`}
                                    >
                                        <div className="w-7 h-7 bg-accent-color rounded-full flex items-center justify-center text-xs font-medium text-white shadow-sm">
                                            {member.user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm text-foreground flex-1 text-left">{member.user.name}</span>
                                        {isAssigned && (
                                            <svg className="w-4 h-4 text-accent-color" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors text-sm font-medium"
                        >
                            Delete Task
                        </button>
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted/20 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving || !title.trim()}
                                className="px-5 py-2.5 bg-accent-color text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-accent-color/25"
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
