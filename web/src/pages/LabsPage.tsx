import React, { useState } from 'react';
import practiceLabsRaw from '../data/practice_labs.json';
import { LearningProgress, PracticeLab } from '../types';
import { LabViewer } from '../components/LabViewer';

const ALL_LABS = practiceLabsRaw as PracticeLab[];

interface LabsPageProps {
  progress: LearningProgress;
  onToggleLabTask: (labId: string, taskIndex: number) => void;
}

export const LabsPage: React.FC<LabsPageProps> = ({
  progress,
  onToggleLabTask,
}) => {
  const [filter, setFilter] = useState<'all' | 'word' | 'excel' | 'ppt' | 'test'>('all');

  const filtered =
    filter === 'all' ? ALL_LABS : ALL_LABS.filter((l) => l.subject === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kho Đề thực hành mẫu</h1>
          <p className="text-sm text-slate-500 mt-1">
            Tổng hợp đầy đủ đề thực hành Word, Excel, PowerPoint và Đề thi mẫu UDCNTTCB.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 w-fit">
          {(
            [
              { id: 'all', label: 'Tất cả' },
              { id: 'word', label: 'Word' },
              { id: 'excel', label: 'Excel' },
              { id: 'ppt', label: 'PowerPoint' },
              { id: 'test', label: 'Đề tổng hợp' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                filter === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <LabViewer
        key={filter}
        labs={filtered}
        progress={progress}
        onToggleTask={onToggleLabTask}
      />
    </div>
  );
};
