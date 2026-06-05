import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import toast from 'react-hot-toast';

interface AnswerPanelProps {
  answer: string;
  readabilityScore?: number;
  isLoading?: boolean;
}

const AnswerPanel: React.FC<AnswerPanelProps> = ({
  answer,
  readabilityScore,
  isLoading = false,
}) => {
  const { isDark } = useTheme();
  const [isExpanded, setIsExpanded] = useState(true);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(answer);
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
          <p key={`text-${lastIndex}`} className="mb-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {text.slice(lastIndex, match.index)}
          </p>
        );
      }

      const language = match[1] || 'text';
      const code = match[2];

      parts.push(
        <div key={`code-${match.index}`} className="mb-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between bg-slate-100 px-4 py-2 dark:bg-slate-800">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {language}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(code);
                toast.success('Code copied');
              }}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              aria-label="Copy code"
            >
              Copy
            </button>
          </div>
          <SyntaxHighlighter
            language={language}
            style={isDark ? oneDark : oneLight}
            customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.875rem' }}
            showLineNumbers
          >
            {code}
          </SyntaxHighlighter>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(
        <p key={`text-${lastIndex}`} className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
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
          <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-20 w-full rounded-lg bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Your Answer
        </h3>
        <div className="flex items-center gap-2">
          {readabilityScore !== undefined && (
            <span className="badge-primary text-xs">
              Readability: {Math.round(readabilityScore)}%
            </span>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn-ghost p-1.5"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <svg className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={copyToClipboard}
            className="btn-ghost p-1.5"
            aria-label="Copy answer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 py-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {renderContent(answer)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnswerPanel;
