import { useState } from 'react';
import { useBoardStore } from '../../store/boardStore';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateBoardModal({ isOpen, onClose }: Props) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { createBoard } = useBoardStore();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsLoading(true);
        try {
            await createBoard(title.trim(), description.trim() || undefined);
            setTitle('');
            setDescription('');
            onClose();
        } catch {
            // Error handled by store
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
                className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-in transition-colors"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold text-foreground mb-5">Create New Board</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1.5">Board Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 bg-muted/20 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-accent-color focus:border-transparent outline-none transition-all"
                            placeholder="My Awesome Project"
                            autoFocus
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1.5">Description (optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 bg-muted/20 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-accent-color focus:border-transparent outline-none transition-all resize-none"
                            rows={3}
                            placeholder="What's this board about?"
                        />
                    </div>

                    <div className="flex gap-3 justify-end pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted/20 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !title.trim()}
                            className="px-5 py-2.5 bg-accent-color text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-accent-color/25"
                        >
                            {isLoading ? 'Creating...' : 'Create Board'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
