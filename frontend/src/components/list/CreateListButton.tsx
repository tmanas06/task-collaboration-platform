import { useState } from 'react';
import { useBoardStore } from '../../store/boardStore';

interface Props {
    boardId: string;
}

export default function CreateListButton({ boardId }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { createList } = useBoardStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsLoading(true);
        try {
            await createList(title.trim(), boardId);
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
                className="min-w-[280px] h-fit py-4 px-4 bg-dark-800/50 border-2 border-dashed border-dark-600 rounded-2xl text-dark-400 hover:text-white hover:border-primary-500/50 hover:bg-dark-800 transition-all flex items-center justify-center gap-2 group"
            >
                <svg className="w-5 h-5 group-hover:text-primary-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="font-medium">Add List</span>
            </button>
        );
    }

    return (
        <div className="min-w-[280px] bg-dark-850 border border-dark-600 rounded-2xl p-4">
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2.5 bg-dark-800 border border-dark-500 rounded-lg text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    placeholder="Enter list title..."
                    autoFocus
                    onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
                />
                <div className="flex gap-2 mt-3">
                    <button
                        type="submit"
                        disabled={isLoading || !title.trim()}
                        className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-500 disabled:opacity-50 transition-colors"
                    >
                        {isLoading ? '...' : 'Add List'}
                    </button>
                    <button
                        type="button"
                        onClick={() => { setIsOpen(false); setTitle(''); }}
                        className="px-3 py-2 text-dark-400 hover:text-white text-sm rounded-lg hover:bg-dark-700 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
