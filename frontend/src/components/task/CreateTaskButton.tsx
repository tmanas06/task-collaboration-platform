import { useState } from 'react';
import { useBoardStore } from '../../store/boardStore';

interface Props {
    listId: string;
}

export default function CreateTaskButton({ listId }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { createTask } = useBoardStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsLoading(true);
        try {
            await createTask(title.trim(), listId);
            setTitle('');
            setIsOpen(false);
        } catch {
            // handled by store
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="w-full py-2 text-sm text-dark-400 hover:text-white hover:bg-dark-700/50 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add task
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="p-2">
            <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-sm text-white placeholder-dark-500 focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                rows={2}
                placeholder="Enter task title..."
                autoFocus
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                    }
                    if (e.key === 'Escape') setIsOpen(false);
                }}
            />
            <div className="flex gap-2 mt-2">
                <button
                    type="submit"
                    disabled={isLoading || !title.trim()}
                    className="px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-500 disabled:opacity-50 transition-colors"
                >
                    {isLoading ? '...' : 'Add'}
                </button>
                <button
                    type="button"
                    onClick={() => { setIsOpen(false); setTitle(''); }}
                    className="px-3 py-1.5 text-dark-400 hover:text-white text-sm rounded-lg hover:bg-dark-700 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
