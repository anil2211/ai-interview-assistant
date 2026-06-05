import { create } from 'zustand';
import type { ThemeMode } from '@/types';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

function getInitialTheme(): ThemeMode {
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;

  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  localStorage.setItem('theme', mode);
}

const initial = getInitialTheme();
applyTheme(initial);

export const useThemeStore = create<ThemeState>((set) => ({
  mode: initial,

  setMode: (mode) => {
    applyTheme(mode);
    set({ mode });
  },

  toggle: () =>
    set((state) => {
      const newMode = state.mode === 'dark' ? 'light' : 'dark';
      applyTheme(newMode);
      return { mode: newMode };
    }),
}));
