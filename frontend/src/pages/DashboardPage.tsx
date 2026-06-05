import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import ProgressChart from '@/components/ProgressChart';
import { formatTimeAgo } from '@/utils/formatters';
import { ROUTES } from '@/utils/constants';

const quickStats = [
  {
    label: 'Interviews Done',
    value: '12',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: 'from-primary-500 to-blue-500',
  },
  {
    label: 'Average Score',
    value: '76%',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    color: 'from-secondary-500 to-emerald-500',
  },
  {
    label: 'Strengths',
    value: 'Coding',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: 'from-accent-500 to-orange-500',
  },
  {
    label: 'Study Streak',
    value: '5 days',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
      </svg>
    ),
    color: 'from-pink-500 to-rose-500',
  },
];

const recentInterviews = [
  { id: '1', type: 'Technical', score: 82, date: '2024-01-15', duration: '25 min' },
  { id: '2', type: 'Behavioral', score: 68, date: '2024-01-14', duration: '18 min' },
  { id: '3', type: 'System Design', score: 74, date: '2024-01-12', duration: '32 min' },
  { id: '4', type: 'Coding', score: 91, date: '2024-01-10', duration: '45 min' },
];

const chartData = [
  { date: 'Jan 1', score: 65 },
  { date: 'Jan 5', score: 72 },
  { date: 'Jan 8', score: 68 },
  { date: 'Jan 12', score: 78 },
  { date: 'Jan 15', score: 82 },
  { date: 'Jan 19', score: 76 },
  { date: 'Jan 22', score: 85 },
];

const DashboardPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Welcome back, {user?.name || 'User'}!
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Here's your interview preparation overview
          </p>
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <Link to={ROUTES.NEW_INTERVIEW} className="btn-primary text-sm">
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Interview
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {quickStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-4"
          >
            <div className={`mb-3 inline-flex rounded-xl bg-gradient-to-br ${stat.color} p-2.5 text-white`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProgressChart data={chartData} />
        </div>
        <div className="space-y-4">
          <div className="glass-card p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link to={ROUTES.NEW_INTERVIEW} className="flex items-center gap-3 rounded-xl bg-primary-50 p-3 text-sm font-medium text-primary-700 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-300 dark:hover:bg-primary-900/30 transition-colors">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white">🎯</span>
                Start New Interview
              </Link>
              <Link to={ROUTES.ANALYTICS} className="flex items-center gap-3 rounded-xl bg-secondary-50 p-3 text-sm font-medium text-secondary-700 hover:bg-secondary-100 dark:bg-secondary-900/20 dark:text-secondary-300 dark:hover:bg-secondary-900/30 transition-colors">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-500 text-white">📊</span>
                View Analytics
              </Link>
              <Link to={ROUTES.STUDY_PLAN} className="flex items-center gap-3 rounded-xl bg-accent-50 p-3 text-sm font-medium text-accent-700 hover:bg-accent-100 dark:bg-accent-900/20 dark:text-accent-300 dark:hover:bg-accent-900/30 transition-colors">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500 text-white">📚</span>
                Study Plan
              </Link>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
              Tip of the Day
            </h3>
            <div className="rounded-xl bg-gradient-to-br from-primary-50 to-secondary-50 p-4 dark:from-primary-900/20 dark:to-secondary-900/20">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Practice the STAR method (Situation, Task, Action, Result) for behavioral questions. It helps structure your answers effectively.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Recent Interviews
          </h3>
          <Link to={ROUTES.HISTORY} className="text-xs font-medium text-primary-500 hover:text-primary-600">
            View All
          </Link>
        </div>
        <div className="space-y-3">
          {recentInterviews.map((interview, i) => (
            <motion.div
              key={interview.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between rounded-xl border border-slate-100 p-4 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{interview.type}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{formatTimeAgo(interview.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-500">{interview.duration}</span>
                <span className={`text-sm font-bold ${interview.score >= 70 ? 'text-green-500' : interview.score >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {interview.score}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
