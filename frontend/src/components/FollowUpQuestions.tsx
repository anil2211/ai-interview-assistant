import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FollowUpQuestionsProps {
  questions: string[];
  onSelectQuestion: (question: string) => void;
  expanded?: boolean;
}

const FollowUpQuestions: React.FC<FollowUpQuestionsProps> = ({
  questions,
  onSelectQuestion,
  expanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!questions || questions.length === 0) return null;

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Follow-up Questions ({questions.length})
        </div>
        <svg
          className={`h-4 w-4 transition-transform text-slate-400 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="space-y-2 px-6 pb-4">
              {questions.map((question, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                  <button
                    onClick={() => setSelectedIndex(selectedIndex === i ? null : i)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    aria-expanded={selectedIndex === i}
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                        {i + 1}
                      </span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {question.length > 80 ? question.slice(0, 80) + '...' : question}
                      </span>
                    </div>
                    <svg
                      className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                        selectedIndex === i ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <AnimatePresence>
                    {selectedIndex === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-100 dark:border-slate-700"
                      >
                        <div className="px-4 py-3">
                          <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
                            {question}
                          </p>
                          <button
                            onClick={() => onSelectQuestion(question)}
                            className="btn-primary text-xs py-2 px-4"
                          >
                            Try This Question
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FollowUpQuestions;
