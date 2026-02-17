import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBoardStore } from '../store/boardStore';
import { useDebounce } from '../hooks/useDebounce';
import CreateBoardModal from '../components/board/CreateBoardModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Navbar from '../components/common/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, LayoutGrid, Users, ChevronRight, Hash } from 'lucide-react';

const BOARD_COLORS = [
    'from-indigo-500 to-purple-600',
    'from-blue-500 to-cyan-400',
    'from-emerald-500 to-teal-400',
    'from-rose-500 to-pink-500',
    'from-amber-500 to-orange-400',
    'from-violet-500 to-fuchsia-500',
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
};

export default function Dashboard() {
    const { boards, pagination, isLoading, error, fetchBoards } = useBoardStore();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const debouncedSearch = useDebounce(search, 300);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    useEffect(() => {
        fetchBoards(page, 12, debouncedSearch || undefined);
    }, [page, debouncedSearch, fetchBoards]);

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <Navbar />

            <main className="max-w-[1400px] mx-auto px-6 py-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                    >
                        <h1 className="text-4xl font-black uppercase tracking-[0.2em] text-foreground mb-4">
                            Workspace
                        </h1>
                        <p className="text-muted-foreground font-bold text-lg">
                            Collaborate and manage projects with style.
                        </p>
                    </motion.div>

                    <motion.button
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-8 py-4 bg-foreground text-background font-black uppercase tracking-widest rounded-2xl hover:bg-accent-color hover:text-white transition-all shadow-[8px_8px_0px_0px_rgba(var(--accent-rgb),0.2)] hover:shadow-[12px_12px_0px_0px_rgba(var(--accent-rgb),0.4)] hover:-translate-y-1"
                    >
                        <Plus className="w-6 h-6" />
                        New Project
                    </motion.button>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row items-center gap-4 mb-12">
                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-accent-color transition-colors" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-16 pr-6 py-6 bg-background border-4 border-foreground/10 hover:border-foreground/30 focus:border-accent-color rounded-[2rem] text-xl font-bold text-foreground placeholder-muted-foreground/50 outline-none transition-all shadow-sm focus:shadow-[8px_8px_0px_0px_rgba(var(--accent-rgb),0.2)]"
                            placeholder="Search board names..."
                        />
                    </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-6 py-4 rounded-2xl mb-8 overflow-hidden font-medium"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Loading State */}
                {isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-48 rounded-2xl bg-muted/20 animate-pulse border border-border" />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && boards.length === 0 && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center justify-center py-32 text-center"
                    >
                        <div className="w-32 h-32 bg-background border-4 border-foreground rounded-[2.5rem] flex items-center justify-center mb-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(var(--accent-rgb),0.2)]">
                            <LayoutGrid className="w-12 h-12 text-foreground" />
                        </div>
                        <h3 className="text-3xl font-black uppercase tracking-widest text-foreground mb-4">Clean Slate</h3>
                        <p className="text-muted-foreground max-w-sm mb-10 font-bold text-lg">
                            You don't have any boards yet. Start by creating one to organize your tasks.
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-10 py-4 bg-background border-4 border-foreground text-foreground font-black uppercase tracking-widest rounded-2xl hover:bg-foreground hover:text-background transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:-translate-y-1"
                        >
                            Get Started
                        </button>
                    </motion.div>
                )}

                {/* Board Grid */}
                {!isLoading && boards.length > 0 && (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        {boards.map((board, index) => (
                            <motion.div key={board.id} variants={item}>
                                <Link
                                    to={`/board/${board.id}`}
                                    className="group block relative h-full bg-card border-4 border-foreground/10 hover:border-foreground rounded-[2.5rem] overflow-hidden hover:scale-[1.02] transition-all duration-300 shadow-sm hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[12px_12px_0px_0px_rgba(var(--accent-rgb),0.2)]"
                                >
                                    {/* Noise Texture */}
                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-soft-light group-hover:opacity-20 transition-opacity" />

                                    {/* Accent Gradient */}
                                    <div className={`absolute top-0 inset-x-0 h-3 bg-gradient-to-r ${BOARD_COLORS[index % BOARD_COLORS.length]}`} />

                                    <div className="p-8 flex flex-col h-full relative z-10">
                                        <div className="flex items-start justify-between mb-6">
                                            <h3 className="text-2xl font-black text-foreground group-hover:text-accent-color transition-colors uppercase tracking-tight leading-none pt-2">
                                                {board.title}
                                            </h3>
                                            <div className="w-10 h-10 bg-background border-2 border-foreground/10 group-hover:border-foreground rounded-full flex items-center justify-center transition-colors shadow-sm group-hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                                <ChevronRight className="w-5 h-5 text-foreground group-hover:translate-x-0.5 transition-transform" />
                                            </div>
                                        </div>

                                        {board.description ? (
                                            <p className="text-sm text-muted-foreground mb-8 line-clamp-2 leading-relaxed font-bold opacity-60">
                                                {board.description}
                                            </p>
                                        ) : (
                                            <div className="h-10 border-b-4 border-foreground/5 mb-8 w-1/3" />
                                        )}

                                        <div className="flex items-center justify-between mt-auto pt-6 border-t-2 border-foreground/5 group-hover:border-foreground/10 transition-colors">
                                            <div className="flex items-center gap-2 text-xs text-foreground font-black uppercase tracking-widest bg-foreground/5 px-3 py-1.5 rounded-lg">
                                                <Hash className="w-3.5 h-3.5" />
                                                {board._count?.lists || 0} Lists
                                            </div>

                                            <div className="flex -space-x-3 pl-2">
                                                {board.members.slice(0, 3).map((m) => (
                                                    <div
                                                        key={m.id}
                                                        className="w-8 h-8 rounded-xl bg-background border-2 border-foreground flex items-center justify-center text-[10px] font-black text-foreground overflow-hidden shadow-sm"
                                                        title={m.user.name}
                                                    >
                                                        {m.user.avatar ? (
                                                            <img src={m.user.avatar} alt={m.user.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            m.user.name.charAt(0).toUpperCase()
                                                        )}
                                                    </div>
                                                ))}
                                                {board.members.length > 3 && (
                                                    <div className="w-8 h-8 rounded-xl bg-foreground text-background border-2 border-background flex items-center justify-center text-[10px] font-black">
                                                        +{board.members.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center gap-4 mt-16"
                    >
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="px-6 py-2 rounded-xl bg-muted/20 border border-border text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            Prev
                        </button>
                        <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                            <span className="text-foreground">{page}</span>
                            <span className="opacity-30">/</span>
                            <span>{pagination.totalPages}</span>
                        </div>
                        <button
                            onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                            disabled={page === pagination.totalPages}
                            className="px-6 py-2 rounded-xl bg-muted/20 border border-border text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            Next
                        </button>
                    </motion.div>
                )}
            </main>

            <CreateBoardModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
        </div>
    );
}
