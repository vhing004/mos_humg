import React, { useState } from 'react';
import { BookOpen, Calculator, FileSpreadsheet, HelpCircle } from 'lucide-react';
import practiceLabsRaw from '../data/practice_labs.json';
import { LearningProgress, PracticeLab } from '../types';
import { QuizPractice } from '../components/QuizPractice';
import { ExcelLessonsPanel } from '../components/ExcelLessonsPanel';
import { ExcelSandbox } from '../components/ExcelSandbox';
import { LabViewer } from '../components/LabViewer';

const ALL_LABS = practiceLabsRaw as PracticeLab[];

interface SubjectPageProps {
  subject: 'word' | 'excel' | 'ppt';
  progress: LearningProgress;
  onAnswerQuiz: (moduleId: string, questionNumber: number, isCorrect: boolean) => void;
  onToggleExcelComplete: (lessonId: string) => void;
  onCompleteInteractiveLab: (labId: string) => void;
  onToggleLabTask: (labId: string, taskIndex: number) => void;
}

const SUBJECT_CONFIG = {
  word: {
    title: 'Microsoft Word',
    subtitle: 'Trắc nghiệm Module 03 (120 câu) & Bài thực hành soạn thảo văn bản',
    moduleId: 'module03',
    badgeClass: 'bg-blue-50 text-blue-700',
  },
  excel: {
    title: 'Microsoft Excel',
    subtitle:
      'Thực hành gõ & chấm công thức trực tiếp trên web, 24 bài giảng (00–23) & Trắc nghiệm Module 04',
    moduleId: 'module04',
    badgeClass: 'bg-emerald-50 text-emerald-700',
  },
  ppt: {
    title: 'Microsoft PowerPoint',
    subtitle: 'Trắc nghiệm Module 05 (120 câu) & Bài thực hành trình chiếu',
    moduleId: 'module05',
    badgeClass: 'bg-orange-50 text-orange-700',
  },
};

export const SubjectPage: React.FC<SubjectPageProps> = ({
  subject,
  progress,
  onAnswerQuiz,
  onToggleExcelComplete,
  onCompleteInteractiveLab,
  onToggleLabTask,
}) => {
  const cfg = SUBJECT_CONFIG[subject];
  const subjectLabs = ALL_LABS.filter((l) => l.subject === subject);

  const [activeTab, setActiveTab] = useState<'sandbox' | 'lessons' | 'quiz' | 'labs'>(
    subject === 'excel' ? 'sandbox' : 'quiz'
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <span
            className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold mb-2 ${cfg.badgeClass}`}
          >
            Chuyên đề {cfg.title}
          </span>
          <h1 className="text-2xl font-bold text-slate-900">{cfg.title}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{cfg.subtitle}</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 w-fit">
          {subject === 'excel' && (
            <>
              <button
                onClick={() => setActiveTab('sandbox')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                  activeTab === 'sandbox'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Calculator className="w-4 h-4" /> Thực hành công thức
              </button>
              <button
                onClick={() => setActiveTab('lessons')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                  activeTab === 'lessons'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" /> 24 Bài giảng
              </button>
            </>
          )}

          <button
            onClick={() => setActiveTab('quiz')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
              activeTab === 'quiz'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <HelpCircle className="w-4 h-4" /> Trắc nghiệm (120 câu)
          </button>

          <button
            onClick={() => setActiveTab('labs')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
              activeTab === 'labs'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Đề mẫu ({subjectLabs.length})
          </button>
        </div>
      </div>

      {activeTab === 'sandbox' && subject === 'excel' && (
        <ExcelSandbox
          progress={progress}
          onCompleteLab={onCompleteInteractiveLab}
        />
      )}

      {activeTab === 'lessons' && subject === 'excel' && (
        <ExcelLessonsPanel
          progress={progress}
          onToggleComplete={onToggleExcelComplete}
        />
      )}

      {activeTab === 'quiz' && (
        <QuizPractice
          moduleId={cfg.moduleId}
          progress={progress}
          onAnswer={onAnswerQuiz}
        />
      )}

      {activeTab === 'labs' && (
        <LabViewer
          labs={subjectLabs}
          progress={progress}
          onToggleTask={onToggleLabTask}
        />
      )}
    </div>
  );
};
