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
    const priorityColor = task.priority === 'HIGH' ? 'bg-rose-500' : task.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-accent-color';

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`group notion-card cursor-grab active:cursor-grabbing border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all rounded-xl relative overflow-hidden ${isDragging ? 'opacity-30 scale-105 z-50 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]' : 'opacity-100'
                }`}
        >
            {/* Noise Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-soft-light" />
            {/* Priority Indicator */}
            <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-sm border border-foreground ${priorityColor} shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        {task.priority || 'Task'}
                    </span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Title */}
            <h4 className="text-sm font-bold text-foreground leading-snug mb-2 group-hover:text-accent-color transition-colors">
                {task.title}
            </h4>

            {/* Description preview */}
            {task.description && (
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mb-4 font-medium italic">
                    {task.description}
                </p>
            )}

            {/* Bottom Row */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Due Date */}
                    {task.dueDate && (
                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border ${isOverdue
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                            : 'bg-muted/20 border-border text-muted-foreground'
                            }`}>
                            <Calendar className="w-3 h-3" />
                            <span className="text-[10px] font-black uppercase">
                                {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                    )}

                    {/* Mock Stats */}
                    <div className="flex items-center gap-1 text-muted-foreground/60">
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
                                className="w-6 h-6 rounded-lg bg-background border-2 border-foreground flex items-center justify-center text-[9px] font-black text-foreground shadow-sm"
                                title={a.user.name}
                            >
                                {a.user.name.charAt(0).toUpperCase()}
                            </div>
                        ))
                    ) : (
                        <div className="w-6 h-6 rounded-lg bg-muted/10 border-2 border-foreground/10 flex items-center justify-center">
                            <Clock className="w-3 h-3 text-muted-foreground/40" />
                        </div>
                    )}
                    {task.assignees.length > 3 && (
                        <div className="w-6 h-6 rounded-lg bg-muted border-[1.5px] border-border flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                            +{task.assignees.length - 3}
                        </div>
                    )}
                </div>
            </div>

            {/* Hover Glow Background */}
            <div className="absolute inset-0 bg-accent-color/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
        </motion.div>
    );
}
