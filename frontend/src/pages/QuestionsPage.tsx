import React, { useState } from 'react';
import { motion } from 'framer-motion';
import QuestionCard from '@/components/QuestionCard';
import { CATEGORY_COLORS, DIFFICULTY_LEVELS } from '@/utils/constants';
import { formatCategory } from '@/utils/formatters';
import type { QuestionCategory, Difficulty } from '@/types';

const MOCK_QUESTIONS: Array<{
  id: string;
  text: string;
  category: QuestionCategory;
  difficulty: Difficulty;
  tags: string[];
  hints: string[];
  timeLimit: number;
  modelAnswer?: string;
}> = [
  {
    id: '1',
    text: 'Explain the concept of closures in JavaScript. How do they work and when would you use them?',
    category: 'coding',
    difficulty: 'intermediate',
    tags: ['JavaScript', 'closures', 'scope'],
    hints: ['Think about function scope and variable access', 'Consider how inner functions can access outer variables'],
    timeLimit: 180,
  },
  {
    id: '2',
    text: 'Describe the difference between Containers and Virtual Machines. When would you choose one over the other?',
    category: 'devops',
    difficulty: 'intermediate',
    tags: ['Docker', 'Virtualization', 'Infrastructure'],
    hints: ['Consider resource utilization', 'Think about startup time and isolation'],
    timeLimit: 240,
  },
  {
    id: '3',
    text: 'Design a URL shortening service like TinyURL. What are the key components and trade-offs?',
    category: 'system-design',
    difficulty: 'advanced',
    tags: ['System Design', 'Scalability', 'Database'],
    hints: ['Consider the read/write ratio', 'Think about hashing strategies'],
    timeLimit: 600,
  },
  {
    id: '4',
    text: 'Tell me about a time you had to deal with a difficult team member. How did you handle it?',
    category: 'behavioral',
    difficulty: 'beginner',
    tags: ['Conflict Resolution', 'Teamwork', 'Communication'],
    hints: ['Use the STAR method', 'Focus on the resolution'],
    timeLimit: 180,
  },
  {
    id: '5',
    text: 'Explain the CAP theorem and how it applies to distributed database design.',
    category: 'database',
    difficulty: 'advanced',
    tags: ['CAP Theorem', 'Distributed Systems', 'Consistency'],
    hints: ['Consistency, Availability, Partition Tolerance', 'You can only pick two'],
    timeLimit: 300,
  },
];

const QuestionsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = Object.keys(CATEGORY_COLORS);

  const filteredQuestions = MOCK_QUESTIONS.filter((q) => {
    if (selectedCategory !== 'all' && q.category !== selectedCategory) return false;
    if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
    if (search) {
      const term = search.toLowerCase();
      return (
        q.text.toLowerCase().includes(term) ||
        q.tags.some((t) => t.toLowerCase().includes(term))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Practice Questions
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Browse and practice with our curated question bank
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`rounded-lg p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            aria-label="Grid view"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`rounded-lg p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            aria-label="List view"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="input-field py-2 pl-10 pr-4 text-sm"
              aria-label="Search questions"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field py-2 text-sm w-auto"
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {formatCategory(cat)}
              </option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="input-field py-2 text-sm w-auto"
            aria-label="Filter by difficulty"
          >
            <option value="all">All Levels</option>
            {DIFFICULTY_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field py-2 text-sm w-auto"
            aria-label="Sort by"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="most-difficult">Most Difficult</option>
            <option value="least-difficult">Least Difficult</option>
          </select>
        </div>
      </div>

      <div className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2' : 'space-y-3'}>
        {filteredQuestions.map((q, i) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <QuestionCard question={q as any} />
          </motion.div>
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg className="mb-4 h-12 w-12 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No questions match your filters
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('all');
              setSelectedDifficulty('all');
            }}
            className="mt-2 text-sm font-medium text-primary-500"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionsPage;
