import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';

interface ProgressChartProps {
  data: Array<{ date: string; score: number }>;
  periods?: string[];
  onPeriodChange?: (period: string) => void;
  isLoading?: boolean;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card px-4 py-3 text-sm">
        <p className="font-medium text-slate-900 dark:text-white">{label}</p>
        <p className="text-primary-500 font-semibold">
          Score: {Math.round(payload[0].value)}%
        </p>
      </div>
    );
  }
  return null;
};

const ProgressChart: React.FC<ProgressChartProps> = ({
  data,
  periods = ['1W', '1M', '3M', '6M', '1Y'],
  onPeriodChange,
  isLoading = false,
}) => {
  const { isDark } = useTheme();
  const [activePeriod, setActivePeriod] = useState('1M');

  return (
    <div className="glass-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Performance Trend
        </h3>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          {periods.map((period) => (
            <button
              key={period}
              onClick={() => {
                setActivePeriod(period);
                onPeriodChange?.(period);
              }}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                activePeriod === period
                  ? 'bg-white text-primary-600 shadow-sm dark:bg-slate-700 dark:text-primary-400'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              aria-label={`Show ${period} performance`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[300px] items-center justify-center">
          <div className="animate-shimmer h-full w-full rounded-xl" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? '#334155' : '#e2e8f0'}
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#scoreGradient)"
                dot={false}
                activeDot={{
                  r: 6,
                  fill: '#6366f1',
                  stroke: isDark ? '#1e293b' : '#fff',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
};

export default ProgressChart;
