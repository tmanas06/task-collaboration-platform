import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../types';

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

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className={`bg-dark-800 border border-dark-600 rounded-xl p-3.5 cursor-pointer hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/5 transition-all group ${isDragging ? 'opacity-50 shadow-2xl scale-105 z-50' : ''
                }`}
        >
            {/* Title */}
            <p className="text-sm font-medium text-white group-hover:text-primary-300 transition-colors">
                {task.title}
            </p>

            {/* Description preview */}
            {task.description && (
                <p className="text-xs text-dark-400 mt-1.5 line-clamp-2">{task.description}</p>
            )}

            {/* Bottom row: due date + assignees */}
            <div className="flex items-center justify-between mt-3">
                {/* Due date */}
                {task.dueDate && (
                    <span
                        className={`text-xs px-2 py-1 rounded-md ${isOverdue
                                ? 'bg-red-500/15 text-red-400'
                                : 'bg-dark-700 text-dark-300'
                            }`}
                    >
                        {new Date(task.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                        })}
                    </span>
                )}

                {/* Assignees */}
                {task.assignees.length > 0 && (
                    <div className="flex -space-x-1.5 ml-auto">
                        {task.assignees.slice(0, 3).map((a) => (
                            <div
                                key={a.id}
                                className="w-6 h-6 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-[10px] font-medium text-white border-2 border-dark-800"
                                title={a.user.name}
                            >
                                {a.user.name.charAt(0).toUpperCase()}
                            </div>
                        ))}
                        {task.assignees.length > 3 && (
                            <div className="w-6 h-6 bg-dark-600 rounded-full flex items-center justify-center text-[10px] font-medium text-dark-300 border-2 border-dark-800">
                                +{task.assignees.length - 3}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
