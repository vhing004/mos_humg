import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Flag,
  Play,
  RotateCcw,
  Trophy,
  XCircle,
} from 'lucide-react';
import { MockExamRecord } from '../types';
import {
  formatSeconds,
  getQuizModule,
  prepareShuffledQuestions,
  QUIZ_MODULES_META,
  shuffleArray,
  ShuffledQuestion,
} from '../utils/quizHelpers';

interface MockExamPageProps {
  onSaveExam: (record: MockExamRecord) => void;
}

type ExamPresetId =
  | 'office-mix'
  | 'all-mix'
  | 'module03'
  | 'module04'
  | 'module05'
  | 'module01'
  | 'module02'
  | 'module06';

interface ExamPreset {
  id: ExamPresetId;
  title: string;
  description: string;
  count: number;
  minutes: number;
}

const EXAM_PRESETS: ExamPreset[] = [
  {
    id: 'office-mix',
    title: 'Đề tổng hợp Word + Excel + PowerPoint',
    description: '45 câu ngẫu nhiên (15 Word + 15 Excel + 15 PowerPoint) trong 30 phút.',
    count: 45,
    minutes: 30,
  },
  {
    id: 'all-mix',
    title: 'Đề chuẩn UDCNTTCB (6 Module)',
    description: '60 câu ngẫu nhiên trải đều 6 Module (10 câu/module) trong 40 phút.',
    count: 60,
    minutes: 40,
  },
  ...QUIZ_MODULES_META.map((m) => ({
    id: m.id as ExamPresetId,
    title: `Thi thử ${m.code}: ${m.title}`,
    description: `30 câu ngẫu nhiên từ ngân hàng 120 câu của ${m.code} trong 20 phút.`,
    count: 30,
    minutes: 20,
  })),
];

