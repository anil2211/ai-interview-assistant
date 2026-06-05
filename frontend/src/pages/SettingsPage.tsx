import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';

type SettingsTab = 'profile' | 'preferences' | 'account' | 'api-keys';

const SettingsPage: React.FC = () => {
  const { mode, toggle } = useTheme();
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    interviewReminders: true,
    weeklyReport: true,
    tipsAndTricks: false,
  });

  const tabs: { id: SettingsTab; label: string; icon: JSX.Element }[] = [
    {
      id: 'profile',
      label: 'Profile',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: 'preferences',
      label: 'Preferences',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: 'account',
      label: 'Account',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      id: 'api-keys',
      label: 'API Keys',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Settings
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 dark:border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            aria-pressed={activeTab === tab.id}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-6 space-y-6"
          >
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 text-2xl font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <button className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg" aria-label="Change avatar">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{user?.name || 'User'}</h3>
                <p className="text-sm text-slate-500">{user?.email || 'user@example.com'}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                <input type="text" className="input-field" defaultValue={user?.name || ''} placeholder="Your name" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                <input type="email" className="input-field" defaultValue={user?.email || ''} placeholder="your@email.com" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Bio</label>
                <textarea className="input-field min-h-[100px] resize-none" placeholder="Tell us about yourself..." defaultValue={user?.bio || ''} />
              </div>
            </div>

            <button className="btn-primary">Save Changes</button>
          </motion.div>
        )}

        {activeTab === 'preferences' && (
          <motion.div
            key="preferences"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-6 space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Theme</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Choose between light and dark mode</p>
              </div>
              <button
                onClick={toggle}
                className={`relative h-7 w-12 rounded-full transition-colors ${mode === 'dark' ? 'bg-primary-500' : 'bg-slate-300'}`}
                aria-label="Toggle theme"
              >
                <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${mode === 'dark' ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h3>
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-sm text-slate-700 dark:text-slate-300 capitalize" htmlFor={key}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <input
                    id={key}
                    type="checkbox"
                    checked={value}
                    onChange={() => setNotifications((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                    className="h-5 w-5 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                  />
                </div>
              ))}
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Language</h3>
              <select className="input-field w-full md:w-48" defaultValue="en">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="hi">Hindi</option>
              </select>
            </div>

            <button className="btn-primary">Save Preferences</button>
          </motion.div>
        )}

        {activeTab === 'account' && (
          <motion.div
            key="account"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-6 space-y-6"
          >
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Change Password</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Current Password</label>
                  <input type="password" className="input-field" placeholder="Enter current password" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                  <input type="password" className="input-field" placeholder="Enter new password" />
                </div>
              </div>
              <button className="btn-primary">Update Password</button>
            </div>

            <div className="border-t border-slate-200 pt-6 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">Danger Zone</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button className="mt-3 rounded-xl border border-red-300 px-6 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors">
                Delete Account
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'api-keys' && (
          <motion.div
            key="api-keys"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-6 space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">API Keys</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Manage your API keys for external integrations</p>
              </div>
              <button className="btn-primary text-sm">
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Key
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
              <svg className="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <p className="text-sm text-slate-500 dark:text-slate-400">No API keys created yet</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsPage;
