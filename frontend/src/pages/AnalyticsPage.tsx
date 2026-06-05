import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ProgressChart from '@/components/ProgressChart';
import CategoryRadar from '@/components/CategoryRadar';

const progressData = [
  { date: 'Week 1', score: 55 },
  { date: 'Week 2', score: 62 },
  { date: 'Week 3', score: 58 },
  { date: 'Week 4', score: 71 },
  { date: 'Week 5', score: 68 },
  { date: 'Week 6', score: 75 },
  { date: 'Week 7', score: 82 },
  { date: 'Week 8', score: 78 },
];

const radarData = [
  { category: 'Coding', score: 85, fullMark: 100 },
  { category: 'DevOps', score: 62, fullMark: 100 },
  { category: 'Cloud', score: 45, fullMark: 100 },
  { category: 'System\nDesign', score: 70, fullMark: 100 },
  { category: 'Behavioral', score: 78, fullMark: 100 },
  { category: 'Database', score: 55, fullMark: 100 },
];

const statCards = [
  { label: 'Total Interviews', value: '24', change: '+4 this week', trend: 'up' },
  { label: 'Average Score', value: '72%', change: '+5% vs last month', trend: 'up' },
  { label: 'Highest Score', value: '94%', change: 'Coding Interview', trend: 'up' },
  { label: 'Study Streak', value: '12 days', change: 'Personal best!', trend: 'up' },
];

const AnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState('1M');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Analytics
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track your performance and identify areas for improvement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input-field py-2 text-sm w-auto"
            aria-label="Select date range"
          >
            <option value="1W">1 Week</option>
            <option value="1M">1 Month</option>
            <option value="3M">3 Months</option>
            <option value="6M">6 Months</option>
            <option value="1Y">1 Year</option>
          </select>
          <button className="btn-secondary text-sm">
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-4"
          >
            <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            <p className="mt-1 text-xs text-green-500">{stat.change}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProgressChart data={progressData} />
        <CategoryRadar data={radarData} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-green-600 dark:text-green-400">
            Strengths
          </h3>
          <div className="space-y-3">
            {['Strong problem-solving and algorithmic thinking', 'Excellent communication and clarity', 'Good system design fundamentals', 'Solid understanding of data structures'].map((s, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300">
                <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {s}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-red-600 dark:text-red-400">
            Areas to Improve
          </h3>
          <div className="space-y-3">
            {['Cloud services experience (AWS/GCP)', 'DevOps tooling and CI/CD', 'Database optimization techniques', 'Advanced system design patterns'].map((w, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
                <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {w}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
          Interview Performance Summary
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="pb-3 text-left font-medium text-slate-500 dark:text-slate-400">Date</th>
                <th className="pb-3 text-left font-medium text-slate-500 dark:text-slate-400">Type</th>
                <th className="pb-3 text-left font-medium text-slate-500 dark:text-slate-400">Difficulty</th>
                <th className="pb-3 text-right font-medium text-slate-500 dark:text-slate-400">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {[
                { date: 'Jan 22', type: 'Technical', difficulty: 'Advanced', score: 85 },
                { date: 'Jan 19', type: 'Behavioral', difficulty: 'Intermediate', score: 72 },
                { date: 'Jan 15', type: 'Coding', difficulty: 'Expert', score: 68 },
                { date: 'Jan 12', type: 'System Design', difficulty: 'Advanced', score: 78 },
                { date: 'Jan 8', type: 'Mixed', difficulty: 'Intermediate', score: 82 },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="py-3 text-slate-600 dark:text-slate-400">{row.date}</td>
                  <td className="py-3 font-medium text-slate-900 dark:text-white">{row.type}</td>
                  <td className="py-3 text-slate-600 dark:text-slate-400">{row.difficulty}</td>
                  <td className={`py-3 text-right font-bold ${row.score >= 70 ? 'text-green-500' : row.score >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {row.score}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
