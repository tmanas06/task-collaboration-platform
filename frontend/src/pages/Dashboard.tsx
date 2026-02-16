import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBoardStore } from '../store/boardStore';
import { useDebounce } from '../hooks/useDebounce';
import CreateBoardModal from '../components/board/CreateBoardModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Navbar from '../components/common/Navbar';

const BOARD_COLORS = [
    'from-violet-600 to-indigo-600',
    'from-cyan-600 to-blue-600',
    'from-emerald-600 to-teal-600',
    'from-orange-600 to-red-600',
    'from-pink-600 to-rose-600',
    'from-amber-500 to-orange-500',
];

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
        <div className="min-h-screen bg-dark-950">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Your Boards</h1>
                        <p className="text-dark-400 mt-1">Manage your projects and collaborate</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium rounded-xl hover:from-primary-500 hover:to-primary-400 transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Board
                    </button>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-dark-900 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            placeholder="Search boards..."
                        />
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
                        {error}
                    </div>
                )}

                {/* Loading */}
                {isLoading && <LoadingSpinner size="lg" />}

                {/* Board Grid */}
                {!isLoading && boards.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-dark-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">No boards yet</h3>
                        <p className="text-dark-400 mb-6">Create your first board to get started</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-5 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-500 transition-colors"
                        >
                            Create Board
                        </button>
                    </div>
                )}

                {!isLoading && boards.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {boards.map((board, index) => (
                                <Link
                                    key={board.id}
                                    to={`/board/${board.id}`}
                                    className="group relative bg-dark-900 border border-dark-700 rounded-2xl overflow-hidden hover:border-primary-500/30 hover:shadow-xl hover:shadow-primary-500/5 transition-all animate-fade-in"
                                >
                                    {/* Color strip */}
                                    <div className={`h-2 bg-gradient-to-r ${BOARD_COLORS[index % BOARD_COLORS.length]}`} />

                                    <div className="p-5">
                                        <h3 className="text-lg font-semibold text-white group-hover:text-primary-300 transition-colors">
                                            {board.title}
                                        </h3>
                                        {board.description && (
                                            <p className="text-sm text-dark-400 mt-1.5 line-clamp-2">{board.description}</p>
                                        )}

                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex -space-x-2">
                                                {board.members.slice(0, 3).map((m) => (
                                                    <div
                                                        key={m.id}
                                                        className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-xs font-medium text-white border-2 border-dark-900"
                                                    >
                                                        {m.user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                ))}
                                                {board.members.length > 3 && (
                                                    <div className="w-7 h-7 bg-dark-700 rounded-full flex items-center justify-center text-xs text-dark-300 border-2 border-dark-900">
                                                        +{board.members.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-xs text-dark-500">
                                                {board._count?.lists || 0} lists
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-8">
                                <button
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-dark-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-dark-400 px-4">
                                    Page {page} of {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                                    disabled={page === pagination.totalPages}
                                    className="px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-dark-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>

            <CreateBoardModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
        </div>
    );
}
