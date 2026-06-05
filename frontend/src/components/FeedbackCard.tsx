import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScoreGauge from './ScoreGauge';
import type { QuestionFeedback } from '@/types';

interface FeedbackCardProps {
  feedback: QuestionFeedback;
  showModelAnswer?: boolean;
  onToggleModelAnswer?: () => void;
}

interface CategoryBarProps {
  label: string;
  score: number;
}

const CategoryBar: React.FC<CategoryBarProps> = ({ label, score }) => {
  const color = score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600 dark:text-slate-400">
          {label}
        </span>
        <span className="font-semibold text-slate-900 dark:text-white">
          {Math.round(score)}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

const FeedbackCard: React.FC<FeedbackCardProps> = ({
  feedback,
  showModelAnswer = false,
  onToggleModelAnswer,
}) => {
  const [showAltAnswers, setShowAltAnswers] = useState(false);

  return (
    <div className="glass-card overflow-hidden">
      <div className="border-b border-slate-200 p-6 dark:border-slate-700">
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <ScoreGauge score={feedback.score} size={120} />
          <div className="flex-1 space-y-3">
            <CategoryBar label="Technical Accuracy" score={feedback.technicalAccuracy} />
            <CategoryBar label="Completeness" score={feedback.completeness} />
            <CategoryBar label="Clarity" score={feedback.clarity} />
            <CategoryBar label="Relevance" score={feedback.relevance} />
            <CategoryBar label="Depth" score={feedback.depth} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-6 md:grid-cols-2">
        <div>
          <h4 className="mb-3 text-sm font-semibold text-green-600 dark:text-green-400">
            Strengths
          </h4>
          <ul className="space-y-2">
            {feedback.strengths.map((strength, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {strength}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-red-600 dark:text-red-400">
            Areas to Improve
          </h4>
          <ul className="space-y-2">
            {feedback.weaknesses.map((weakness, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {weakness}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200 px-6 py-4 dark:border-slate-700">
        <h4 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">
          Suggestions
        </h4>
        <ul className="space-y-1.5">
          {feedback.suggestions.map((suggestion, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                {i + 1}
              </span>
              {suggestion}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
        <button
          onClick={onToggleModelAnswer}
          className="btn-secondary text-sm"
          aria-label="Toggle model answer"
        >
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {showModelAnswer ? 'Hide Model Answer' : 'View Model Answer'}
        </button>
        {feedback.alternativeAnswers && feedback.alternativeAnswers.length > 0 && (
          <button
            onClick={() => setShowAltAnswers(!showAltAnswers)}
            className="btn-ghost text-sm"
            aria-label="Toggle alternative answers"
          >
            Alternative Answers ({feedback.alternativeAnswers.length})
          </button>
        )}
      </div>

      <AnimatePresence>
        {showAltAnswers && feedback.alternativeAnswers && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-200 px-6 py-4 dark:border-slate-700"
          >
            <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
              Alternative Answers
            </h4>
            <div className="space-y-3">
              {feedback.alternativeAnswers.map((alt, i) => (
                <div key={i} className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  <span className="mb-1 block text-xs font-medium text-primary-500">
                    Alternative {i + 1}
                  </span>
                  {alt}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedbackCard;
