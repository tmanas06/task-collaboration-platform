import { useState, useEffect, useRef } from 'react';
import type { Board, User } from '../../types';
import { useBoardStore } from '../../store/boardStore';
import { boardsApi, usersApi } from '../../services/api';
import { Users, UserPlus, Settings, Hash, ChevronDown, Check, X, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '../../hooks/useDebounce';

interface Props {
    board: Board;
    currentUser: User;
}

export default function BoardHeader({ board, currentUser }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(board.title);
    const [showMembers, setShowMembers] = useState(false);
    const [memberEmail, setMemberEmail] = useState('');
    const [addingMember, setAddingMember] = useState(false);
    const [memberError, setMemberError] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const debouncedSearch = useDebounce(memberEmail, 300);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const settingsRef = useRef<HTMLDivElement>(null);
    const [processingEmail, setProcessingEmail] = useState<string | null>(null);

    const { updateBoard, fetchBoard } = useBoardStore();

    const isAdmin = board.members.some(
        (m) => m.userId === currentUser.id && m.role === 'ADMIN'
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setShowSettings(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const searchUsers = async () => {
            if (debouncedSearch.length < 2) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            try {
                const results = await usersApi.search(debouncedSearch);
                // Filter out existing members
                const existingUserIds = board.members.map(m => m.userId);
                setSearchResults(results.filter(u => !existingUserIds.includes(u.id)));
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setIsSearching(false);
            }
        };
        searchUsers();
    }, [debouncedSearch, board.members]);

    const handleTitleSave = async () => {
        if (title.trim() && title !== board.title) {
            await updateBoard(board.id, { title: title.trim() });
        }
        setIsEditing(false);
    };

    const handleAddMember = async (email: string) => {
        setAddingMember(true);
        setProcessingEmail(email);
        setMemberError('');
        try {
            await boardsApi.addMember(board.id, { email });
            setMemberEmail('');
            setSearchResults([]);
            fetchBoard(board.id);
        } catch (err: any) {
            setMemberError(err.response?.data?.error || 'Failed to add member');
        } finally {
            setAddingMember(false);
            setProcessingEmail(null);
        }
    };

    return (
        <div className="bg-black/20 px-8 py-6 backdrop-blur-md border-b border-white/5 relative z-20">
            <div className="max-w-[1800px] mx-auto flex items-center justify-between flex-wrap gap-6">
                {/* Title Section */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-inner">
                            <Hash className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div className="flex flex-col">
                            <AnimatePresence mode="wait">
                                {isEditing && isAdmin ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="flex items-center gap-2"
                                    >
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                                            className="text-2xl font-black bg-zinc-900 border border-indigo-500/50 rounded-xl px-3 py-1 text-white outline-none ring-4 ring-indigo-500/10"
                                            autoFocus
                                        />
                                        <button onClick={handleTitleSave} className="p-2 bg-indigo-600 rounded-lg text-white">
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setIsEditing(false)} className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.h1
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className={`text-3xl font-black tracking-tight text-white ${isAdmin ? 'cursor-pointer hover:text-indigo-400 transition-colors' : ''}`}
                                        onClick={() => isAdmin && setIsEditing(true)}
                                    >
                                        {board.title}
                                    </motion.h1>
                                )}
                            </AnimatePresence>
                            <p className="text-sm text-zinc-500 font-medium">
                                {board.description || 'No description provided'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Controls Section */}
                <div className="flex items-center gap-3">
                    <div className="relative" ref={dropdownRef}>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowMembers(!showMembers)}
                            className="flex items-center gap-3 px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group"
                        >
                            <div className="flex -space-x-3">
                                {board.members.slice(0, 3).map((m) => (
                                    <div
                                        key={m.id}
                                        className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-[#0a0a0a] flex items-center justify-center text-[10px] font-black text-white group-hover:border-indigo-500/30 transition-colors"
                                    >
                                        {m.user.name.charAt(0).toUpperCase()}
                                    </div>
                                ))}
                                {board.members.length > 3 && (
                                    <div className="w-8 h-8 rounded-full bg-zinc-900 border-2 border-[#0a0a0a] flex items-center justify-center text-[10px] font-bold text-zinc-400">
                                        +{board.members.length - 3}
                                    </div>
                                )}
                            </div>
                            <span className="text-sm font-bold text-zinc-300">Share</span>
                            <ChevronDown className={`w-4 h-4 text-zinc-600 transition-transform ${showMembers ? 'rotate-180' : ''}`} />
                        </motion.button>

                        <AnimatePresence>
                            {showMembers && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    className="absolute right-0 mt-4 w-96 glass-card rounded-3xl shadow-2xl z-50 overflow-hidden bg-zinc-950 border border-white/10"
                                >
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-indigo-400" />
                                                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Board Access</h3>
                                            </div>
                                            <span className="px-2 py-0.5 rounded-lg bg-white/5 text-[10px] font-black text-zinc-400 uppercase tracking-tighter">
                                                {board.members.length} Members
                                            </span>
                                        </div>

                                        {isAdmin && (
                                            <div className="mb-6">
                                                <div className="relative group">
                                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-white transition-colors" />
                                                    <input
                                                        type="text"
                                                        value={memberEmail}
                                                        onChange={(e) => setMemberEmail(e.target.value)}
                                                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-sm text-white placeholder-zinc-700 outline-none focus:bg-white/10 focus:border-indigo-500/50 transition-all"
                                                        placeholder="Search users by name or email..."
                                                    />
                                                    {isSearching && (
                                                        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 animate-spin" />
                                                    )}
                                                </div>

                                                <AnimatePresence>
                                                    {searchResults.length > 0 && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="mt-2 p-2 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl max-h-48 overflow-y-auto no-scrollbar"
                                                        >
                                                            {searchResults.map((user) => (
                                                                <button
                                                                    key={user.id}
                                                                    onClick={() => handleAddMember(user.email)}
                                                                    disabled={addingMember}
                                                                    className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded-xl transition-all text-left group"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-[10px] font-bold text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                                            {user.name.charAt(0).toUpperCase()}
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="text-xs font-bold text-white leading-none mb-1">{user.name}</span>
                                                                            <span className="text-[10px] text-zinc-500 leading-none">{user.email}</span>
                                                                        </div>
                                                                    </div>
                                                                    {processingEmail === user.email ? (
                                                                        <div className="flex items-center gap-2 px-2 py-1 bg-indigo-500/10 rounded-lg">
                                                                            <span className="text-[10px] font-bold text-indigo-400">Adding...</span>
                                                                            <Loader2 className="w-3 h-3 text-indigo-500 animate-spin" />
                                                                        </div>
                                                                    ) : (
                                                                        <UserPlus className="w-4 h-4 text-zinc-700 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all" />
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                                {memberError && (
                                                    <p className="mt-2 text-[10px] font-bold text-rose-500 px-2">{memberError}</p>
                                                )}
                                            </div>
                                        )}

                                        <div className="space-y-1 max-h-64 overflow-y-auto no-scrollbar">
                                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3 px-1">Current Team</p>
                                            {board.members.map((m) => (
                                                <div key={m.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-2xl group/member transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            <div className="w-10 h-10 bg-zinc-900 border border-white/5 rounded-xl flex items-center justify-center text-xs font-black text-white">
                                                                {m.user.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            {m.user.id === currentUser.id && (
                                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-zinc-950 rounded-full" />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <p className="text-sm font-bold text-white">
                                                                {m.user.name}
                                                                {m.user.id === currentUser.id && <span className="ml-1.5 text-[10px] text-zinc-500 font-medium">(You)</span>}
                                                            </p>
                                                            <p className="text-[10px] text-zinc-500 font-medium">{m.user.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${m.role === 'ADMIN' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-zinc-800 text-zinc-500'}`}>
                                                        {m.role}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="relative" ref={settingsRef}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-3 bg-white/5 border border-white/10 rounded-2xl text-zinc-500 hover:text-indigo-400 hover:bg-white/10 transition-all shadow-inner group"
                        >
                            <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />
                        </motion.button>

                        <AnimatePresence>
                            {showSettings && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    className="absolute right-0 mt-4 w-64 bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden p-2"
                                >
                                    <div className="px-3 py-2 border-b border-white/5 mb-1">
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Board Settings</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsEditing(true);
                                            setShowSettings(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all text-xs font-medium group"
                                    >
                                        <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center">
                                            <Hash className="w-3.5 h-3.5" />
                                        </div>
                                        Rename Board
                                    </button>
                                    <button
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all text-xs font-medium group"
                                    >
                                        <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center text-zinc-600 group-hover:text-indigo-400">
                                            <Users className="w-3.5 h-3.5" />
                                        </div>
                                        Manage Roles
                                    </button>
                                    <div className="h-px bg-white/5 my-1 mx-2" />
                                    <button
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all text-xs font-bold group"
                                    >
                                        <div className="w-7 h-7 bg-rose-500/10 rounded-lg flex items-center justify-center text-rose-500">
                                            <X className="w-3.5 h-3.5" />
                                        </div>
                                        Delete Project
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
