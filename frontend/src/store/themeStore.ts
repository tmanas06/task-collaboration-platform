import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AccentColor = 'indigo' | 'emerald' | 'rose' | 'amber' | 'cyan' | 'violet';

interface ThemeState {
    mode: 'light' | 'dark';
    accentColor: AccentColor;
    toggleMode: () => void;
    setAccentColor: (color: AccentColor) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            mode: 'dark',
            accentColor: 'indigo',
            toggleMode: () => set((state) => ({ mode: state.mode === 'light' ? 'dark' : 'light' })),
            setAccentColor: (color: AccentColor) => set({ accentColor: color }),
        }),
        {
            name: 'taskflow-theme',
        }
    )
);
