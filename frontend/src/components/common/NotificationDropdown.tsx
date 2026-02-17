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
                className="p-2.5 bg-white/5 border border-white/10 rounded-2xl text-zinc-400 hover:text-accent-color hover:bg-white/10 transition-all relative group"
            >
                <Bell className="w-4.5 h-4.5 group-hover:rotate-12 transition-transform" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-zinc-950">
                        {unreadCount}
                    </span>
                )}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-80 bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl p-4 z-50 overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-widest">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-[10px] text-zinc-500 hover:text-accent-color font-bold uppercase transition-colors"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto space-y-2 custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="py-12 flex flex-col items-center justify-center text-zinc-600 gap-3">
                                    <Inbox className="w-8 h-8 opacity-20" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest italic">All caught up!</p>
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        className={`group relative p-3 rounded-2xl border transition-all cursor-pointer ${n.read
                                                ? 'bg-transparent border-transparent hover:bg-white/5'
                                                : 'bg-accent-color/5 border-accent-color/20 hover:bg-accent-color/10'
                                            }`}
                                        onClick={() => handleNotificationClick(n)}
                                    >
                                        <div className="flex flex-col gap-1 pr-8">
                                            <p className={`text-[11px] font-bold ${n.read ? 'text-zinc-300' : 'text-zinc-100'}`}>
                                                {n.title}
                                            </p>
                                            <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
                                                {n.message}
                                            </p>
                                            <p className="text-[9px] text-zinc-600 font-bold uppercase mt-1">
                                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>

                                        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(n.id);
                                                }}
                                                className="p-1.5 hover:bg-rose-500/10 hover:text-rose-500 rounded-lg text-zinc-600 transition-all"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        {!n.read && (
                                            <div className="absolute top-3 right-10">
                                                <div className="w-1.5 h-1.5 bg-accent-color rounded-full animate-pulse shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.5)]" />
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
