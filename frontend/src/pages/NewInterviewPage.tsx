import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInterview } from '@/hooks/useInterview';
import { INTERVIEW_TYPES, DIFFICULTY_LEVELS } from '@/utils/constants';
import type { InterviewType, Difficulty } from '@/types';

const TOPICS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Docker',
  'Kubernetes', 'AWS', 'Azure', 'System Design', 'Algorithms',
  'Data Structures', 'Database', 'Security', 'DevOps', 'Cloud',
];

const NewInterviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { startInterview, isProcessing } = useInterview();

  const [interviewType, setInterviewType] = useState<InterviewType>('technical');
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [questionCount, setQuestionCount] = useState(5);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [usePredefined, setUsePredefined] = useState(false);

  const handleStart = async () => {
    try {
      const interview = await startInterview({
        type: interviewType,
        difficulty,
        topics: selectedTopics.length > 0 ? selectedTopics : undefined,
        questionCount,
        usePredefined,
      });
      navigate(`/interview/${interview.id}`);
    } catch {
      // handled in hook
    }
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic]
    );
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Configure Your Interview
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Customize your practice session to match your goals
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="glass-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
            Interview Type
          </h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {INTERVIEW_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setInterviewType(type.value as InterviewType)}
                className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                  interviewType === type.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                }`}
                aria-pressed={interviewType === type.value}
              >
                <span className="text-2xl">{type.icon}</span>
                <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                  {type.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
            Difficulty Level
          </h3>
          <div className="flex gap-3">
            {DIFFICULTY_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => setDifficulty(level.value as Difficulty)}
                className={`flex-1 rounded-xl border-2 px-4 py-3 text-center transition-all ${
                  difficulty === level.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                }`}
                aria-pressed={difficulty === level.value}
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {level.label}
                </p>
                <p
                  className="mt-1 text-xs"
                  style={{ color: level.color }}
                >
                  {level.color === '#22c55e' && 'Basic concepts'}
                  {level.color === '#eab308' && 'Applied knowledge'}
                  {level.color === '#f97316' && 'Complex problems'}
                  {level.color === '#ef4444' && 'Expert challenges'}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Topics (optional)
            </h3>
            <span className="text-xs text-slate-500">
              {selectedTopics.length} selected
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((topic) => (
              <button
                key={topic}
                onClick={() => toggleTopic(topic)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedTopics.includes(topic)
                    ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600'
                }`}
                aria-pressed={selectedTopics.includes(topic)}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Number of Questions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose between 3 and 15 questions
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuestionCount(Math.max(3, questionCount - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400"
                aria-label="Decrease questions"
              >
                -
              </button>
              <span className="w-8 text-center text-lg font-bold text-slate-900 dark:text-white">
                {questionCount}
              </span>
              <button
                onClick={() => setQuestionCount(Math.min(15, questionCount + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400"
                aria-label="Increase questions"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={usePredefined}
              onChange={(e) => setUsePredefined(e.target.checked)}
              className="h-5 w-5 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
            />
            <div>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                Use predefined questions
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose from our curated question bank instead of AI-generated questions
              </p>
            </div>
          </label>
        </div>

        <button
          onClick={handleStart}
          disabled={isProcessing}
          className="btn-primary w-full py-4 text-base"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating Interview...
            </span>
          ) : (
            'Start Interview'
          )}
        </button>
      </motion.div>
    </div>
  );
};

export default NewInterviewPage;
