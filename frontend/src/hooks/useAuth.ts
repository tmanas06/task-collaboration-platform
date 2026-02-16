import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
    const { user, token, isLoading, error, login, signup, logout, initialize, clearError } =
        useAuthStore();

    return {
        user,
        token,
        isLoading,
        error,
        isAuthenticated: !!token && !!user,
        login,
        signup,
        logout,
        checkAuth: () => Promise.resolve(), // Deprecated, kept for interface compatibility if needed, else remove
        initialize,
        clearError,
    };
};
