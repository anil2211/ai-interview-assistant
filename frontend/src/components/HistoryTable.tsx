import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate, formatDuration } from '@/utils/formatters';
import { INTERVIEW_TYPES, DIFFICULTY_LEVELS } from '@/utils/constants';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { Interview } from '@/types';

interface HistoryTableProps {
  interviews: Interview[];
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onView: (id: string) => void;
  onExport: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

const HistoryTable: React.FC<HistoryTableProps> = ({
  interviews,
  total,
  page,
  totalPages,
  onPageChange,
  onView,
  onExport,
  onDelete,
  isLoading = false,
}) => {
  const isMobile = useMediaQuery('(max-width: 767px)');

  const getTypeInfo = (type: string) => {
    return INTERVIEW_TYPES.find((t) => t.value === type) || INTERVIEW_TYPES[0];
  };

  const getDifficultyInfo = (difficulty: string) => {
    return DIFFICULTY_LEVELS.find((d) => d.value === difficulty);
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-slate-400';
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-shimmer h-16 rounded-xl bg-slate-200 dark:bg-slate-700" />
        ))}
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-3">
        <AnimatePresence>
          {interviews.map((interview) => {
            const typeInfo = getTypeInfo(interview.type);
            const diffInfo = getDifficultyInfo(interview.difficulty);
            return (
              <motion.div
                key={interview.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{typeInfo?.icon}</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {typeInfo?.label}
                    </span>
                  </div>
                  <span className={`text-lg font-bold ${getScoreColor(interview.score)}`}>
                    {interview.score ? `${Math.round(interview.score)}%` : '-'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {diffInfo && (
                    <span className="badge text-xs" style={{ backgroundColor: `${diffInfo.color}20`, color: diffInfo.color }}>
                      {diffInfo.label}
                    </span>
                  )}
                  <span className="text-xs text-slate-500">{formatDate(interview.createdAt)}</span>
                  {interview.duration > 0 && (
                    <span className="text-xs text-slate-500">{formatDuration(interview.duration)}</span>
                  )}
                </div>
                <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                  <button onClick={() => onView(interview.id)} className="btn-ghost flex-1 text-xs">View</button>
                  <button onClick={() => onExport(interview.id)} className="btn-ghost flex-1 text-xs">Export</button>
                  <button onClick={() => onDelete(interview.id)} className="btn-ghost flex-1 text-xs text-red-500">Delete</button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {renderPagination()}
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400">Difficulty</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400">Duration</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400">Score</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            <AnimatePresence>
              {interviews.map((interview) => {
                const typeInfo = getTypeInfo(interview.type);
                const diffInfo = getDifficultyInfo(interview.difficulty);
                return (
                  <motion.tr
                    key={interview.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{typeInfo?.icon}</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {typeInfo?.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {diffInfo && (
                        <span className="badge text-xs" style={{ backgroundColor: `${diffInfo.color}20`, color: diffInfo.color }}>
                          {diffInfo.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {formatDate(interview.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {interview.duration > 0 ? formatDuration(interview.duration) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold ${getScoreColor(interview.score)}`}>
                        {interview.score ? `${Math.round(interview.score)}%` : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onView(interview.id)} className="btn-ghost p-1.5" aria-label="View interview">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button onClick={() => onExport(interview.id)} className="btn-ghost p-1.5" aria-label="Export interview">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                        <button onClick={() => onDelete(interview.id)} className="btn-ghost p-1.5 text-red-500" aria-label="Delete interview">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {renderPagination()}
    </div>
  );

  function renderPagination() {
    if (totalPages <= 1) return null;

    return (
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Page {page} of {totalPages} ({total} interviews)
        </p>
        <div className="flex gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="btn-ghost rounded-lg px-3 py-1.5 text-sm disabled:opacity-50"
            aria-label="Previous page"
          >
            Previous
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  page === pageNum
                    ? 'bg-primary-500 text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
                aria-label={`Go to page ${pageNum}`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="btn-ghost rounded-lg px-3 py-1.5 text-sm disabled:opacity-50"
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      </div>
    );
  }
};

export default HistoryTable;
