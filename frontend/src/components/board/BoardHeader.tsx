import { useState } from 'react';
import type { Board, User } from '../../types';
import { useBoardStore } from '../../store/boardStore';
import { boardsApi } from '../../services/api';

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
        <div className="bg-dark-900/50 border-b border-dark-700 px-6 py-4 backdrop-blur-sm">
            <div className="flex items-center justify-between flex-wrap gap-4">
                {/* Title */}
                <div className="flex items-center gap-3">
                    {isEditing && isAdmin ? (
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={handleTitleSave}
                            onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                            className="text-2xl font-bold bg-dark-800 border border-dark-600 rounded-lg px-3 py-1 text-white focus:ring-2 focus:ring-primary-500 outline-none"
                            autoFocus
                        />
                    ) : (
                        <h1
                            className={`text-2xl font-bold text-white ${isAdmin ? 'cursor-pointer hover:text-primary-400 transition-colors' : ''}`}
                            onClick={() => isAdmin && setIsEditing(true)}
                        >
                            {board.title}
                        </h1>
                    )}
                    {board.description && (
                        <span className="text-dark-400 text-sm hidden md:inline">— {board.description}</span>
                    )}
                </div>

                {/* Members */}
                <div className="relative">
                    <button
                        onClick={() => setShowMembers(!showMembers)}
                        className="flex items-center gap-2 px-4 py-2 bg-dark-800 border border-dark-600 rounded-xl hover:bg-dark-700 transition-colors"
                    >
                        <div className="flex -space-x-2">
                            {board.members.slice(0, 4).map((m) => (
                                <div
                                    key={m.id}
                                    className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-xs font-medium text-white border-2 border-dark-800"
                                    title={m.user.name}
                                >
                                    {m.user.name.charAt(0).toUpperCase()}
                                </div>
                            ))}
                            {board.members.length > 4 && (
                                <div className="w-7 h-7 bg-dark-600 rounded-full flex items-center justify-center text-xs font-medium text-dark-300 border-2 border-dark-800">
                                    +{board.members.length - 4}
                                </div>
                            )}
                        </div>
                        <span className="text-sm text-dark-300">{board.members.length} members</span>
                    </button>

                    {/* Members dropdown */}
                    {showMembers && (
                        <div className="absolute right-0 mt-2 w-80 bg-dark-800 border border-dark-600 rounded-xl shadow-2xl z-20 animate-slide-down">
                            <div className="p-4">
                                <h3 className="text-sm font-semibold text-white mb-3">Board Members</h3>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {board.members.map((m) => (
                                        <div key={m.id} className="flex items-center justify-between py-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-xs font-medium text-white">
                                                    {m.user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm text-white">{m.user.name}</p>
                                                    <p className="text-xs text-dark-400">{m.user.email}</p>
                                                </div>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full ${m.role === 'ADMIN' ? 'bg-primary-500/20 text-primary-400' : 'bg-dark-600 text-dark-300'}`}>
                                                {m.role}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Add member */}
                                {isAdmin && (
                                    <form onSubmit={handleAddMember} className="mt-4 pt-4 border-t border-dark-600">
                                        <div className="flex gap-2">
                                            <input
                                                type="email"
                                                value={memberEmail}
                                                onChange={(e) => setMemberEmail(e.target.value)}
                                                className="flex-1 px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg text-sm text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 outline-none"
                                                placeholder="member@email.com"
                                            />
                                            <button
                                                type="submit"
                                                disabled={addingMember}
                                                className="px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-500 disabled:opacity-50 transition-colors"
                                            >
                                                {addingMember ? '...' : 'Add'}
                                            </button>
                                        </div>
                                        {memberError && (
                                            <p className="text-xs text-red-400 mt-2">{memberError}</p>
                                        )}
                                    </form>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
