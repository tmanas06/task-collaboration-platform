import { useState } from 'react';
import { useBoardStore } from '../../store/boardStore';
import { Plus, X, CornerDownLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    listId: string;
}

export default function CreateTaskButton({ listId }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { createTask } = useBoardStore();

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
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

    return (
        <AnimatePresence mode="wait">
            {!isOpen ? (
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setIsOpen(true)}
                    className="w-full py-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground hover:bg-foreground/5 border-2 border-dashed border-transparent hover:border-foreground/20 rounded-xl transition-all flex items-center justify-center gap-2 group"
                >
                    <Plus className="w-4 h-4 group-hover:scale-125 transition-transform" />
                    Add Task
                </motion.button>
            ) : (
                <motion.form
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    onSubmit={handleSubmit}
                    className="p-1 space-y-3"
                >
                    <div className="relative">
                        <textarea
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 bg-background border-2 border-foreground/20 focus:border-accent-color rounded-xl text-sm font-bold text-foreground placeholder-muted-foreground/50 outline-none resize-none shadow-sm transition-all focus:shadow-[4px_4px_0px_0px_rgba(var(--accent-rgb),0.2)]"
                            rows={3}
                            placeholder="Enter task title..."
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                                if (e.key === 'Escape') setIsOpen(false);
                            }}
                        />
                        <div className="absolute bottom-3 right-3 flex items-center gap-1 opacity-40 pointer-events-none">
                            <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Return</span>
                            <CornerDownLeft className="w-3 h-3 text-muted-foreground" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={isLoading || !title.trim()}
                            className="flex-1 py-2.5 bg-foreground text-background text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-accent-color hover:text-white disabled:opacity-50 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none"
                        >
                            {isLoading ? '...' : 'Add Task'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setIsOpen(false); setTitle(''); }}
                            className="p-2 text-muted-foreground hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </motion.form>
            )}
        </AnimatePresence>
    );
}
