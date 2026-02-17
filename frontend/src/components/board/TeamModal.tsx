import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, UserPlus, Search, Loader2, Shield, Edit3, Eye, Trash2 } from 'lucide-react';
import { useBoardStore } from '../../store/boardStore';
import { usersApi } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import type { Board, User, Role } from '../../types';

interface Props {
    board: Board;
    currentUser: User;
    onClose: () => void;
}

const ROLE_CONFIG: Record<Role, { icon: any; label: string; description: string; color: string; bg: string }> = {
    ADMIN: {
        icon: Shield,
        label: 'Admin',
        description: 'Full access to board and settings',
        color: 'text-accent-color',
        bg: 'bg-accent-color/10 border-accent-color/20'
    },
    EDITOR: {
        icon: Edit3,
        label: 'Editor',
        description: 'Can edit tasks and lists',
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    VIEWER: {
        icon: Eye,
        label: 'Viewer',
        description: 'Read-only access',
        color: 'text-muted-foreground',
        bg: 'bg-muted/30 border-border/50'
    },
    MEMBER: {
        icon: Users,
        label: 'Member',
        description: 'Standard access (alias for Editor)',
        color: 'text-blue-500',
        bg: 'bg-blue-500/10 border-blue-500/20'
    }
};

export default function TeamModal({ board, currentUser, onClose }: Props) {
    const [email, setEmail] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [error, setError] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const debouncedSearch = useDebounce(email, 300);
    const { updateMemberRole, removeMember, fetchBoard } = useBoardStore();

    const isAdmin = board.members.some(
        (m) => m.userId === currentUser.id && m.role === 'ADMIN'
    );

    useEffect(() => {
        const searchUsers = async () => {
            if (debouncedSearch.length < 2) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            try {
                const results = await usersApi.search(debouncedSearch);
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

    const handleAddMember = async (targetEmail: string) => {
        setIsAdding(true);
        setError('');
        try {
            // Re-using boardsApi directly since it's already in BoardHeader logic
            const { boardsApi } = await import('../../services/api');
            await boardsApi.addMember(board.id, { email: targetEmail });
            setEmail('');
            setSearchResults([]);
            fetchBoard(board.id);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to add member');
        } finally {
            setIsAdding(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: Role) => {
        try {
            await updateMemberRole(board.id, userId, newRole);
        } catch (err: any) {
            setError(err.message || 'Failed to update role');
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!window.confirm('Are you sure you want to remove this member?')) return;
        try {
            await removeMember(board.id, userId);
        } catch (err: any) {
            setError(err.message || 'Failed to remove member');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/60 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                className="bg-card border-4 border-foreground w-full max-w-2xl rounded-[3rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(var(--accent-rgb),0.2)] overflow-hidden transition-colors relative"
            >
                {/* Header */}
                <div className="px-10 py-8 border-b-4 border-foreground flex items-center justify-between bg-accent-color/5">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-foreground rounded-[1.5rem] flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform cursor-pointer">
                            <Users className="w-8 h-8 text-background" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase">Board Team</h2>
                            <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.2em] opacity-60">Manage your squad</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-4 hover:bg-rose-500 hover:text-white rounded-2xl text-muted-foreground border-2 border-transparent hover:border-foreground transition-all duration-300"
                    >
                        <X className="w-8 h-8" />
                    </button>
                </div>

                <div className="p-10 space-y-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat opacity-100">
                    {/* Add Member Section */}
                    {isAdmin && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-6 bg-accent-color rounded-full" />
                                <h3 className="text-sm font-black text-foreground uppercase tracking-[0.3em]">Invite Member</h3>
                            </div>
                            <div className="relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-accent-color transition-colors" />
                                <input
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-16 pr-6 py-6 bg-background border-4 border-foreground rounded-[2rem] text-lg font-bold text-foreground placeholder-muted-foreground/30 outline-none focus:ring-8 focus:ring-accent-color/10 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:translate-x-1 focus:translate-y-1 focus:shadow-none"
                                    placeholder="Enter name or email address..."
                                />
                                {isSearching && (
                                    <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-accent-color animate-spin" />
                                )}
                            </div>

                            <AnimatePresence>
                                {searchResults.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="p-3 bg-foreground border-4 border-foreground rounded-[2rem] space-y-2 max-h-60 overflow-y-auto no-scrollbar shadow-2xl"
                                    >
                                        {searchResults.map((user) => (
                                            <button
                                                key={user.id}
                                                onClick={() => handleAddMember(user.email)}
                                                disabled={isAdding}
                                                className="w-full flex items-center justify-between p-4 hover:bg-accent-color group rounded-[1.5rem] transition-all bg-background border-2 border-transparent hover:border-foreground"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-muted/20 border-2 border-border flex items-center justify-center text-lg font-black text-foreground group-hover:bg-white group-hover:text-foreground">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-base font-black text-foreground group-hover:text-white leading-none mb-1">{user.name}</p>
                                                        <p className="text-xs text-muted-foreground group-hover:text-white/80 font-bold tracking-tight">{user.email}</p>
                                                    </div>
                                                </div>
                                                <div className="p-3 bg-accent-color/10 rounded-xl group-hover:bg-white transition-colors">
                                                    <UserPlus className="w-6 h-6 text-accent-color" />
                                                </div>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {error && (
                        <div className="p-6 bg-rose-500 border-4 border-foreground rounded-3xl text-sm font-black text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] uppercase tracking-widest">
                            Error: {error}
                        </div>
                    )}

                    {/* Members List */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-6 bg-foreground rounded-full" />
                                <h3 className="text-sm font-black text-foreground uppercase tracking-[0.3em]">Current Team</h3>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-foreground text-background px-3 py-1 rounded-full">
                                {board.members.length} Users
                            </span>
                        </div>
                        <div className="space-y-4 max-h-[25rem] overflow-y-auto pr-4 no-scrollbar pb-6">
                            {board.members.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between p-5 bg-background border-4 border-foreground rounded-[2rem] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all group"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="relative">
                                            <div className="w-16 h-16 bg-muted/20 border-4 border-foreground rounded-[1.2rem] flex items-center justify-center overflow-hidden shadow-inner">
                                                {member.user.avatar ? (
                                                    <img src={member.user.avatar} alt={member.user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-2xl font-black text-foreground">{member.user.name.charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                            {member.userId === currentUser.id && (
                                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-foreground rounded-full shadow-lg" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-foreground leading-none mb-1 flex items-center gap-2">
                                                {member.user.name}
                                                {member.userId === currentUser.id && (
                                                    <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-lg border border-emerald-500/20 uppercase tracking-tighter">You</span>
                                                )}
                                            </p>
                                            <p className="text-xs text-muted-foreground font-bold tracking-tight">{member.user.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {isAdmin && member.userId !== currentUser.id ? (
                                            <div className="flex items-center gap-3 group/actions">
                                                <select
                                                    value={member.role}
                                                    onChange={(e) => handleRoleChange(member.userId, e.target.value as Role)}
                                                    className="bg-muted/10 border-2 border-foreground rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest outline-none focus:bg-foreground focus:text-background transition-all cursor-pointer"
                                                >
                                                    <option value="ADMIN">Admin</option>
                                                    <option value="EDITOR">Editor</option>
                                                    <option value="VIEWER">Viewer</option>
                                                </select>
                                                <button
                                                    onClick={() => handleRemoveMember(member.userId)}
                                                    className="p-3 text-muted-foreground hover:text-white hover:bg-rose-500 border-2 border-transparent hover:border-foreground rounded-xl transition-all"
                                                    title="Remove Member"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-foreground ${(() => {
                                                const Config = ROLE_CONFIG[member.role] || ROLE_CONFIG.EDITOR;
                                                return Config.bg;
                                            })()}`}>
                                                {(() => {
                                                    const Config = ROLE_CONFIG[member.role] || ROLE_CONFIG.EDITOR;
                                                    const Icon = Config.icon;
                                                    return (
                                                        <>
                                                            <Icon className={`w-4 h-4 ${Config.color}`} />
                                                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${Config.color}`}>
                                                                {Config.label}
                                                            </span>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
