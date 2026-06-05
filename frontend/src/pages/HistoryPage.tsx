import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HistoryTable from '@/components/HistoryTable';
import type { Interview } from '@/types';

const MOCK_INTERVIEWS: Interview[] = [
  {
    id: '1', userId: '1', type: 'technical', difficulty: 'advanced',
    status: 'completed', questions: [], answers: [], score: 85,
    duration: 1800, startedAt: '2024-01-22T10:00:00Z',
    completedAt: '2024-01-22T10:30:00Z',
    createdAt: '2024-01-22T10:00:00Z', updatedAt: '2024-01-22T10:30:00Z',
  },
  {
    id: '2', userId: '1', type: 'behavioral', difficulty: 'intermediate',
    status: 'completed', questions: [], answers: [], score: 72,
    duration: 1200, startedAt: '2024-01-19T14:00:00Z',
    completedAt: '2024-01-19T14:20:00Z',
    createdAt: '2024-01-19T14:00:00Z', updatedAt: '2024-01-19T14:20:00Z',
  },
  {
    id: '3', userId: '1', type: 'coding', difficulty: 'expert',
    status: 'completed', questions: [], answers: [], score: 68,
    duration: 2700, startedAt: '2024-01-15T09:00:00Z',
    completedAt: '2024-01-15T09:45:00Z',
    createdAt: '2024-01-15T09:00:00Z', updatedAt: '2024-01-15T09:45:00Z',
  },
  {
    id: '4', userId: '1', type: 'system-design', difficulty: 'advanced',
    status: 'completed', questions: [], answers: [], score: 78,
    duration: 3600, startedAt: '2024-01-12T11:00:00Z',
    completedAt: '2024-01-12T12:00:00Z',
    createdAt: '2024-01-12T11:00:00Z', updatedAt: '2024-01-12T12:00:00Z',
  },
  {
    id: '5', userId: '1', type: 'mixed', difficulty: 'intermediate',
    status: 'completed', questions: [], answers: [], score: 82,
    duration: 2400, startedAt: '2024-01-08T16:00:00Z',
    completedAt: '2024-01-08T16:40:00Z',
    createdAt: '2024-01-08T16:00:00Z', updatedAt: '2024-01-08T16:40:00Z',
  },
  {
    id: '6', userId: '1', type: 'technical', difficulty: 'beginner',
    status: 'completed', questions: [], answers: [], score: 91,
    duration: 900, startedAt: '2024-01-05T10:00:00Z',
    completedAt: '2024-01-05T10:15:00Z',
    createdAt: '2024-01-05T10:00:00Z', updatedAt: '2024-01-05T10:15:00Z',
  },
];

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [interviews] = useState(MOCK_INTERVIEWS);
  const [selectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [scoreRange, setScoreRange] = useState<[number, number]>([0, 100]);

  const filtered = interviews.filter((i) => {
    if (typeFilter !== 'all' && i.type !== typeFilter) return false;
    if (i.score && (i.score < scoreRange[0] || i.score > scoreRange[1])) return false;
    if (searchTerm && !i.type.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleView = (id: string) => {
    navigate(`/interview/${id}`);
  };

  const handleExport = (id: string) => {
    console.log('Export interview:', id);
  };

  const handleDelete = (id: string) => {
    console.log('Delete interview:', id);
  };

  const handleExportAll = () => {
    console.log('Export all interviews');
  };

  const handleDeleteSelected = () => {
    console.log('Delete selected:', selectedIds);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Interview History
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            View and manage your past interviews
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportAll} className="btn-secondary text-sm">
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export All
          </button>
          {selectedIds.length > 0 && (
            <button onClick={handleDeleteSelected} className="btn-secondary text-sm text-red-500 hover:text-red-600">
              Delete ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[150px]">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search interviews..."
              className="input-field py-2 pl-10 pr-4 text-sm"
              aria-label="Search interviews"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input-field py-2 text-sm w-auto"
            aria-label="Filter by type"
          >
            <option value="all">All Types</option>
            <option value="technical">Technical</option>
            <option value="behavioral">Behavioral</option>
            <option value="coding">Coding</option>
            <option value="system-design">System Design</option>
            <option value="mixed">Mixed</option>
          </select>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Score:</span>
            <input
              type="range"
              min={0}
              max={100}
              value={scoreRange[0]}
              onChange={(e) => setScoreRange([+e.target.value, scoreRange[1]])}
              className="w-20 accent-primary-500"
              aria-label="Min score"
            />
            <input
              type="range"
              min={0}
              max={100}
              value={scoreRange[1]}
              onChange={(e) => setScoreRange([scoreRange[0], +e.target.value])}
              className="w-20 accent-primary-500"
              aria-label="Max score"
            />
            <span>{scoreRange[0]}-{scoreRange[1]}</span>
          </div>
        </div>
      </div>

      <HistoryTable
        interviews={filtered}
        total={filtered.length}
        page={page}
        totalPages={Math.ceil(filtered.length / 10)}
        onPageChange={setPage}
        onView={handleView}
        onExport={handleExport}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default HistoryPage;
