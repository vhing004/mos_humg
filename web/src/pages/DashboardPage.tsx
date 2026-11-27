import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  FileText,
  Layers,
  Presentation,
  RotateCcw,
} from 'lucide-react';
import { LearningProgress } from '../types';
import { QUIZ_MODULES_META } from '../utils/quizHelpers';
import excelLessonsData from '../data/excel_lessons.json';
import practiceLabsData from '../data/practice_labs.json';

interface DashboardPageProps {
  progress: LearningProgress;
  onResetProgress: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  progress,
  onResetProgress,
}) => {
  const totalQuizQuestions = QUIZ_MODULES_META.reduce(
    (sum, m) => sum + m.questionCount,
    0
  );
  const answeredKeys = Object.keys(progress.quizAnswers);
  const correctCount = answeredKeys.filter((k) => progress.quizAnswers[k]).length;

  const totalExcel = excelLessonsData.length;
  const doneExcel = progress.completedExcelLessons.length;

  const totalLabTasks = practiceLabsData.reduce(
    (sum, lab) => sum + lab.tasks.length,
    0
  );
  const doneLabTasks = Object.values(progress.completedLabTasks).filter(Boolean).length;

  const getModuleStats = (moduleId: string, total: number) => {
    const prefix = `${moduleId}:`;
    const keys = answeredKeys.filter((k) => k.startsWith(prefix));
    const right = keys.filter((k) => progress.quizAnswers[k]).length;
    return { answered: keys.length, right, total };
  };

  const wordStats = getModuleStats('module03', 120);
  const excelStats = getModuleStats('module04', 120);
  const pptStats = getModuleStats('module05', 120);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-700 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold tracking-wide uppercase">
              <Award className="w-3.5 h-3.5" /> Lộ trình tự học & Luyện thi
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Hệ thống Học Word, Excel, PowerPoint & Ôn thi UDCNTTCB
            </h1>
            <p className="text-indigo-100 text-sm sm:text-base">
              Tích hợp đầy đủ 720 câu hỏi trắc nghiệm 6 Module, thực hành gõ công thức Excel
              trực tiếp trên web (24 bài 00–23) và bộ đề mẫu Word / Excel / PowerPoint.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/mock-exam"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-700 font-semibold text-sm hover:bg-indigo-50 transition-colors shadow-sm"
            >
              Thi thử ngay <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/excel"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/40 border border-white/25 text-white font-semibold text-sm hover:bg-indigo-500/60 transition-colors"
            >
              Thực hành Excel trên web
            </Link>
          </div>
        </div>
      </section>

      {/* Summary KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase">Trắc nghiệm đã làm</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{answeredKeys.length}</span>
            <span className="text-sm text-slate-400">/ {totalQuizQuestions} câu</span>
          </div>
          <div className="mt-1 text-xs text-emerald-600 font-medium">
            Đúng {correctCount} câu (
            {answeredKeys.length ? Math.round((correctCount / answeredKeys.length) * 100) : 0}%)
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase">Thực hành Excel</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700">{doneExcel}</span>
            <span className="text-sm text-slate-400">/ {totalExcel} bài</span>
          </div>
          <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${Math.round((doneExcel / Math.max(1, totalExcel)) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase">Checklist Lab mẫu</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">{doneLabTasks}</span>
            <span className="text-sm text-slate-400">/ {totalLabTasks} bước</span>
          </div>
          <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${Math.round((doneLabTasks / Math.max(1, totalLabTasks)) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase">Lần thi thử</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-600">
              {progress.examHistory.length}
            </span>
            <span className="text-sm text-slate-400">bài thi</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {progress.examHistory[0]
              ? `Gần nhất: ${progress.examHistory[0].score}/${progress.examHistory[0].total} điểm`
              : 'Chưa có bài thi nào'}
          </div>
        </div>
      </section>

      {/* 3 môn chính */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Lộ trình 3 môn trọng tâm</h2>
          <Link to="/foundation" className="text-sm font-medium text-indigo-600 hover:underline">
            Xem thêm Module CNTT nền tảng (1, 2, 6) →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Word */}
          <Link
            to="/word"
            className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700">
                Microsoft Word
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                120 câu trắc nghiệm Module 03 + 2 bài thực hành soạn thảo văn bản chuẩn (Tab,
                Watermark, Drop Cap, Bảng biểu).
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">
                Đã làm: {wordStats.answered}/{wordStats.total} câu
              </span>
              <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                Vào học →
              </span>
            </div>
          </Link>

          {/* Excel */}
          <Link
            to="/excel"
            className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700">
                Microsoft Excel
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Thực hành gõ & chấm công thức trực tiếp trên web (8 bài) + 24 bài giảng (00–23) +
                120 câu trắc nghiệm Module 04.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">
                Quiz: {excelStats.answered}/{excelStats.total} • Lab: {doneExcel}/{totalExcel}
              </span>
              <span className="text-emerald-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                Vào học →
              </span>
            </div>
          </Link>

          {/* PowerPoint */}
          <Link
            to="/ppt"
            className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-orange-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                <Presentation className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-700">
                Microsoft PowerPoint
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                120 câu trắc nghiệm Module 05 + bài thực hành thiết kế 3 Slide (Theme, SmartArt,
                Animation, Transition).
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">
                Đã làm: {pptStats.answered}/{pptStats.total} câu
              </span>
              <span className="text-orange-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                Vào học →
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Lịch sử thi thử & Nền tảng */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4.5 h-4.5 text-indigo-600" /> Lịch sử thi thử gần đây
            </h3>
            {progress.examHistory.length > 0 && (
              <button
                onClick={onResetProgress}
                className="inline-flex items-center gap-1 text-xs text-rose-600 hover:underline"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Xóa tiến độ
              </button>
            )}
          </div>
          {progress.examHistory.length === 0 ? (
            <div className="text-sm text-slate-500 py-6 text-center bg-slate-50 rounded-xl">
              Bạn chưa thực hiện bài thi thử nào. Hãy vào mục{' '}
              <Link to="/mock-exam" className="text-indigo-600 font-medium hover:underline">
                Thi thử (Mock Test)
              </Link>{' '}
              để kiểm tra kiến thức!
            </div>
          ) : (
            <div className="space-y-2.5 max-h-64 overflow-y-auto">
              {progress.examHistory.slice(0, 8).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm"
                >
                  <div>
                    <div className="font-semibold text-slate-800">{item.title}</div>
                    <div className="text-xs text-slate-500">
                      {new Date(item.createdAt).toLocaleString('vi-VN')} • Thời gian:{' '}
                      {Math.floor(item.durationSeconds / 60)}p {item.durationSeconds % 60}s
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                      item.score / item.total >= 0.7
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {item.score}/{item.total}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Layers className="w-4.5 h-4.5 text-indigo-600" /> Đề thi mẫu & Kiến thức nền tảng
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Ngoài 3 ứng dụng văn phòng, kho tài liệu còn có 360 câu hỏi về CNTT cơ bản,
              Windows, Internet và đề thi mẫu tổng hợp Word + Excel + PowerPoint.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Module 01, 02, 06: 360 câu trắc nghiệm nền tảng</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Đề thi mẫu UDCNTTCB: 2 trang ảnh kèm checklist chấm từng phần</span>
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/foundation"
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-medium transition-colors"
            >
              Ôn Module 1, 2, 6
            </Link>
            <Link
              to="/labs"
              className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" /> Mở kho Đề thực hành
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
