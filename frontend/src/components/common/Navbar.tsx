import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSocketStore } from '../../store/socketStore';
import { LogOut, Layout, User as UserIcon, Activity, ChevronDown, Bell, Settings as SettingsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { isConnected } = useSocketStore();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/40 backdrop-blur-xl"
        >
            <div className="max-w-[1800px] mx-auto px-6">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="relative w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.3)] group-hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all duration-300 group-hover:rotate-3">
                            <Layout className="w-5 h-5 text-white" />
                            <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-xl font-bold tracking-tight gradient-text">
                            TaskFlow
                        </span>
                    </Link>

                    {/* Right side */}
                    <div className="flex items-center gap-6">
                        {/* Status Indicator */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                            <motion.div
                                animate={{
                                    scale: isConnected ? [1, 1.2, 1] : 1,
                                    opacity: isConnected ? [1, 0.7, 1] : 1
                                }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-rose-400'}`}
                            />
                            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                                {isConnected ? 'Synchronized' : 'Disconnected'}
                            </span>
                        </div>

                        {/* User Profile */}
                        <div className="flex items-center gap-4 pl-4 border-l border-white/10 relative" ref={userMenuRef}>
                            <div
                                className="flex items-center gap-2 group cursor-pointer"
                                onClick={() => setShowUserMenu(!showUserMenu)}
                            >
                                <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center text-xs font-bold text-white group-hover:border-indigo-500/50 transition-colors">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden sm:flex flex-col">
                                    <span className="text-xs font-semibold text-zinc-100 leading-tight">{user?.name}</span>
                                    <span className="text-[10px] text-zinc-500 leading-tight">Pro Account</span>
                                </div>
                                <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                            </div>

                            <AnimatePresence>
                                {showUserMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 top-full mt-2 w-48 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl p-2 z-50 overflow-hidden"
                                    >
                                        <div className="px-3 py-2 border-b border-white/5 mb-1">
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Account</p>
                                        </div>
                                        <button className="w-full flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all text-xs font-medium group">
                                            <UserIcon className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                                            Profile Settings
                                        </button>
                                        <button className="w-full flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all text-xs font-medium group">
                                            <Bell className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                                            Notifications
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all text-xs font-bold mt-1 group"
                                        >
                                            <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                            Sign Out
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Actions */}
                            <div className="flex items-center gap-1 border-l border-white/10 ml-2 pl-2">
                                <button
                                    onClick={() => navigate('/')}
                                    className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                    title="Activity"
                                >
                                    <Activity className="w-4 h-4" />
                                </button>
                                <button
                                    className="p-2 text-zinc-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-all"
                                    title="System Settings"
                                >
                                    <SettingsIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}
