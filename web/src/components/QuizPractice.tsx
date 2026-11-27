import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Search,
  Shuffle,
  XCircle,
} from 'lucide-react';
import { LearningProgress } from '../types';
import {
  getQuizModule,
  prepareShuffledQuestions,
  ShuffledQuestion,
} from '../utils/quizHelpers';

interface QuizPracticeProps {
  moduleId: string;
  progress: LearningProgress;
  onAnswer: (moduleId: string, questionNumber: number, isCorrect: boolean) => void;
}

type FilterMode = 'all' | 'unanswered' | 'wrong';

export const QuizPractice: React.FC<QuizPracticeProps> = ({
  moduleId,
  progress,
  onAnswer,
}) => {
  const moduleData = getQuizModule(moduleId);
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [showAllAnswers, setShowAllAnswers] = useState(false);
  const [selectedChoices, setSelectedChoices] = useState<Record<number, number>>({});
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const shuffledQuestions: ShuffledQuestion[] = useMemo(() => {
    if (!moduleData) return [];
    void shuffleSeed;
    return prepareShuffledQuestions(moduleId, moduleData.questions);
  }, [moduleData, moduleId, shuffleSeed]);

  const filteredQuestions = useMemo(() => {
    const qLower = search.trim().toLowerCase();
    return shuffledQuestions.filter((q) => {
      const key = `${moduleId}:${q.number}`;
      const recorded = progress.quizAnswers[key];
      if (filterMode === 'unanswered' && recorded !== undefined) return false;
      if (filterMode === 'wrong' && recorded !== false) return false;
      if (qLower) {
        const inQ = q.question.toLowerCase().includes(qLower);
        const inOpts = q.options.some((o) => o.toLowerCase().includes(qLower));
        return inQ || inOpts || String(q.number) === qLower;
      }
      return true;
    });
  }, [shuffledQuestions, search, filterMode, moduleId, progress.quizAnswers]);

  if (!moduleData) {
    return (
      <div className="p-6 bg-white rounded-2xl border border-slate-200 text-slate-500">
        Không tìm thấy dữ liệu cho module {moduleId}.
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleQuestions = filteredQuestions.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const answeredInModule = moduleData.questions.filter(
    (q) => progress.quizAnswers[`${moduleId}:${q.number}`] !== undefined
  ).length;
  const correctInModule = moduleData.questions.filter(
    (q) => progress.quizAnswers[`${moduleId}:${q.number}`] === true
  ).length;

  const handleSelectOption = (q: ShuffledQuestion, optIndex: number) => {
    setSelectedChoices((prev) => ({ ...prev, [q.number]: optIndex }));
    onAnswer(moduleId, q.number, optIndex === q.correctIndex);
  };

  return (
    <div className="space-y-5">
      {/* Thanh công cụ lọc & thống kê */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {moduleData.code}: {moduleData.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Đã làm: <strong className="text-slate-800">{answeredInModule}</strong>/
              {moduleData.questions.length} câu • Đúng:{' '}
              <strong className="text-emerald-600">{correctInModule}</strong> câu
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedChoices({});
                setShuffleSeed((s) => s + 1);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <Shuffle className="w-3.5 h-3.5" /> Trộn lại đáp án
            </button>
            <button
              onClick={() => setShowAllAnswers((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                showAllAnswers
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              {showAllAnswers ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" /> Ẩn đáp án
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" /> Hiện đáp án
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo từ khóa hoặc số câu (vd: VLOOKUP, Ctrl+E, 15)..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
            {(
              [
                { id: 'all', label: 'Tất cả' },
                { id: 'unanswered', label: 'Chưa làm' },
                { id: 'wrong', label: 'Làm sai' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setFilterMode(tab.id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterMode === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Danh sách câu hỏi */}
      {visibleQuestions.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-sm text-slate-500">
          Không có câu hỏi nào khớp với bộ lọc hiện tại.
        </div>
      ) : (
        <div className="space-y-4">
          {visibleQuestions.map((q) => {
            const chosen = selectedChoices[q.number];
            const hasChosen = chosen !== undefined;
            const optionLetters = ['A', 'B', 'C', 'D'];

            return (
              <div
                key={q.number}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
                    <span className="inline-block px-2 py-0.5 mr-2 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold">
                      Câu {q.number}
                    </span>
                    {q.question}
                  </div>
                  {hasChosen && (
                    <span className="shrink-0 mt-0.5">
                      {chosen === q.correctIndex ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-500" />
                      )}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {q.options.map((optText, idx) => {
                    const isSelected = chosen === idx;
                    const isCorrect = idx === q.correctIndex;
                    const reveal = hasChosen || showAllAnswers;

                    let style =
                      'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-800';
                    if (reveal) {
                      if (isCorrect) {
                        style =
                          'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium';
                      } else if (isSelected && !isCorrect) {
                        style = 'border-rose-400 bg-rose-50 text-rose-900';
                      } else {
                        style = 'border-slate-200 bg-white text-slate-500';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectOption(q, idx)}
                        className={`text-left px-3.5 py-2.5 rounded-xl border text-sm transition-all flex items-start gap-2.5 ${style}`}
                      >
                        <span className="font-bold shrink-0">{optionLetters[idx]}.</span>
                        <span className="leading-snug">{optText}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-200 text-sm">
          <span className="text-slate-500 text-xs sm:text-sm">
            Trang <strong>{safePage}</strong> / {totalPages} ({filteredQuestions.length} câu)
          </span>
          <div className="flex gap-2">
            <button
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium disabled:opacity-40 hover:bg-slate-50"
            >
              Trước
            </button>
            <button
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium disabled:opacity-40 hover:bg-slate-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
