import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { List, BoardMember } from '../../types';
import TaskCard from '../task/TaskCard';
import TaskModal from '../task/TaskModal';
import CreateTaskButton from '../task/CreateTaskButton';
import { useBoardStore } from '../../store/boardStore';
import type { Task } from '../../types';

interface Props {
    list: List;
    boardMembers: BoardMember[];
}

export default function ListColumn({ list, boardMembers }: Props) {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [title, setTitle] = useState(list.title);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const { updateList, deleteList } = useBoardStore();
    const [showMenu, setShowMenu] = useState(false);

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
                className={`flex flex-col min-w-[300px] max-w-[300px] bg-dark-850 border border-dark-700 rounded-2xl ${isOver ? 'border-primary-500/50 shadow-lg shadow-primary-500/5' : ''
                    } transition-all`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-dark-700">
                    {isEditingTitle ? (
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={handleTitleSave}
                            onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                            className="text-sm font-semibold bg-dark-800 border border-dark-500 rounded-md px-2 py-1 text-white focus:ring-2 focus:ring-primary-500 outline-none flex-1"
                            autoFocus
                        />
                    ) : (
                        <h3
                            className="text-sm font-semibold text-dark-200 cursor-pointer hover:text-white transition-colors flex-1"
                            onClick={() => setIsEditingTitle(true)}
                        >
                            {list.title}
                            <span className="text-dark-500 font-normal ml-2">{list.tasks.length}</span>
                        </h3>
                    )}

                    {/* Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="text-dark-400 hover:text-white p-1 rounded-md hover:bg-dark-700 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                        </button>
                        {showMenu && (
                            <div className="absolute right-0 mt-1 w-40 bg-dark-800 border border-dark-600 rounded-lg shadow-2xl z-10 animate-fade-in">
                                <button
                                    onClick={handleDelete}
                                    className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    Delete List
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tasks */}
                <div ref={setNodeRef} className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[80px]">
                    <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                        {list.tasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onClick={() => setSelectedTask(task)}
                            />
                        ))}
                    </SortableContext>

                    {list.tasks.length === 0 && (
                        <div className="py-8 text-center text-dark-500 text-sm">
                            No tasks yet
                        </div>
                    )}
                </div>

                {/* Add task */}
                <div className="border-t border-dark-700 p-1">
                    <CreateTaskButton listId={list.id} />
                </div>
            </div>

            {/* Task modal */}
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