export const MockExamPage: React.FC<MockExamPageProps> = ({ onSaveExam }) => {
  const [selectedPreset, setSelectedPreset] = useState<ExamPreset>(EXAM_PRESETS[0]);
  const [status, setStatus] = useState<'idle' | 'running' | 'submitted'>('idle');
  const [questions, setQuestions] = useState<ShuffledQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);

  useEffect(() => {
    if (status !== 'running') return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  const handleSubmit = () => {
    if (status !== 'running') return;
    setStatus('submitted');
    const score = questions.reduce(
      (acc, q, idx) => (answers[idx] === q.correctIndex ? acc + 1 : acc),
      0
    );
    const used = Math.max(1, totalSeconds - secondsLeft);
    onSaveExam({
      id: `${Date.now()}`,
      title: selectedPreset.title,
      moduleId: selectedPreset.id,
      score,
      total: questions.length,
      durationSeconds: used,
      createdAt: new Date().toISOString(),
    });
  };

  useEffect(() => {
    if (status === 'running' && secondsLeft === 0) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, status]);

  const startExam = (preset: ExamPreset) => {
    let pool: ShuffledQuestion[] = [];
    if (preset.id === 'office-mix') {
      for (const mid of ['module03', 'module04', 'module05']) {
        const mod = getQuizModule(mid);
        if (mod) {
          const picked = shuffleArray(mod.questions).slice(0, 15);
          pool.push(...prepareShuffledQuestions(mid, picked));
        }
      }
      pool = shuffleArray(pool);
    } else if (preset.id === 'all-mix') {
      for (const meta of QUIZ_MODULES_META) {
        const mod = getQuizModule(meta.id);
        if (mod) {
          const picked = shuffleArray(mod.questions).slice(0, 10);
          pool.push(...prepareShuffledQuestions(meta.id, picked));
        }
      }
      pool = shuffleArray(pool);
    } else {
      const mod = getQuizModule(preset.id);
      if (mod) {
        const picked = shuffleArray(mod.questions).slice(0, preset.count);
        pool = prepareShuffledQuestions(preset.id, picked);
      }
    }

    const secs = preset.minutes * 60;
    setSelectedPreset(preset);
    setQuestions(pool);
    setAnswers({});
    setFlagged({});
    setCurrentIdx(0);
    setTotalSeconds(secs);
    setSecondsLeft(secs);
    setStatus('running');
  };

  if (status === 'idle') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Thi thử (Mock Test)</h1>
          <p className="text-sm text-slate-500 mt-1">
            Chọn cấu trúc đề thi bên dưới. Hệ thống tự động rút câu hỏi ngẫu nhiên và xáo trộn
            đáp án A/B/C/D.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EXAM_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-300 transition-all flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-slate-900">{preset.title}</h3>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold shrink-0">
                    {preset.minutes} phút
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1.5">{preset.description}</p>
              </div>
              <button
                onClick={() => startExam(preset)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
              >
                <Play className="w-4 h-4" /> Bắt đầu thi ({preset.count} câu)
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (status === 'submitted') {
    const score = questions.reduce(
      (acc, q, idx) => (answers[idx] === q.correctIndex ? acc + 1 : acc),
      0
    );
    const percent = Math.round((score / Math.max(1, questions.length)) * 100);
    const optionLetters = ['A', 'B', 'C', 'D'];

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                percent >= 70
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Kết quả: {score}/{questions.length} câu đúng ({percent}%)
              </h2>
              <p className="text-sm text-slate-500">{selectedPreset.title}</p>
            </div>
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={() => startExam(selectedPreset)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
            >
              <RotateCcw className="w-4 h-4" /> Thi lại đề mới
            </button>
            <button
              onClick={() => setStatus('idle')}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold"
            >
              Đổi đề khác
            </button>
          </div>
        </div>

        {/* Chi tiết đáp án */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900">Xem lại chi tiết bài làm</h3>
          {questions.map((q, idx) => {
            const chosen = answers[idx];
            const isRight = chosen === q.correctIndex;
            return (
              <div
                key={idx}
                className={`bg-white rounded-2xl p-5 border ${
                  isRight ? 'border-emerald-200' : 'border-rose-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="font-semibold text-sm sm:text-base text-slate-900">
                    <span className="text-indigo-600 mr-1.5">Câu {idx + 1}:</span>
                    {q.question}
                  </div>
                  {isRight ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {q.options.map((opt, oIdx) => {
                    let cls = 'bg-slate-50 border-slate-200 text-slate-600';
                    if (oIdx === q.correctIndex) {
                      cls = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-medium';
                    } else if (oIdx === chosen && !isRight) {
                      cls = 'bg-rose-50 border-rose-400 text-rose-900';
                    }
                    return (
                      <div key={oIdx} className={`px-3 py-2 rounded-xl border ${cls}`}>
                        <strong className="mr-1.5">{optionLetters[oIdx]}.</strong>
                        {opt}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Trạng thái đang làm bài thi
  const currentQ = questions[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Khung câu hỏi chính */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-700">{selectedPreset.title}</div>
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-sm ${
              secondsLeft < 120
                ? 'bg-rose-100 text-rose-700'
                : 'bg-indigo-50 text-indigo-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            {formatSeconds(secondsLeft)}
          </div>
        </div>

        {currentQ && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="text-base sm:text-lg font-semibold text-slate-900">
                <span className="inline-block px-2.5 py-0.5 mr-2 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold">
                  Câu {currentIdx + 1}/{questions.length}
                </span>
                {currentQ.question}
              </div>
              <button
                onClick={() =>
                  setFlagged((prev) => ({ ...prev, [currentIdx]: !prev[currentIdx] }))
                }
                className={`p-2 rounded-xl border text-xs shrink-0 ${
                  flagged[currentIdx]
                    ? 'bg-amber-50 border-amber-300 text-amber-700'
                    : 'border-slate-200 text-slate-400 hover:text-slate-700'
                }`}
                title="Đánh dấu xem lại"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {currentQ.options.map((opt, oIdx) => {
                const selected = answers[currentIdx] === oIdx;
                return (
                  <button
                    key={oIdx}
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [currentIdx]: oIdx }))
                    }
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm sm:text-base transition-all flex items-start gap-3 ${
                      selected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-medium'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <span className="font-bold">{optionLetters[oIdx]}.</span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium disabled:opacity-40 hover:bg-slate-50"
              >
                ← Câu trước
              </button>
              <button
                disabled={currentIdx >= questions.length - 1}
                onClick={() =>
                  setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))
                }
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium disabled:opacity-40 hover:bg-slate-800"
              >
                Câu tiếp →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bảng điều hướng câu hỏi */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 h-fit space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold text-slate-900">Danh sách câu hỏi</span>
          <span className="text-slate-500">
            {answeredCount}/{questions.length} đã chọn
          </span>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-5 gap-2">
          {questions.map((_, idx) => {
            const isCurrent = idx === currentIdx;
            const isAnswered = answers[idx] !== undefined;
            const isFlagged = flagged[idx];

            let cls = 'bg-slate-100 text-slate-600 border-transparent';
            if (isAnswered) cls = 'bg-emerald-100 text-emerald-800 border-emerald-300';
            if (isFlagged) cls = 'bg-amber-100 text-amber-800 border-amber-400';
            if (isCurrent) cls += ' ring-2 ring-indigo-600';

            return (
              <button
                key={idx}
                onClick={() => setCurrentIdx(idx)}
                className={`py-2 rounded-lg text-xs font-bold border transition-all ${cls}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {answeredCount < questions.length && (
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Còn {questions.length - answeredCount} câu chưa chọn đáp án.</span>
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors"
        >
          Nộp bài & Xem điểm
        </button>
      </div>
    </div>
  );
};
