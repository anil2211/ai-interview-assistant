import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { capitalizeFirst } from '@/utils/formatters';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const location = useLocation();
  const { isDark, toggle } = useTheme();
  const user = useAuthStore((s) => s.user);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    const segments = path.split('/').filter(Boolean);
    return segments
      .map((s) => s.replace(/-/g, ' '))
      .map(capitalizeFirst)
      .join(' / ');
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/80">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Open menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
              {getPageTitle()}
            </h1>
            <nav className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
              <span className="text-primary-500 dark:text-primary-400">Home</span>
              <span className="mx-1">/</span>
              <span>{getPageTitle()}</span>
            </nav>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              className="input-field py-2 pl-10 pr-4 text-sm w-48 lg:w-64"
              aria-label="Search"
            />
          </div>

          <button
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Notifications"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
              3
            </span>
          </button>

          <button
            onClick={toggle}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-700">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 text-sm font-semibold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="hidden text-right lg:block">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Free Plan</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
