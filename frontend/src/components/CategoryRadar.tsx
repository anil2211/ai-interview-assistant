import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';

interface CategoryData {
  category: string;
  score: number;
  fullMark: number;
}

interface CategoryRadarProps {
  data: CategoryData[];
  isLoading?: boolean;
}

const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card px-4 py-3 text-sm">
        <p className="font-medium text-slate-900 dark:text-white">
          {payload[0].payload.category}
        </p>
        <p className="text-primary-500 font-semibold">
          Score: {Math.round(payload[0].value)}%
        </p>
      </div>
    );
  }
  return null;
};

const CategoryRadar: React.FC<CategoryRadarProps> = ({
  data,
  isLoading = false,
}) => {
  const { isDark } = useTheme();

  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="animate-shimmer h-[300px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="mb-6 text-sm font-semibold text-slate-900 dark:text-white">
        Category Breakdown
      </h3>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
            <PolarGrid
              stroke={isDark ? '#334155' : '#e2e8f0'}
            />
            <PolarAngleAxis
              dataKey="category"
              tick={{
                fontSize: 11,
                fill: isDark ? '#94a3b8' : '#64748b',
              }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{
                fontSize: 10,
                fill: isDark ? '#94a3b8' : '#64748b',
              }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.2}
              strokeWidth={2}
              dot={{
                r: 4,
                fill: '#6366f1',
                stroke: isDark ? '#1e293b' : '#fff',
                strokeWidth: 2,
              }}
              activeDot={{ r: 6 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

export default CategoryRadar;
