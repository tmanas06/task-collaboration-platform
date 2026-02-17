import { useEffect, useRef } from 'react';
import { useBoardStore } from '../../store/boardStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, User as UserIcon, Activity as ActivityIcon, MessageSquare, Plus, Move, Trash2, UserPlus, UserMinus, Layout, List as ListIcon, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import LoadingSpinner from '../common/LoadingSpinner';

interface Props {
    boardId: string;
    isOpen: boolean;
    onClose: () => void;
}

const ACTION_ICONS: Record<string, any> = {
    BOARD_CREATED: Layout,
    BOARD_UPDATED: Layout,
    LIST_CREATED: Plus,
    LIST_UPDATED: Plus,
    LIST_DELETED: Trash2,
    TASK_CREATED: Plus,
    TASK_UPDATED: ActivityIcon,
    TASK_MOVED: Move,
    TASK_DELETED: Trash2,
    TASK_ASSIGNED: UserPlus,
    TASK_UNASSIGNED: UserMinus,
    MEMBER_ADDED: UserPlus,
    MEMBER_REMOVED: UserMinus,
};

const ACTION_COLORS: Record<string, string> = {
    BOARD_CREATED: 'bg-indigo-500/10 text-indigo-500',
    TASK_CREATED: 'bg-emerald-500/10 text-emerald-500',
    TASK_DELETED: 'bg-rose-500/10 text-rose-500',
    TASK_MOVED: 'bg-amber-500/10 text-amber-500',
    MEMBER_ADDED: 'bg-violet-500/10 text-violet-500',
    MEMBER_REMOVED: 'bg-rose-500/10 text-rose-500',
    LIST_UPDATED: 'bg-blue-500/10 text-blue-500',
    LIST_DELETED: 'bg-rose-500/10 text-rose-500',
};

