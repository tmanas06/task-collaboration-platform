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
};

export default function ActivityHistory({ boardId, isOpen, onClose }: Props) {
    const { activities, activityPagination, isLoading, fetchActivities } = useBoardStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            fetchActivities(boardId);
        }
    }, [isOpen, boardId, fetchActivities]);

    const handleScroll = () => {
        if (!scrollRef.current || isLoading || !activityPagination) return;
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
                return <>{userName} created list <span className="font-bold">"{metadata.title}"</span></>;
            case 'TASK_CREATED':
                return <>{userName} added task <span className="font-bold">"{metadata.title}"</span> to <span className="font-bold">"{metadata.listTitle}"</span></>;
            case 'TASK_MOVED':
                return (
                    <>{userName} moved <span className="font-bold">"{metadata.title}"</span> from <span className="font-bold">"{metadata.fromList}"</span> to <span className="font-bold">"{metadata.toList}"</span></>
                );
            case 'TASK_UPDATED':
                return <>{userName} updated task <span className="font-bold">"{metadata.title}"</span></>;
            case 'TASK_UNASSIGNED':
                return <>{userName} removed an assignee from <span className="font-bold">"{metadata.title}"</span></>;
            case 'LIST_UPDATED':
                return <>{userName} renamed list to <span className="font-bold">"{metadata.title}"</span></>;
            case 'LIST_DELETED':
                return <>{userName} deleted list <span className="font-bold">"{metadata.title}"</span></>;
            case 'MEMBER_REMOVED':
                return <>{userName} removed <span className="font-bold">{metadata.memberName}</span> from the board</>;
            default:
                return <>{userName} performed an action</>;
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
                        className="fixed top-0 right-0 h-full w-full max-w-sm bg-card border-l border-border shadow-2xl z-[70] flex flex-col"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/5">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-accent-color" />
                                    Activity
                                </h2>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                    Full historical feed
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-muted/20 rounded-xl text-muted-foreground hover:text-foreground transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div
                            ref={scrollRef}
                            onScroll={handleScroll}
                            className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar"
                        >
                            {activities.length === 0 && !isLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                                    <ActivityIcon className="w-12 h-12 mb-4" />
                                    <p className="font-bold uppercase tracking-widest text-xs">No activity yet</p>
                                </div>
                            ) : (
                                <div className="relative">
                                    {/* Vertical Line */}
                                    <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />

                                    <div className="space-y-8 relative">
                                        {activities.map((activity, idx) => {
                                            const Icon = ACTION_ICONS[activity.action] || ActivityIcon;
                                            const colorClass = ACTION_COLORS[activity.action] || 'bg-muted/20 text-muted-foreground';

                                            return (
                                                <div key={activity.id} className="flex gap-4 group">
                                                    <div className={`relative z-10 w-8 h-8 rounded-full ${colorClass} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>

                                                    <div className="flex-1 pt-1">
                                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                                            {renderActivityDescription(activity)}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-2 opacity-60">
                                                            <div className="w-4 h-4 rounded-full overflow-hidden bg-muted">
                                                                {activity.user.avatar ? (
                                                                    <img src={activity.user.avatar} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-[6px] font-black uppercase">
                                                                        {activity.user.name.charAt(0)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] font-bold uppercase tracking-widest">
                                                                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {isLoading && (
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
