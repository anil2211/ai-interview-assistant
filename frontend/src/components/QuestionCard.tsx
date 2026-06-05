import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCategory } from '@/utils/formatters';
import { CATEGORY_COLORS, DIFFICULTY_LEVELS } from '@/utils/constants';
import type { Question } from '@/types';

interface QuestionCardProps {
  question: Question;
  questionNumber?: number;
  totalQuestions?: number;
  showHints?: boolean;
  onBookmark?: (id: string) => void;
  onShare?: (id: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  showHints = false,
  onBookmark,
  onShare,
}) => {
  const [hintsOpen, setHintsOpen] = useState(showHints);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const difficulty = DIFFICULTY_LEVELS.find(
    (d) => d.value === question.difficulty
  );
  const categoryColor = CATEGORY_COLORS[question.category] || '#6366f1';

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-6">
        {questionNumber && totalQuestions && (
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Question {questionNumber} of {totalQuestions}
            </span>
            <div className="flex items-center gap-2">
              <div className="flex h-1.5 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="rounded-full bg-primary-500 transition-all"
                  style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span
            className="badge text-xs"
            style={{
              backgroundColor: `${categoryColor}20`,
              color: categoryColor,
            }}
          >
            {formatCategory(question.category)}
          </span>
          {difficulty && (
            <span
              className="badge text-xs"
              style={{
                backgroundColor: `${difficulty.color}20`,
                color: difficulty.color,
              }}
            >
              {difficulty.label}
            </span>
          )}
          {question.tags?.map((tag) => (
            <span
              key={tag}
              className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-xs"
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="text-base leading-relaxed text-slate-900 dark:text-white font-medium">
          {question.text}
        </p>

        {question.timeLimit > 0 && (
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{Math.floor(question.timeLimit / 60)}:{(question.timeLimit % 60).toString().padStart(2, '0')} min</span>
          </div>
        )}

        {question.hints && question.hints.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setHintsOpen(!hintsOpen)}
              className="flex items-center gap-1.5 text-xs font-medium text-primary-500 hover:text-primary-600"
              aria-expanded={hintsOpen}
              aria-label="Toggle hints"
            >
              <svg className={`h-4 w-4 transition-transform ${hintsOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {hintsOpen ? 'Hide Hints' : `Show Hints (${question.hints.length})`}
            </button>
            <AnimatePresence>
              {hintsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-3 space-y-2 overflow-hidden"
                >
                  {question.hints.map((hint, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                    >
                      <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span className="text-xs">{hint}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-slate-200 px-6 py-3 dark:border-slate-700">
        <button
          onClick={() => {
            setIsBookmarked(!isBookmarked);
            onBookmark?.(question.id);
          }}
          className={`btn-ghost p-1.5 text-xs ${
            isBookmarked ? 'text-primary-500' : ''
          }`}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark question'}
        >
          <svg
            className="h-4 w-4"
            fill={isBookmarked ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
        <button
          onClick={() => onShare?.(question.id)}
          className="btn-ghost p-1.5 text-xs"
          aria-label="Share question"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default QuestionCard;
