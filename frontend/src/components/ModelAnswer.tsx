import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '@/hooks/useTheme';
import toast from 'react-hot-toast';

interface ModelAnswerProps {
  modelAnswer: string;
  userAnswer?: string;
  isLoading?: boolean;
}

const ModelAnswer: React.FC<ModelAnswerProps> = ({
  modelAnswer,
  userAnswer,
  isLoading = false,
}) => {
  const { isDark } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [compareMode, setCompareMode] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(modelAnswer);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const renderContent = (text: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <p key={`t-${lastIndex}`} className="mb-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {text.slice(lastIndex, match.index)}
          </p>
        );
      }
      parts.push(
        <SyntaxHighlighter
          key={`c-${match.index}`}
          language={match[1] || 'text'}
          style={isDark ? oneDark : oneLight}
          customStyle={{ borderRadius: '0.75rem', fontSize: '0.875rem', marginBottom: '0.75rem' }}
        >
          {match[2]}
        </SyntaxHighlighter>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push(
        <p key={`t-${lastIndex}`} className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {text.slice(lastIndex)}
        </p>
      );
    }
    return parts;
  };

  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-1/4 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-20 w-full rounded-lg bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white"
          aria-expanded={isVisible}
        >
          <svg
            className={`h-4 w-4 transition-transform ${isVisible ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Model Answer
        </button>
        {isVisible && (
          <div className="flex items-center gap-2">
            {userAnswer && (
              <button
                onClick={() => setCompareMode(!compareMode)}
                className={`btn-ghost text-xs ${compareMode ? 'text-primary-500' : ''}`}
                aria-label="Toggle compare mode"
              >
                Compare
              </button>
            )}
            <button
              onClick={copyToClipboard}
              className="btn-ghost p-1.5"
              aria-label="Copy model answer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6">
              {compareMode && userAnswer ? (
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Your Answer
                    </h4>
                    <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {userAnswer}
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-green-400">
                      Model Answer
                    </h4>
                    <div className="rounded-xl bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-300">
                      {renderContent(modelAnswer)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {renderContent(modelAnswer)}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModelAnswer;
