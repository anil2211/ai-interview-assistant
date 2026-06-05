import React, { useState } from 'react';
import { motion } from 'framer-motion';
import StudyPlanCard from '@/components/StudyPlanCard';
import type { StudyPlan } from '@/types';

const MOCK_PLANS: StudyPlan[] = [
  {
    id: '1',
    userId: '1',
    title: 'Full Stack Interview Prep',
    description: 'Comprehensive preparation for full stack developer interviews covering frontend, backend, and system design.',
    goals: ['Master React and Node.js', 'Understand system design patterns', 'Practice data structures'],
    topics: [
      { id: 't1', title: 'JavaScript Fundamentals', description: '', category: 'coding', resources: [], completed: true, order: 1, estimatedHours: 4 },
      { id: 't2', title: 'React Ecosystem', description: '', category: 'coding', resources: [], completed: true, order: 2, estimatedHours: 6 },
      { id: 't3', title: 'Node.js & Express', description: '', category: 'coding', resources: [], completed: false, order: 3, estimatedHours: 5 },
      { id: 't4', title: 'Database Design', description: '', category: 'database', resources: [], completed: false, order: 4, estimatedHours: 3 },
      { id: 't5', title: 'System Design Basics', description: '', category: 'system-design', resources: [], completed: false, order: 5, estimatedHours: 8 },
      { id: 't6', title: 'DevOps Fundamentals', description: '', category: 'devops', resources: [], completed: false, order: 6, estimatedHours: 4 },
    ],
    dailyGoal: 60,
    progress: 33,
    startDate: '2024-01-01',
    endDate: '2024-03-01',
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-22',
  },
  {
    id: '2',
    userId: '1',
    title: 'DevOps & Cloud Mastery',
    description: 'Deep dive into DevOps practices, CI/CD, and cloud platforms.',
    goals: ['Master Docker & Kubernetes', 'AWS Solutions Architect prep', 'Infrastructure as Code'],
    topics: [
      { id: 't7', title: 'Docker Containers', description: '', category: 'devops', resources: [], completed: false, order: 1, estimatedHours: 5 },
      { id: 't8', title: 'Kubernetes Orchestration', description: '', category: 'devops', resources: [], completed: false, order: 2, estimatedHours: 8 },
      { id: 't9', title: 'AWS Core Services', description: '', category: 'cloud', resources: [], completed: false, order: 3, estimatedHours: 10 },
    ],
    dailyGoal: 45,
    progress: 10,
    startDate: '2024-01-15',
    endDate: '2024-04-15',
    status: 'active',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-22',
  },
];

const StudyPlanPage: React.FC = () => {
  const [plans] = useState<StudyPlan[]>(MOCK_PLANS);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleEdit = (id: string) => {
    console.log('Edit plan:', id);
  };

  const handleDelete = (id: string) => {
    console.log('Delete plan:', id);
  };

  const handleTopicToggle = (planId: string, topicId: string, completed: boolean) => {
    console.log('Toggle topic:', planId, topicId, completed);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Study Plans
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create and manage your interview preparation plans
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary text-sm"
        >
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Plan
        </button>
      </div>

      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
            Create New Study Plan
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Plan Title
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., Frontend Interview Prep"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Description
              </label>
              <textarea
                className="input-field min-h-[80px] resize-none"
                placeholder="Describe your preparation goals..."
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Daily Goal (minutes)
                </label>
                <input type="number" className="input-field" defaultValue={60} />
              </div>
              <div className="flex-1">
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Target Date
                </label>
                <input type="date" className="input-field" />
              </div>
            </div>
            <div className="flex gap-3">
              <button className="btn-primary flex-1">Create Plan</button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <StudyPlanCard
              plan={plan}
              isActive={plan.status === 'active'}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onTopicToggle={handleTopicToggle}
            />
          </motion.div>
        ))}
      </div>

      {plans.length === 0 && !showCreateForm && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg className="mb-4 h-16 w-16 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No study plans yet. Create your first plan!
          </p>
        </div>
      )}
    </div>
  );
};

export default StudyPlanPage;
