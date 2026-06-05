import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface RecordingButtonProps {
  isRecording: boolean;
  duration: number;
  onToggle: () => void;
  onStop: () => void;
  disabled?: boolean;
}

const RecordingButton: React.FC<RecordingButtonProps> = ({
  isRecording,
  duration,
  onToggle,
  onStop,
  disabled = false,
}) => {
  const [displayTime, setDisplayTime] = useState('00:00');

  useEffect(() => {
    const mins = Math.floor(duration / 60);
    const secs = duration % 60;
    setDisplayTime(
      `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    );
  }, [duration]);

  return (
    <div className="flex items-center gap-4">
      {isRecording ? (
        <>
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3">
              <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="inline-flex h-3 w-3 rounded-full bg-red-500" />
            </span>
            <span className="font-mono text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
              {displayTime}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1 rounded-full bg-primary-400"
                animate={{
                  height: [8 + Math.random() * 16, 8 + Math.random() * 24, 8 + Math.random() * 16],
                }}
                transition={{
                  duration: 0.4 + Math.random() * 0.6,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>

          <motion.button
            onClick={onStop}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600 transition-colors"
            aria-label="Stop recording"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </motion.button>
        </>
      ) : (
        <motion.button
          onClick={onToggle}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={disabled}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Start recording"
        >
          <svg className="h-5 w-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3z" />
            <path d="M17 11a5 5 0 01-10 0H5a7 7 0 0014 0h-2z" />
          </svg>
        </motion.button>
      )}
    </div>
  );
};

export default RecordingButton;
