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
                    className="w-[320px] h-fit py-5 px-6 bg-white/5 border-2 border-dashed border-white/5 rounded-2xl text-zinc-500 hover:text-white hover:border-indigo-500/30 hover:bg-white/10 transition-all flex items-center justify-center gap-3 group"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    <span className="font-black uppercase tracking-widest text-xs">Add new column</span>
                </motion.button>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="w-[320px] glass-card rounded-2xl p-5 border-indigo-500/30 ring-4 ring-indigo-500/5 shadow-2xl"
                >
                    <form onSubmit={handleSubmit}>
                        <div className="flex items-center gap-2 mb-4">
                            <ListPlus className="w-4 h-4 text-indigo-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">New Column</span>
                        </div>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-white placeholder-zinc-700 focus:border-indigo-500/50 outline-none text-sm font-bold transition-all"
                            placeholder="e.g. In Review, Testing..."
                            autoFocus
                            onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
                        />
                        <div className="flex gap-2 mt-4">
                            <button
                                type="submit"
                                disabled={isLoading || !title.trim()}
                                className="flex-1 py-2.5 bg-white text-black text-xs font-black uppercase tracking-widest rounded-xl hover:bg-zinc-200 disabled:opacity-50 transition-all"
                            >
                                {isLoading ? 'Adding...' : 'Create'}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setIsOpen(false); setTitle(''); }}
                                className="p-2.5 text-zinc-500 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
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
