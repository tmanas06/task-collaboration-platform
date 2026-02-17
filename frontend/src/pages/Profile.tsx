import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Save, ArrowLeft, Loader2, AlignLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usersApi } from '../services/api';
import Navbar from '../components/common/Navbar';
import type { User as UserType } from '../types';

export default function Profile() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserType | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                const data = await usersApi.getProfile();
                setProfile(data);
                setName(data.name);
                setDescription(data.description || '');
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError('Failed to load profile');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            setError(null);
            setSuccess(false);
            const updated = await usersApi.updateProfile({ name, description });
            setProfile(updated);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-accent-color" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="max-w-2xl mx-auto px-6 py-12">
                <motion.button
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors group font-bold uppercase tracking-widest text-xs"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back
                </motion.button>

                <div className="mb-12">
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-4xl font-extrabold tracking-tight gradient-text mb-2"
                    >
                        Profile Settings
                    </motion.h1>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground font-medium"
                    >
                        Keep your profile up to date.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-10 rounded-[2.5rem] relative overflow-hidden"
                >
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-color/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />

                    <form onSubmit={handleSubmit} className="space-y-10 relative">
                        {/* Avatar Section (Simplified) */}
                        <div className="flex flex-col items-center gap-6 pb-6 border-b border-border">
                            <div className="w-24 h-24 rounded-[2rem] bg-accent-color/10 border-4 border-accent-color/20 flex items-center justify-center text-3xl font-black text-accent-color shadow-xl">
                                {name.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-foreground">{name}</p>
                                <p className="text-xs text-muted-foreground">{profile?.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-8">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-3 block">
                                    Display Name
                                </label>
                                <div className="relative group">
                                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-accent-color transition-colors" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-16 pr-6 py-5 bg-zinc-900/50 border-2 border-white/5 rounded-2xl text-foreground focus:border-accent-color outline-none transition-all font-bold placeholder:text-zinc-700"
                                        placeholder="Your Name"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-3 block">
                                    About Me
                                </label>
                                <div className="relative group">
                                    <AlignLeft className="absolute left-6 top-6 w-5 h-5 text-zinc-500 group-focus-within:text-accent-color transition-colors" />
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full pl-16 pr-6 py-5 bg-zinc-900/50 border-2 border-white/5 rounded-2xl text-foreground focus:border-accent-color outline-none transition-all font-medium placeholder:text-zinc-700 min-h-[150px] resize-none"
                                        placeholder="Tell us a bit about yourself..."
                                    />
                                </div>
                                <p className="text-[10px] mt-3 text-zinc-600 font-medium italic">
                                    This will be visible to your team members.
                                </p>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-3 block">
                                    Email Address
                                </label>
                                <div className="relative group opacity-50 cursor-not-allowed">
                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                    <input
                                        type="email"
                                        value={profile?.email}
                                        className="w-full pl-16 pr-6 py-5 bg-zinc-900/50 border-2 border-white/5 rounded-2xl text-foreground font-bold cursor-not-allowed"
                                        disabled
                                    />
                                </div>
                                <p className="text-[10px] mt-3 text-zinc-600 font-medium italic">
                                    Email cannot be changed as it is linked to your authentication.
                                </p>
                            </div>
                        </div>

                        <AnimatePresence>
                            {(error || success) && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className={`p-5 rounded-2xl font-bold text-sm ${error ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                        }`}
                                >
                                    {error || 'Profile updated successfully!'}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="pt-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isSaving}
                                className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-accent-color text-white font-black uppercase tracking-widest rounded-2xl hover:opacity-90 disabled:opacity-50 transition-all shadow-xl shadow-accent-color/20"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}
                                {isSaving ? 'Saving...' : 'Update Profile'}
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </main>
        </div>
    );
}
