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
                        <h1 className="text-4xl font-extrabold tracking-tight gradient-text mb-2">
                            Workspace
                        </h1>
                        <p className="text-muted-foreground font-medium">
                            Explore your boards and collaborate in real-time.
                        </p>
                    </motion.div>

                    <motion.button
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-accent-color text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-accent-color/20"
                    >
                        <Plus className="w-5 h-5" />
                        New Project
                    </motion.button>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent-color transition-colors" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-muted/20 border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:bg-muted/30 focus:border-accent-color outline-none transition-all backdrop-blur-sm"
                            placeholder="Search board names, descriptions..."
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
                        <div className="w-24 h-24 bg-muted/20 rounded-[2rem] flex items-center justify-center mb-6 border border-border shadow-inner text-muted-foreground">
                            <LayoutGrid className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">Clean Slate</h3>
                        <p className="text-muted-foreground max-w-sm mb-8 font-medium">
                            You don't have any boards yet. Start by creating one to organize your tasks.
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-8 py-3 bg-muted/20 border border-border text-foreground font-bold rounded-2xl hover:bg-muted/30 transition-all"
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
                                    className="group block relative h-full glass-card overflow-hidden hover:scale-[1.02] transition-all duration-300 rounded-2xl"
                                >
                                    {/* Accent Gradient */}
                                    <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${BOARD_COLORS[index % BOARD_COLORS.length]}`} />

                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <h3 className="text-xl font-bold text-foreground group-hover:text-accent-color transition-colors">
                                                {board.title}
                                            </h3>
                                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                        </div>

                                        {board.description ? (
                                            <p className="text-sm text-muted-foreground mb-6 line-clamp-2 leading-relaxed">
                                                {board.description}
                                            </p>
                                        ) : (
                                            <div className="h-10 border-b border-border mb-6" />
                                        )}

                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold uppercase tracking-wider">
                                                <Hash className="w-3 h-3" />
                                                {board._count?.lists || 0} Columns
                                            </div>

                                            <div className="flex -space-x-3">
                                                {board.members.slice(0, 3).map((m) => (
                                                    <div
                                                        key={m.id}
                                                        className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-black text-foreground overflow-hidden"
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
                                                    <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] text-muted-foreground font-bold">
                                                        +{board.members.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hover Glow */}
                                    <div className="absolute inset-0 bg-accent-color/5 opacity-0 group-hover:opacity-100 transition-opacity" />
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
