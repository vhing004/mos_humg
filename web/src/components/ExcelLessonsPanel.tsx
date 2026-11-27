import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Download,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Search,
} from 'lucide-react';
import excelLessonsRaw from '../data/excel_lessons.json';
import { ExcelLesson, LearningProgress } from '../types';

const LESSONS = excelLessonsRaw as ExcelLesson[];

interface ExcelLessonsPanelProps {
  progress: LearningProgress;
  onToggleComplete: (lessonId: string) => void;
}

export const ExcelLessonsPanel: React.FC<ExcelLessonsPanelProps> = ({
  progress,
  onToggleComplete,
}) => {
  const [selectedId, setSelectedId] = useState<string>(LESSONS[0]?.id ?? 'bai-00');
  const [search, setSearch] = useState('');
  const [activeFileIdx, setActiveFileIdx] = useState(0);
  const [activeSheetIdx, setActiveSheetIdx] = useState(0);

  const filteredLessons = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return LESSONS;
    return LESSONS.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.folderName.toLowerCase().includes(q)
    );
  }, [search]);

  const currentLesson =
    LESSONS.find((l) => l.id === selectedId) ?? filteredLessons[0] ?? LESSONS[0];

  const isCompleted = currentLesson
    ? progress.completedExcelLessons.includes(currentLesson.id)
    : false;

  const files = currentLesson?.files ?? [];
  const activeFile = files[activeFileIdx] ?? files[0];
  const sheets = activeFile?.sheets ?? [];
  const activeSheet = sheets[activeSheetIdx] ?? sheets[0];

  const handleSelectLesson = (id: string) => {
    setSelectedId(id);
    setActiveFileIdx(0);
    setActiveSheetIdx(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Cột trái: Danh sách 26 bài */}
      <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 flex flex-col max-h-[760px]">
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">
              Giáo trình Excel ({progress.completedExcelLessons.length}/{LESSONS.length})
            </h3>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm bài học (VLOOKUP, Pivot, VBA...)"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredLessons.map((lesson) => {
            const done = progress.completedExcelLessons.includes(lesson.id);
            const active = currentLesson?.id === lesson.id;
            return (
              <button
                key={lesson.id}
                onClick={() => handleSelectLesson(lesson.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-colors flex items-start gap-2.5 ${
                  active
                    ? 'bg-emerald-50 text-emerald-900 font-semibold'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                {done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                )}
                <span className="leading-snug">{lesson.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cột phải: Chi tiết bài học & Xem trước bảng tính */}
      <div className="lg:col-span-8 space-y-4">
        {currentLesson && (
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold mb-1.5">
                  Bài {String(currentLesson.number).padStart(2, '0')}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {currentLesson.title}
                </h2>
              </div>

              <button
                onClick={() => onToggleComplete(currentLesson.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                  isCompleted
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {isCompleted ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
              </button>
            </div>

            {currentLesson.description && (
              <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-line border border-slate-100 leading-relaxed">
                {currentLesson.description}
              </div>
            )}

            {/* Tệp tài liệu đính kèm */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Tài liệu & File thực hành ({files.length} tệp)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {files.map((f, idx) => (
                  <div
                    key={f.url}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-colors ${
                      activeFileIdx === idx
                        ? 'border-emerald-400 bg-emerald-50/40'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <button
                      onClick={() => {
                        setActiveFileIdx(idx);
                        setActiveSheetIdx(0);
                      }}
                      className="flex items-center gap-2.5 min-w-0 text-left flex-1"
                    >
                      {f.kind === 'image' ? (
                        <ImageIcon className="w-4 h-4 text-amber-500 shrink-0" />
                      ) : f.ext === '.pdf' ? (
                        <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                      ) : (
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-800 truncate">
                          {f.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {f.kind === 'exercise'
                            ? 'Bài tập / Câu hỏi'
                            : f.kind === 'image'
                            ? 'Hình ảnh minh họa'
                            : 'File bài giảng'}{' '}
                          • {(f.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </button>

                    <a
                      href={f.url}
                      download={f.name}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-700 transition-colors shrink-0"
                      title="Tải file về máy"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Khu vực xem trước nội dung file đang chọn */}
            {activeFile && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-700">
                    Xem trước: {activeFile.name}
                  </span>
                  {sheets.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {sheets.map((s, sIdx) => (
                        <button
                          key={s.name}
                          onClick={() => setActiveSheetIdx(sIdx)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                            activeSheetIdx === sIdx
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {activeFile.kind === 'image' ? (
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-2">
                    <img
                      src={activeFile.url}
                      alt={activeFile.name}
                      className="max-h-96 mx-auto object-contain rounded-lg"
                    />
                  </div>
                ) : activeFile.ext === '.pdf' ? (
                  <div className="rounded-xl overflow-hidden border border-slate-200 h-96">
                    <iframe
                      src={activeFile.url}
                      title={activeFile.name}
                      className="w-full h-full"
                    />
                  </div>
                ) : activeSheet ? (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-96">
                    <table className="min-w-full text-xs text-left border-collapse">
                      <tbody>
                        {activeSheet.rows.map((row, rIdx) => (
                          <tr
                            key={rIdx}
                            className={
                              rIdx === 0
                                ? 'bg-emerald-50 font-semibold text-emerald-900'
                                : 'odd:bg-white even:bg-slate-50/70'
                            }
                          >
                            <td className="px-2 py-1.5 border-b border-r border-slate-200 text-slate-400 font-mono w-8 text-center">
                              {rIdx + 1}
                            </td>
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className="px-2.5 py-1.5 border-b border-r border-slate-200 whitespace-pre-wrap max-w-xs"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 p-4 bg-slate-50 rounded-xl">
                    Không có dữ liệu bảng xem trước. Hãy bấm nút tải về để mở bằng Microsoft
                    Excel.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
