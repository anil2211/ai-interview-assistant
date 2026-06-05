import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';

export function useTheme() {
  const { mode, setMode, toggle } = useThemeStore();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem('theme');
      if (!stored) {
        setMode(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setMode]);

  const isDark = mode === 'dark';

  return {
    mode,
    isDark,
    setMode,
    toggle,
    setLight: () => setMode('light'),
    setDark: () => setMode('dark'),
  };
}
