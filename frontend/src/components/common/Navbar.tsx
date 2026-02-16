import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSocketStore } from '../../store/socketStore';
import { LogOut, Layout, User as UserIcon, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { isConnected } = useSocketStore();
    const navigate = useNavigate();

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
                        <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                            <div className="flex items-center gap-2 group cursor-pointer">
                                <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center text-xs font-bold text-white group-hover:border-indigo-500/50 transition-colors">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden sm:flex flex-col">
                                    <span className="text-xs font-semibold text-zinc-100 leading-tight">{user?.name}</span>
                                    <span className="text-[10px] text-zinc-500 leading-tight">Pro Account</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                                <button className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                                    <Activity className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all"
                                    title="Logout"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}
