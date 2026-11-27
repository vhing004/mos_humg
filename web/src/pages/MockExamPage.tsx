import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useBlocker } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  EyeOff,
  Flag,
  Play,
  RotateCcw,
  ShieldAlert,
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

/* ─── Toast cảnh báo tạm thời ─────────────────────────────────────── */
interface ViolationToast {
  id: number;
  message: string;
}

/* ─── Modal xác nhận thoát ─────────────────────────────────────────── */
function ConfirmLeaveModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-rose-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100">Thoát khỏi bài thi?</h3>
            <p className="text-xs text-slate-500">Hành vi này sẽ bị ghi nhận vi phạm</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">
          Bạn đang rời trang trong khi bài thi chưa nộp. Tiến trình làm bài sẽ{' '}
          <span className="text-rose-600 font-semibold">mất hoàn toàn</span>. Bạn có chắc muốn
          thoát?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Ở lại thi tiếp
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors"
          >
            Vẫn thoát
          </button>
        </div>
      </div>
    </div>
  );
}

export const MockExamPage: React.FC<MockExamPageProps> = ({ onSaveExam }) => {
  const [selectedPreset, setSelectedPreset] = useState<ExamPreset>(EXAM_PRESETS[0]);
  const [status, setStatus] = useState<'idle' | 'running' | 'submitted'>('idle');
  const [questions, setQuestions] = useState<ShuffledQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);

  /* ── Ràng buộc thi: trạng thái vi phạm ── */
  const [violations, setViolations] = useState(0);       // số lần rời tab
  const [toasts, setToasts] = useState<ViolationToast[]>([]); // danh sách toast
  const [tabHidden, setTabHidden] = useState(false);     // đang ẩn tab
  const toastIdRef = useRef(0);
  const isRunning = status === 'running';

  /* ── Thêm toast vi phạm ── */
  const addToast = useCallback((msg: string) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message: msg }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  /* ── 1. Chặn reload / đóng tab (beforeunload) ── */
  useEffect(() => {
    if (!isRunning) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Bài thi đang diễn ra. Rời trang sẽ mất toàn bộ tiến trình!';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isRunning]);

  /* ── 2. Phát hiện chuyển tab / thu nhỏ cửa sổ (visibilitychange) ── */
  useEffect(() => {
    if (!isRunning) return;
    const handler = () => {
      if (document.hidden) {
        setTabHidden(true);
        setViolations((v) => {
          const next = v + 1;
          addToast(
            `⚠️ Vi phạm #${next}: Bạn đã rời khỏi tab thi! Hành vi này bị ghi nhận.`
          );
          return next;
        });
      } else {
        setTabHidden(false);
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [isRunning, addToast]);

  /* ── 3. Chặn điều hướng React Router (sang trang khác trong app) ── */
  const blocker = useBlocker(isRunning);

  /* ── Đếm ngược thời gian ── */
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

  const handleSubmit = useCallback(() => {
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
  }, [status, questions, answers, totalSeconds, secondsLeft, selectedPreset, onSaveExam]);

  useEffect(() => {
    if (status === 'running' && secondsLeft === 0) {
      handleSubmit();
    }
  }, [secondsLeft, status, handleSubmit]);

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
    setViolations(0);
    setToasts([]);
    setTabHidden(false);
    setStatus('running');
  };

  /* ══════════════ IDLE ══════════════ */
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

        {/* Quy định phòng thi */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 space-y-1">
            <p className="font-semibold">Quy định phòng thi trực tuyến</p>
            <ul className="list-disc list-inside space-y-0.5 text-amber-700">
              <li>Không được chuyển tab hoặc thu nhỏ cửa sổ trong khi thi.</li>
              <li>Không reload hoặc đóng trang khi bài thi đang diễn ra.</li>
              <li>Không điều hướng sang trang khác trong khi thi.</li>
              <li>Mọi hành vi rời trang sẽ bị ghi nhận và hiển thị trên bài thi.</li>
            </ul>
          </div>
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

  /* ══════════════ SUBMITTED ══════════════ */
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
              {violations > 0 && (
                <p className="text-xs text-rose-600 font-semibold mt-0.5 flex items-center gap-1">
                  <EyeOff className="w-3.5 h-3.5" />
                  {violations} lần rời tab bị ghi nhận trong bài thi này
                </p>
              )}
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

  /* ══════════════ RUNNING ══════════════ */
  const currentQ = questions[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <>
      {/* ── Modal xác nhận thoát (React Router blocker) ── */}
      {blocker.state === 'blocked' && (
        <ConfirmLeaveModal
          onConfirm={() => blocker.proceed()}
          onCancel={() => blocker.reset()}
        />
      )}

      {/* ── Banner cảnh báo khi tab bị ẩn ── */}
      {tabHidden && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-none">
          <div className="bg-rose-600 text-white rounded-2xl px-8 py-6 text-center shadow-2xl">
            <EyeOff className="w-10 h-10 mx-auto mb-2" />
            <p className="font-bold text-lg">Tab đang bị ẩn!</p>
            <p className="text-sm opacity-80">Quay lại tab thi để tiếp tục</p>
          </div>
        </div>
      )}

      {/* ── Toast stack vi phạm (góc trên phải) ── */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-xs w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="bg-rose-600 text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-lg flex items-start gap-2 animate-in slide-in-from-right"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Khung câu hỏi chính */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header: tiêu đề + đồng hồ + badge vi phạm */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-slate-700 truncate">
              {selectedPreset.title}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {violations > 0 && (
                <div
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-100 text-rose-700 text-xs font-bold"
                  title={`Đã rời tab ${violations} lần`}
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  {violations} vi phạm
                </div>
              )}
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

          {violations > 0 && (
            <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 p-2.5 rounded-xl">
              <EyeOff className="w-4 h-4 shrink-0" />
              <span>
                Đã ghi nhận <strong>{violations}</strong> lần rời tab trong bài thi này.
              </span>
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors"
          >
            Nộp bài &amp; Xem điểm
          </button>
        </div>

        {/* Thanh điều hướng nhanh dính dưới đáy cho điện thoại */}
        <div className="lg:hidden sticky bottom-16 z-20 bg-white/95 backdrop-blur border border-slate-200 rounded-2xl p-2 shadow-md flex items-center justify-between gap-2">
          <button
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold disabled:opacity-40 bg-white"
          >
            ← Trước
          </button>
          <span className="text-xs font-bold text-slate-700">
            {currentIdx + 1}/{questions.length} •{' '}
            {violations > 0 && (
              <span className="text-rose-600">{violations}⚠ •</span>
            )}{' '}
            {formatSeconds(secondsLeft)}
          </span>
          <button
            disabled={currentIdx >= questions.length - 1}
            onClick={() =>
              setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))
            }
            className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold disabled:opacity-40"
          >
            Tiếp →
          </button>
        </div>
      </div>
    </>
  );
};
