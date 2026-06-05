import React from 'react';
import { motion } from 'framer-motion';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  animated?: boolean;
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  size = 100,
  strokeWidth = 8,
  showLabel = true,
  animated = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedScore = Math.min(100, Math.max(0, score));
  const offset = circumference - (clampedScore / 100) * circumference;

  const getColor = (value: number) => {
    if (value >= 70) return '#22c55e';
    if (value >= 40) return '#eab308';
    return '#ef4444';
  };

  const color = getColor(clampedScore);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-200 dark:text-slate-700"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={animated ? { strokeDashoffset: circumference } : undefined}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-2xl font-bold text-slate-900 dark:text-white"
            initial={animated ? { opacity: 0, scale: 0.5 } : undefined}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {Math.round(clampedScore)}
          </motion.span>
          {size > 80 && (
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              /100
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ScoreGauge;
