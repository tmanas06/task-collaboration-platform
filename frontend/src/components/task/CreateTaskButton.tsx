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
                    className="w-full py-3 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-accent-color hover:bg-accent-color/5 rounded-xl transition-all flex items-center justify-center gap-2 group"
                >
                    <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
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
                            className="w-full px-4 py-3 bg-muted/20 border border-border rounded-xl text-sm font-bold text-foreground placeholder-muted-foreground focus:border-accent-color/50 outline-none resize-none shadow-inner transition-colors"
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
                        <div className="absolute bottom-3 right-3 flex items-center gap-1 opacity-20">
                            <span className="text-[10px] font-bold text-muted-foreground">Return</span>
                            <CornerDownLeft className="w-3 h-3 text-muted-foreground" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={isLoading || !title.trim()}
                            className="flex-1 py-2 bg-accent-color text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-accent-color/20"
                        >
                            {isLoading ? '...' : 'Add Task'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setIsOpen(false); setTitle(''); }}
                            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/10 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </motion.form>
            )}
        </AnimatePresence>
    );
}
