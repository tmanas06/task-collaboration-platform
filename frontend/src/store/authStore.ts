import { create } from 'zustand';
import { auth } from '../config/firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser,
    updateProfile
} from 'firebase/auth';
import { authApi } from '../services/api';
import type { User } from '../types';

interface AuthState {
    user: User | null;
    firebaseUser: FirebaseUser | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;

    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    initialize: () => () => void; // Returns unsubscribe
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    firebaseUser: null,
    token: null,
    isLoading: true,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();
            const backendUser = await authApi.syncUser({
                email: userCredential.user.email!,
                name: userCredential.user.displayName || undefined
            });
            set({ user: backendUser, firebaseUser: userCredential.user, token, isLoading: false });
        } catch (error: any) {
            // Firebase error codes map to messages could be better, but pass message for now
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    signup: async (email, password, name) => {
        set({ isLoading: true, error: null });
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });
            const token = await userCredential.user.getIdToken();
            const backendUser = await authApi.syncUser({ email, name });
            set({ user: backendUser, firebaseUser: userCredential.user, token, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    logout: async () => {
        try {
            await signOut(auth);
            set({ user: null, firebaseUser: null, token: null });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    initialize: () => {
        set({ isLoading: true });
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    const token = await currentUser.getIdToken();
                    const backendUser = await authApi.syncUser({
                        email: currentUser.email!,
                        name: currentUser.displayName || undefined,
                        photoURL: currentUser.photoURL || undefined
                    });
                    set({ user: backendUser, firebaseUser: currentUser, token, isLoading: false });
                } catch (err) {
                    console.error("Failed to sync user", err);
                    set({ user: null, firebaseUser: currentUser, token: null, isLoading: false, error: "Failed to sync user data" });
                }
            } else {
                set({ user: null, firebaseUser: null, token: null, isLoading: false });
            }
        });
        return unsubscribe;
    },

    clearError: () => set({ error: null }),
}));
