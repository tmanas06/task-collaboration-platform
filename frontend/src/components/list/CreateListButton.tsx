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
                    className="w-[320px] h-fit py-6 px-6 bg-muted/5 border-4 border-dashed border-foreground/20 rounded-[2rem] text-muted-foreground hover:text-foreground hover:border-foreground hover:bg-muted/10 transition-all flex items-center justify-center gap-3 group"
                >
                    <div className="w-10 h-10 rounded-xl border-4 border-current flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                        <Plus className="w-6 h-6 stroke-[3]" />
                    </div>
                    <span className="font-black uppercase tracking-widest text-sm">Add New List</span>
                </motion.button>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="w-[320px] bg-card border-4 border-foreground rounded-[2rem] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden"
                >
                    {/* Noise Texture */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-soft-light" />

                    <form onSubmit={handleSubmit} className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-accent-color rounded-lg border-2 border-foreground flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <ListPlus className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-foreground">New List</span>
                        </div>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 bg-background border-2 border-foreground rounded-xl text-foreground placeholder-muted-foreground/50 focus:border-accent-color outline-none text-lg font-bold transition-all shadow-sm focus:shadow-[4px_4px_0px_0px_rgba(var(--accent-rgb),0.4)]"
                            placeholder="List Title..."
                            autoFocus
                            onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                type="submit"
                                disabled={isLoading || !title.trim()}
                                className="flex-1 py-3 bg-foreground text-background text-xs font-black uppercase tracking-widest rounded-xl hover:bg-accent-color hover:text-white disabled:opacity-50 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:-translate-y-0.5"
                            >
                                {isLoading ? 'Adding...' : 'Create List'}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setIsOpen(false); setTitle(''); }}
                                className="p-3 text-muted-foreground hover:text-rose-500 rounded-xl border-2 border-transparent hover:border-rose-500 hover:bg-rose-500/10 transition-all"
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
