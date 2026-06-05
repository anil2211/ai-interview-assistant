import React from 'react';
import { motion } from 'framer-motion';
import type { StudyPlan } from '@/types';

interface StudyPlanCardProps {
  plan: StudyPlan;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onTopicToggle?: (planId: string, topicId: string, completed: boolean) => void;
  isActive?: boolean;
}

const StudyPlanCard: React.FC<StudyPlanCardProps> = ({
  plan,
  onEdit,
  onDelete,
  onTopicToggle,
  isActive = false,
}) => {
  const completedTopics = plan.topics.filter((t) => t.completed).length;
  const totalTopics = plan.topics.length;
  const progress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

  return (
    <div
      className={`glass-card overflow-hidden transition-all ${
        isActive ? 'ring-2 ring-primary-500' : ''
      }`}
    >
      <div className="relative p-6">
        {isActive && (
          <span className="absolute right-4 top-4 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
            Active
          </span>
        )}

        <h3 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">
          {plan.title}
        </h3>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          {plan.description}
        </p>

        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Progress ({completedTopics}/{totalTopics} topics)
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-700">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div className="mb-4 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {plan.dailyGoal} min/day
          </div>
          <div className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {plan.startDate}
          </div>
        </div>

        <div className="space-y-1.5">
          {plan.topics.slice(0, 5).map((topic) => (
            <div
              key={topic.id}
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <button
                onClick={() =>
                  onTopicToggle?.(plan.id, topic.id, !topic.completed)
                }
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-all ${
                  topic.completed
                    ? 'border-primary-500 bg-primary-500 text-white'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
                aria-label={topic.completed ? 'Mark incomplete' : 'Mark complete'}
              >
                {topic.completed && (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span
                className={`text-sm ${
                  topic.completed
                    ? 'text-slate-400 line-through dark:text-slate-500'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {topic.title}
              </span>
              <span className="ml-auto text-xs text-slate-400">
                {topic.estimatedHours}h
              </span>
            </div>
          ))}
          {plan.topics.length > 5 && (
            <p className="pt-1 text-center text-xs text-slate-400">
              +{plan.topics.length - 5} more topics
            </p>
          )}
        </div>

        {plan.goals && plan.goals.length > 0 && (
          <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
            <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              Goals
            </p>
            <ul className="space-y-0.5">
              {plan.goals.map((goal, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400"
                >
                  <span className="mt-0.5 text-primary-500">•</span>
                  {goal}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-slate-200 px-6 py-3 dark:border-slate-700">
        <button
          onClick={() => onEdit?.(plan.id)}
          className="btn-ghost flex-1 text-xs"
          aria-label="Edit plan"
        >
          <svg className="mr-1.5 h-3.5 w-3.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </button>
        <button
          onClick={() => onDelete?.(plan.id)}
          className="btn-ghost flex-1 text-xs text-red-500 hover:text-red-600"
          aria-label="Delete plan"
        >
          <svg className="mr-1.5 h-3.5 w-3.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
};

export default StudyPlanCard;
