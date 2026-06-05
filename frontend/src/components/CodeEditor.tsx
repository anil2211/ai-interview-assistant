import React from 'react';
import { useTheme } from '@/hooks/useTheme';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  onLanguageChange?: (lang: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
];

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = 'javascript',
  onLanguageChange,
  readOnly = false,
  placeholder = 'Write your code here...',
}) => {
  useTheme();

  const lineCount = value.split('\n').length;

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            <span className="h-3 w-3 rounded-full bg-yellow-500" />
            <span className="h-3 w-3 rounded-full bg-green-500" />
          </div>
          <span className="ml-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            editor
          </span>
        </div>
        <select
          value={language}
          onChange={(e) => onLanguageChange?.(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
          aria-label="Select programming language"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex">
        <div className="select-none border-r border-slate-200 bg-slate-50 px-3 py-3 text-right text-xs leading-5 text-slate-400 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-500">
          {Array.from({ length: Math.max(lineCount, 1) }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          placeholder={placeholder}
          className="w-full resize-none border-0 bg-transparent px-4 py-3 font-mono text-sm leading-5 text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
          style={{ minHeight: '200px' }}
          spellCheck={false}
          aria-label="Code editor"
        />
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
        <span>{language.toUpperCase()}</span>
        <div className="flex items-center gap-3">
          <span>Lines: {lineCount}</span>
          <span>Chars: {value.length}</span>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
