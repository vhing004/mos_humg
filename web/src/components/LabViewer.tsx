import React, { useState } from 'react';
import { CheckSquare, Square, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { LearningProgress, PracticeLab } from '../types';

interface LabViewerProps {
  labs: PracticeLab[];
  progress: LearningProgress;
  onToggleTask: (labId: string, taskIndex: number) => void;
}

export const LabViewer: React.FC<LabViewerProps> = ({
  labs,
  progress,
  onToggleTask,
}) => {
  const [selectedLabId, setSelectedLabId] = useState<string>(labs[0]?.id ?? '');
  const [zoom, setZoom] = useState(1);
  const [mobileTab, setMobileTab] = useState<'image' | 'tasks'>('image');

  const currentLab = labs.find((l) => l.id === selectedLabId) ?? labs[0];

  if (!currentLab) {
    return (
      <div className="p-6 bg-white rounded-2xl border border-slate-200 text-sm text-slate-500">
        Chưa có bài thực hành mẫu nào trong mục này.
      </div>
    );
  }

  const doneCount = currentLab.tasks.filter(
    (_, idx) => progress.completedLabTasks[`${currentLab.id}:${idx}`]
  ).length;

  return (
    <div className="space-y-5">
      {/* Chọn đề thực hành nếu có nhiều hơn 1 */}
      {labs.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {labs.map((lab) => {
            const active = lab.id === currentLab.id;
            return (
              <button
                key={lab.id}
                onClick={() => {
                  setSelectedLabId(lab.id);
                  setZoom(1);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-colors ${
                  active
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {lab.title}
              </button>
            );
          })}
        </div>
      )}

      {/* Chuyển nhanh Đề bài / Checklist trên điện thoại */}
      <div className="lg:hidden flex gap-1 bg-white p-1 rounded-xl border border-slate-200 sticky top-14 z-20">
        <button
          type="button"
          onClick={() => setMobileTab('image')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
            mobileTab === 'image'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Đề bài mẫu ({currentLab.images.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('tasks')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
            mobileTab === 'tasks'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Checklist ({doneCount}/{currentLab.tasks.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Ảnh đề bài có phóng to/thu nhỏ */}
        <div
          className={`lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-4 space-y-3 ${
            mobileTab !== 'image' ? 'hidden lg:block' : ''
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Đề bài mẫu ({currentLab.images.length} trang)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.2).toFixed(1)))}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                title="Thu nhỏ"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-slate-600 w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(2.2, +(z + 0.2).toFixed(1)))}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                title="Phóng to"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                title="Mặc định 100%"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4 max-h-[720px] overflow-auto bg-slate-100 rounded-xl p-3">
            {currentLab.images.map((src, idx) => (
              <div key={src} className="bg-white rounded-lg shadow-xs p-1 overflow-auto">
                <img
                  src={src}
                  alt={`${currentLab.title} - Trang ${idx + 1}`}
                  style={{ width: `${zoom * 100}%`, maxWidth: 'none' }}
                  className="rounded mx-auto transition-all"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Checklist các bước thực hành */}
        <div
          className={`lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 space-y-4 h-fit ${
            mobileTab !== 'tasks' ? 'hidden lg:block' : ''
          }`}
        >
          <div>
            <h3 className="font-bold text-slate-900 text-base">{currentLab.title}</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {currentLab.description}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-2 rounded-xl">
            <span>Tiến độ thực hành</span>
            <span className="text-indigo-600">
              {doneCount}/{currentLab.tasks.length} bước
            </span>
          </div>

          <div className="space-y-2.5">
            {currentLab.tasks.map((task, idx) => {
              const checked = !!progress.completedLabTasks[`${currentLab.id}:${idx}`];
              return (
                <button
                  key={idx}
                  onClick={() => onToggleTask(currentLab.id, idx)}
                  className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-2.5 transition-colors ${
                    checked
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {checked ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  )}
                  <span className={checked ? 'line-through opacity-80' : ''}>{task}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
