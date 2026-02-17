import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, ExternalLink, Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationsApi } from '../../services/api';
import { Notification } from '../../types';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const unreadCount = notifications.filter(n => !n.read).length;

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationsApi.getAll();
            // Since API returns Activity[] currently in api.ts, I need to cast or fix api.ts
            // Actually api.ts has getAll: () => api.get<ApiResponse<Activity[]>>('/notifications')
            // That's a mistake, it should be Notification[]
            setNotifications(data as unknown as Notification[]);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationsApi.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationsApi.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await notificationsApi.delete(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read) {
            handleMarkAsRead(notification.id);
        }
        if (notification.link) {
            navigate(notification.link);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="p-3 bg-muted/10 border border-border rounded-2xl text-muted-foreground hover:text-accent-color hover:bg-muted/20 transition-all relative group shadow-inner"
            >
                <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-background animate-pulse" />
                )}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-4 w-96 bg-card border-4 border-foreground rounded-[2.5rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(var(--accent-rgb),0.2)] z-50 overflow-hidden"
                    >
                        {/* Noise Texture */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-soft-light" />

                        <div className="relative z-10 flex items-center justify-between p-6 pb-4 border-b-4 border-foreground/10">
                            <h3 className="text-sm font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                <div className="w-2 h-6 bg-accent-color rounded-full" />
                                Inbox
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-[10px] bg-foreground text-background px-3 py-1.5 rounded-lg hover:bg-accent-color hover:text-white font-black uppercase tracking-wider transition-all"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div className="relative z-10 max-h-[400px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="py-12 flex flex-col items-center justify-center text-muted-foreground gap-4 opacity-50">
                                    <Inbox className="w-12 h-12 stroke-[1.5]" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">All caught up!</p>
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        className={`group relative p-4 rounded-2xl border-2 transition-all cursor-pointer ${n.read
                                            ? 'bg-transparent border-foreground/5 hover:border-foreground/20 hover:bg-foreground/5'
                                            : 'bg-background border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]'
                                            }`}
                                        onClick={() => handleNotificationClick(n)}
                                    >
                                        <div className="flex flex-col gap-2 pr-8">
                                            <p className={`text-xs font-bold leading-tight ${n.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                                                {n.title}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                                                {n.message}
                                            </p>
                                            <p className="text-[9px] text-muted-foreground/60 font-black uppercase tracking-widest mt-1">
                                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>

                                        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(n.id);
                                                }}
                                                className="p-1.5 hover:bg-rose-500/10 hover:text-rose-500 rounded-lg text-muted-foreground transition-all"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        {!n.read && (
                                            <div className="absolute top-4 right-4 animate-pulse">
                                                <div className="w-2 h-2 bg-accent-color rounded-full" />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
