import React, { useState } from 'react';
import { LearningProgress } from '../types';
import { QuizPractice } from '../components/QuizPractice';

interface FoundationPageProps {
  progress: LearningProgress;
  onAnswerQuiz: (moduleId: string, questionNumber: number, isCorrect: boolean) => void;
}

const FOUNDATION_MODULES = [
  { id: 'module01', label: 'Module 01: CNTT cơ bản' },
  { id: 'module02', label: 'Module 02: Sử dụng máy tính' },
  { id: 'module06', label: 'Module 06: Sử dụng Internet' },
];

export const FoundationPage: React.FC<FoundationPageProps> = ({
  progress,
  onAnswerQuiz,
}) => {
  const [selectedModule, setSelectedModule] = useState('module01');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Kiến thức CNTT Nền tảng (Module 01, 02, 06)
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          360 câu hỏi trắc nghiệm chuẩn Ứng dụng CNTT cơ bản giúp ôn thi lý thuyết toàn diện.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FOUNDATION_MODULES.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedModule(m.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
              selectedModule === m.id
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <QuizPractice
        moduleId={selectedModule}
        progress={progress}
        onAnswer={onAnswerQuiz}
      />
    </div>
  );
};
