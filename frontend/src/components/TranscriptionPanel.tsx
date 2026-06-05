import React from 'react';
import { motion } from 'framer-motion';

interface TranscriptionPanelProps {
  transcript: string;
  interimTranscript: string;
  isRecording: boolean;
  confidence: number;
  language?: string;
  onLanguageChange?: (lang: string) => void;
}

const TranscriptionPanel: React.FC<TranscriptionPanelProps> = ({
  transcript,
  interimTranscript,
  isRecording,
  confidence,
  language = 'en-US',
  onLanguageChange,
}) => {
  return (
    <div className="glass-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Transcription
        </h3>
        <div className="flex items-center gap-3">
          {isRecording && (
            <div className="flex items-center gap-1.5">
              <span className="flex h-2 w-2">
                <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              <span className="text-xs font-medium text-red-500">Recording</span>
            </div>
          )}
          <select
            value={language}
            onChange={(e) => onLanguageChange?.(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            aria-label="Select language"
          >
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="hi">Hindi</option>
          </select>
        </div>
      </div>

      <div className="min-h-[200px] rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
        {transcript ? (
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {transcript}
          </p>
        ) : (
          <p className="text-sm text-slate-400 dark:text-slate-500 italic">
            {isRecording
              ? 'Listening... Speak your answer'
              : 'Click the microphone button to start recording your answer'}
          </p>
        )}
        {interimTranscript && (
          <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">
            {interimTranscript}
          </p>
        )}
      </div>

      {isRecording && (
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-0.5 rounded-full bg-primary-400"
                  animate={{
                    height: [8, 16 + Math.random() * 24, 8],
                  }}
                  transition={{
                    duration: 0.5 + Math.random() * 0.5,
                    repeat: Infinity,
                    delay: i * 0.05,
                  }}
                />
              ))}
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 rounded-full bg-slate-200 dark:bg-slate-700 h-1.5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(confidence * 100, 10)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {Math.round(confidence * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranscriptionPanel;
