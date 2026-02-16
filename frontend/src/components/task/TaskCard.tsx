import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../types';
import { Calendar, MessageSquare, Clock, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
    task: Task;
    onClick: () => void;
}

export default function TaskCard({ task, onClick }: Props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: { type: 'task', task },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

    // Determine priority color (mock logic for now if not in task object)
    const priorityColor = task.priority === 'HIGH' ? 'bg-rose-500' : task.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-indigo-500';

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`group notion-card cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-30 scale-105 z-50 shadow-2xl' : 'opacity-100'
                }`}
        >
            {/* Priority Indicator */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${priorityColor} shadow-[0_0_8px_rgba(0,0,0,0.3)]`} />
                    <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-500">
                        {task.priority || 'Task'}
                    </span>
                </div>
                <ArrowUpRight className="w-3 h-3 text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Title */}
            <h4 className="text-sm font-bold text-zinc-100 leading-snug mb-2 group-hover:text-indigo-400 transition-colors">
                {task.title}
            </h4>

            {/* Description preview */}
            {task.description && (
                <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2 mb-4 font-medium italic">
                    {task.description}
                </p>
            )}

            {/* Bottom Row */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Due Date */}
                    {task.dueDate && (
                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border ${isOverdue
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                            : 'bg-zinc-800/50 border-white/5 text-zinc-500'
                            }`}>
                            <Calendar className="w-3 h-3" />
                            <span className="text-[10px] font-black uppercase">
                                {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                    )}

                    {/* Mock Stats */}
                    <div className="flex items-center gap-1 hex text-zinc-600">
                        <MessageSquare className="w-3 h-3" />
                        <span className="text-[10px] font-bold">2</span>
                    </div>
                </div>

                {/* Assignees */}
                <div className="flex -space-x-2">
                    {task.assignees.length > 0 ? (
                        task.assignees.slice(0, 3).map((a) => (
                            <div
                                key={a.id}
                                className="w-6 h-6 rounded-lg bg-zinc-800 border-[1.5px] border-[#18181b] flex items-center justify-center text-[8px] font-black text-white shadow-sm"
                                title={a.user.name}
                            >
                                {a.user.name.charAt(0).toUpperCase()}
                            </div>
                        ))
                    ) : (
                        <div className="w-6 h-6 rounded-lg bg-zinc-900/50 border border-white/5 flex items-center justify-center">
                            <Clock className="w-3 h-3 text-zinc-800" />
                        </div>
                    )}
                    {task.assignees.length > 3 && (
                        <div className="w-6 h-6 rounded-lg bg-zinc-900 border-[1.5px] border-[#18181b] flex items-center justify-center text-[8px] font-bold text-zinc-500">
                            +{task.assignees.length - 3}
                        </div>
                    )}
                </div>
            </div>

            {/* Hover Glow Background */}
            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
        </motion.div>
    );
}
