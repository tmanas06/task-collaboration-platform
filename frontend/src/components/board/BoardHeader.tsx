import { useState } from 'react';
import type { Board, User } from '../../types';
import { useBoardStore } from '../../store/boardStore';
import { boardsApi } from '../../services/api';
import { Users, UserPlus, Settings, Hash, ChevronDown, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    const { updateBoard, fetchBoard } = useBoardStore();

    const isAdmin = board.members.some(
        (m) => m.userId === currentUser.id && m.role === 'ADMIN'
    );

    const handleTitleSave = async () => {
        if (title.trim() && title !== board.title) {
            await updateBoard(board.id, { title: title.trim() });
        }
        setIsEditing(false);
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!memberEmail.trim()) return;
        setAddingMember(true);
        setMemberError('');
        try {
            await boardsApi.addMember(board.id, { email: memberEmail.trim() });
            setMemberEmail('');
            fetchBoard(board.id);
        } catch (err: any) {
            setMemberError(err.response?.data?.error || 'Failed to add member');
        } finally {
            setAddingMember(false);
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
                    <div className="relative">
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
                                    className="absolute right-0 mt-4 w-96 glass-card rounded-3xl shadow-2xl z-50 overflow-hidden"
                                >
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-indigo-400" />
                                                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Team Access</h3>
                                            </div>
                                            <span className="px-2 py-0.5 rounded-lg bg-zinc-800 text-[10px] font-black text-zinc-400 uppercase tracking-tighter">
                                                {board.members.length} Members
                                            </span>
                                        </div>

                                        <div className="space-y-4 max-h-64 overflow-y-auto no-scrollbar mb-6 px-1">
                                            {board.members.map((m) => (
                                                <div key={m.id} className="flex items-center justify-between group/member">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-zinc-800 border border-white/5 rounded-xl flex items-center justify-center text-xs font-black text-white">
                                                            {m.user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <p className="text-sm font-bold text-white">{m.user.name}</p>
                                                            <p className="text-[10px] text-zinc-500 font-medium">{m.user.email}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${m.role === 'ADMIN' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-zinc-800 text-zinc-500'}`}>
                                                        {m.role}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {isAdmin && (
                                            <form onSubmit={handleAddMember} className="relative pt-6 border-t border-white/5">
                                                <div className="flex flex-col gap-3">
                                                    <div className="relative">
                                                        <input
                                                            type="email"
                                                            value={memberEmail}
                                                            onChange={(e) => setMemberEmail(e.target.value)}
                                                            className="w-full pl-4 pr-12 py-3 bg-zinc-900 border border-white/5 rounded-2xl text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50 transition-all font-medium"
                                                            placeholder="Invite via email..."
                                                        />
                                                        <button
                                                            type="submit"
                                                            disabled={addingMember}
                                                            className="absolute right-2 top-1.5 p-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white transition-all disabled:opacity-50"
                                                        >
                                                            <UserPlus className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    {memberError && (
                                                        <p className="text-[10px] font-bold text-rose-500 px-2">{memberError}</p>
                                                    )}
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button className="p-3 bg-zinc-900 border border-white/5 rounded-2xl text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all shadow-inner">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