export default function ActivityHistory({ boardId, isOpen, onClose }: Props) {
    const { activities, activityPagination, isActivitiesLoading, error, fetchActivities } = useBoardStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            fetchActivities(boardId);
        }
    }, [isOpen, boardId, fetchActivities]);

    const handleScroll = () => {
        if (!scrollRef.current || isActivitiesLoading || !activityPagination) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        if (scrollHeight - scrollTop <= clientHeight * 1.5) {
            if (activityPagination.page < activityPagination.totalPages) {
                fetchActivities(boardId, activityPagination.page + 1);
            }
        }
    };

    const renderActivityDescription = (activity: any) => {
        const { action, metadata, user } = activity;
        const userName = <span className="font-bold text-foreground">{user.name}</span>;

        switch (action) {
            case 'BOARD_CREATED':
                return <>{userName} created this board</>;
            case 'BOARD_UPDATED':
                return <>{userName} updated board settings</>;
            case 'LIST_CREATED':
                return <>{userName} created list <span className="font-bold">"{metadata?.title || 'Unknown'}"</span></>;
            case 'TASK_CREATED':
                return <>{userName} added task <span className="font-bold">"{metadata?.title || 'Unknown'}"</span> to <span className="font-bold">"{metadata?.listTitle || 'Unknown'}"</span></>;
            case 'TASK_MOVED':
                return (
                    <>{userName} moved <span className="font-bold">"{metadata?.title || 'Unknown'}"</span> from <span className="font-bold">"{metadata?.fromList || 'Unknown'}"</span> to <span className="font-bold">"{metadata?.toList || 'Unknown'}"</span></>
                );
            case 'TASK_UPDATED':
                return <>{userName} updated task <span className="font-bold">"{metadata?.title || 'Unknown'}"</span></>;
            case 'TASK_DELETED':
                return <>{userName} deleted task <span className="font-bold">"{metadata?.title || 'Unknown'}"</span></>;
            case 'TASK_ASSIGNED':
                return <>{userName} assigned <span className="font-bold">{metadata?.assignedUserName || 'someone'}</span> to <span className="font-bold">"{metadata?.title || 'a task'}"</span></>;
            case 'TASK_UNASSIGNED':
                return <>{userName} removed <span className="font-bold">{metadata?.unassignedUserName || 'someone'}</span> from <span className="font-bold">"{metadata?.title || 'a task'}"</span></>;
            case 'LIST_UPDATED':
                return <>{userName} renamed list to <span className="font-bold">"{metadata?.title || 'Unknown'}"</span></>;
            case 'LIST_DELETED':
                return <>{userName} deleted list <span className="font-bold">"{metadata?.title || 'Unknown'}"</span></>;
            case 'MEMBER_ADDED':
                return <>{userName} added <span className="font-bold">{metadata?.memberName || 'someone'}</span> to the board</>;
            case 'MEMBER_REMOVED':
                return <>{userName} removed <span className="font-bold">{metadata?.memberName || 'someone'}</span> from the board</>;
            default:
                return <>{userName} performed an action: {action}</>;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60]"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-sm bg-card border-l-4 border-foreground shadow-[-12px_0px_0px_0px_rgba(0,0,0,1)] dark:shadow-[-12px_0px_0px_0px_rgba(var(--accent-rgb),0.2)] z-[70] flex flex-col"
                    >
                        {/* Noise Texture */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-soft-light" />
                        <div className="relative z-10 flex items-center justify-between p-6 border-b-4 border-foreground bg-accent-color/5">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-widest text-foreground flex items-center gap-3">
                                    <div className="w-8 h-8 bg-accent-color rounded-lg border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                                        <Clock className="w-4 h-4 text-white" />
                                    </div>
                                    Activity
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 rounded-xl transition-all border-2 border-transparent hover:border-rose-500"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div
                            ref={scrollRef}
                            onScroll={handleScroll}
                            className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar"
                        >
                            {activities.length === 0 && !isActivitiesLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                                    <ActivityIcon className="w-12 h-12 mb-4" />
                                    <p className="font-black uppercase tracking-widest text-xs">No activity yet</p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center opacity-80">
                                    <ActivityIcon className="w-12 h-12 mb-4 text-rose-500" />
                                    <p className="font-bold text-rose-500 mb-2">Failed to load activity</p>
                                    <p className="text-xs text-muted-foreground mb-4">{error}</p>
                                    <button
                                        onClick={() => fetchActivities(boardId)}
                                        className="px-4 py-2 bg-foreground text-background rounded-lg text-xs font-black uppercase tracking-widest hover:bg-accent-color hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            ) : (
                                <div className="relative z-10 space-y-4">
                                    {activities.map((activity, idx) => {
                                        const Icon = ACTION_ICONS[activity.action] || ActivityIcon;
                                        const colorClass = ACTION_COLORS[activity.action] || 'bg-muted/20 text-muted-foreground';

                                        return (
                                            <div
                                                key={activity.id}
                                                className="group relative p-4 bg-background border-2 border-foreground/10 hover:border-foreground rounded-2xl transition-all hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex gap-4"
                                            >
                                                <div className={`relative z-10 w-10 h-10 rounded-xl border-2 border-foreground/10 group-hover:border-foreground/20 flex items-center justify-center shadow-sm group-hover:scale-110 transition-all ${colorClass.replace('text-', 'bg-opacity-10 text-')}`}>
                                                    <Icon className="w-5 h-5" />
                                                </div>

                                                <div className="flex-1 pt-1">
                                                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                                                        {renderActivityDescription(activity)}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-3 opacity-60">
                                                        <div className="w-5 h-5 rounded-lg border border-foreground/20 overflow-hidden bg-muted">
                                                            {activity.user.avatar ? (
                                                                <img src={activity.user.avatar} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-[8px] font-black uppercase">
                                                                    {activity.user.name.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50">
                                                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {isActivitiesLoading && (
                                <div className="py-4 flex justify-center">
                                    <LoadingSpinner />
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
