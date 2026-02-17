import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useThemeStore, AccentColor } from '../../store/themeStore';
import { LogOut, Layout, User as UserIcon, Activity, ChevronDown, Bell, Palette, Sun, Moon, Check, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationDropdown from './NotificationDropdown';

const ACCENT_COLORS: { name: AccentColor, color: string }[] = [
    { name: 'indigo', color: '#6366f1' },
    { name: 'emerald', color: '#10b981' },
    { name: 'rose', color: '#f43f5e' },
    { name: 'amber', color: '#f59e0b' },
    { name: 'cyan', color: '#06b6d4' },
    { name: 'violet', color: '#8b5cf6' },
];

export default function Navbar() {
    const { user, logout } = useAuth();
    const { mode, accentColor, toggleMode, setAccentColor } = useThemeStore();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showThemeMenu, setShowThemeMenu] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const themeMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
            if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
                setShowThemeMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        // Apply theme classes and colors
        const root = document.documentElement;
        if (mode === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        root.style.setProperty('--color-primary', `var(--accent-${accentColor})`);
    }, [mode, accentColor]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/40 backdrop-blur-xl"
        >
            <div className="max-w-[1800px] mx-auto px-6">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="relative w-9 h-9 bg-accent-color rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.3)] group-hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all duration-300 group-hover:rotate-3 shadow-accent-color/30">
                            <Layout className="w-5 h-5 text-white" />
                            <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-xl font-bold tracking-tight gradient-text">
                            TaskFlow
                        </span>
                    </Link>

                    {/* Right side */}
                    <div className="flex items-center gap-6">
                        {/* Status Indicator REMOVED per user request */}

                        {/* Theme Button */}
                        <div className="relative" ref={themeMenuRef}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowThemeMenu(!showThemeMenu)}
                                className="p-2.5 bg-white/5 border border-white/10 rounded-2xl text-zinc-400 hover:text-accent-color hover:bg-white/10 transition-all flex items-center gap-2 group"
                            >
                                <Palette className="w-4.5 h-4.5 group-hover:rotate-12 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Theme</span>
                            </motion.button>

                            <AnimatePresence>
                                {showThemeMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 top-full mt-2 w-64 bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl p-4 z-50"
                                    >
                                        <div className="mb-4">
                                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Color Mode</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => mode !== 'light' && toggleMode()}
                                                    className={`flex items-center justify-center gap-2 py-2 rounded-xl border transition-all truncate ${mode === 'light' ? 'bg-white text-black border-white font-bold' : 'bg-white/5 border-white/5 text-zinc-500 hover:text-white hover:bg-white/10'}`}
                                                >
                                                    <Sun className="w-3.5 h-3.5" />
                                                    <span className="text-[10px] uppercase">Light</span>
                                                </button>
                                                <button
                                                    onClick={() => mode !== 'dark' && toggleMode()}
                                                    className={`flex items-center justify-center gap-2 py-2 rounded-xl border transition-all truncate ${mode === 'dark' ? 'bg-indigo-600 border-indigo-500 text-white font-bold' : 'bg-white/5 border-white/5 text-zinc-500 hover:text-white hover:bg-white/10'}`}
                                                >
                                                    <Moon className="w-3.5 h-3.5" />
                                                    <span className="text-[10px] uppercase">Dark</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Accent Palette</p>
                                            <div className="grid grid-cols-3 gap-2">
                                                {ACCENT_COLORS.map((color) => (
                                                    <button
                                                        key={color.name}
                                                        onClick={() => setAccentColor(color.name)}
                                                        className={`h-10 rounded-xl relative flex items-center justify-center border-2 transition-all hover:scale-105 ${accentColor === color.name ? 'border-white' : 'border-transparent'}`}
                                                        style={{ backgroundColor: color.color }}
                                                        title={color.name}
                                                    >
                                                        {accentColor === color.name && <Check className="w-4 h-4 text-white" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Notifications */}
                        <NotificationDropdown />

                        {/* User Profile */}
                        <div className="flex items-center gap-4 pl-4 border-l border-white/10 relative" ref={userMenuRef}>
                            <div
                                className="flex items-center gap-2 group cursor-pointer"
                                onClick={() => setShowUserMenu(!showUserMenu)}
                            >
                                <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center text-xs font-bold text-white group-hover:border-accent-color/50 transition-colors">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden sm:flex flex-col">
                                    <span className="text-xs font-semibold text-zinc-100 leading-tight">{user?.name}</span>
                                    <span className="text-[10px] text-zinc-500 leading-tight"> </span>
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
                                        <Link
                                            to="/profile"
                                            className="w-full flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all text-xs font-medium group"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            <UserIcon className="w-4 h-4 text-zinc-600 group-hover:text-accent-color transition-colors" />
                                            Profile Settings
                                        </Link>
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
                                    title="Dashboard"
                                >
                                    <Activity className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}
