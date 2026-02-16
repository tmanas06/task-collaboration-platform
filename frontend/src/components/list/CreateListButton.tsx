import { useState } from 'react';
import { useBoardStore } from '../../store/boardStore';
import { Plus, X, ListPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

    return (
        <AnimatePresence mode="wait">
            {!isOpen ? (
                <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    className="w-[320px] h-fit py-5 px-6 bg-muted/5 border-2 border-dashed border-border rounded-2xl text-muted-foreground hover:text-accent-color hover:border-accent-color/30 hover:bg-accent-color/5 transition-all flex items-center justify-center gap-3 group"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    <span className="font-black uppercase tracking-widest text-xs">Add new column</span>
                </motion.button>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="w-[320px] bg-card border border-border rounded-2xl p-5 ring-4 ring-accent-color/5 shadow-2xl transition-colors"
                >
                    <form onSubmit={handleSubmit}>
                        <div className="flex items-center gap-2 mb-4">
                            <ListPlus className="w-4 h-4 text-accent-color" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">New Column</span>
                        </div>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 bg-muted/20 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:border-accent-color/50 outline-none text-sm font-bold transition-all"
                            placeholder="e.g. In Review, Testing..."
                            autoFocus
                            onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
                        />
                        <div className="flex gap-2 mt-4">
                            <button
                                type="submit"
                                disabled={isLoading || !title.trim()}
                                className="flex-1 py-2.5 bg-accent-color text-white text-xs font-black uppercase tracking-widest rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-accent-color/20"
                            >
                                {isLoading ? 'Adding...' : 'Create'}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setIsOpen(false); setTitle(''); }}
                                className="p-2.5 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted/10 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
