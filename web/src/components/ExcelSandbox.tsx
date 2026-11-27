import React, { useEffect, useMemo, useRef, useState } from 'react';
import { HyperFormula } from 'hyperformula';
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  List,
  Lock,
  MousePointerClick,
  Play,
  RotateCcw,
  Sparkles,
  XCircle,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import interactiveLabsRaw from '../data/excel_interactive_labs.json';
import { ExcelInteractiveLab, LearningProgress } from '../types';
import {
  canInsertReferenceAtCursor,
  formatRangeRef,
  getFormulaAutocompleteContext,
  parseFormulaReferences,
  shiftFormulaReferences,
  toggleReferenceLock,
  EXCEL_FUNCTIONS_DOCS,
} from '../utils/excelFormulaUtils';

const LABS = interactiveLabsRaw as ExcelInteractiveLab[];

interface ExcelSandboxProps {
  progress: LearningProgress;
  onCompleteLab: (labId: string) => void;
}

const HIGHLIGHT_STYLES = [
  'ring-2 ring-inset ring-blue-500 bg-blue-50/50',
  'ring-2 ring-inset ring-purple-500 bg-purple-50/50',
  'ring-2 ring-inset ring-amber-500 bg-amber-50/50',
  'ring-2 ring-inset ring-teal-500 bg-teal-50/50',
];

function formatDisplayValue(val: unknown): string {
  if (val === null || val === undefined || val === '') return '';
  if (typeof val === 'number') {
    if (Number.isInteger(val) && Math.abs(val) >= 1000) {
      return val.toLocaleString('vi-VN');
    }
    return String(Math.round(val * 10000) / 10000);
  }
  if (typeof val === 'object' && val !== null && 'value' in val) {
    return String((val as { value: unknown }).value ?? '#ERR');
  }
  return String(val);
}

function valuesMatch(actual: unknown, expected: string | number): boolean {
  if (typeof expected === 'number') {
    const num = typeof actual === 'number' ? actual : Number(actual);
    return !Number.isNaN(num) && Math.abs(num - expected) < 0.01;
  }
  return String(actual ?? '').trim().toLowerCase() === expected.trim().toLowerCase();
}

export const ExcelSandbox: React.FC<ExcelSandboxProps> = ({
  progress,
  onCompleteLab,
}) => {
  const [selectedLabId, setSelectedLabId] = useState<string>(LABS[0].id);
  const [groupFilter, setGroupFilter] = useState<'all' | 'exam' | 'lesson'>('all');
  const [userInputs, setUserInputs] = useState<Record<string, Record<string, string>>>({});
  const [activeRef, setActiveRef] = useState<string>(LABS[0].targets[0]?.ref ?? 'D4');
  const [cursorPos, setCursorPos] = useState<number>(0);
  const [checkResults, setCheckResults] = useState<Record<string, boolean> | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showTheory, setShowTheory] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  // Trạng thái thu gọn danh sách bài Lab và cột ảnh đề bên trái
  const [showLabList, setShowLabList] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  const [showDePane, setShowDePane] = useState(true);
  const [deZoom, setDeZoom] = useState(1);
  // Chế độ xem trên điện thoại (< lg): chia đôi trên/dưới, chỉ đề, hoặc chỉ sheet
  const [mobileView, setMobileView] = useState<'split' | 'image' | 'sheet'>('split');
  // Hỗ trợ chạm 2 ô trên điện thoại để chọn vùng (A1:B5)
  const [touchRangeStart, setTouchRangeStart] = useState<{
    row: number;
    col: number;
    insertAt: number;
    lastLen: number;
  } | null>(null);

  // Trạng thái kéo chọn vùng tham chiếu
  const [dragSelect, setDragSelect] = useState<{
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
    insertAt: number;
    lastInsertedLen: number;
  } | null>(null);

  // Trạng thái kéo Fill Handle sao chép công thức
  const [fillDrag, setFillDrag] = useState<{
    sourceRow: number;
    sourceCol: number;
    sourceFormula: string;
    currentRow: number;
    currentCol: number;
  } | null>(null);

  const formulaInputRef = useRef<HTMLInputElement>(null);

  const filteredLabs = useMemo(
    () => (groupFilter === 'all' ? LABS : LABS.filter((l) => l.group === groupFilter)),
    [groupFilter]
  );

  const lab = LABS.find((l) => l.id === selectedLabId) ?? LABS[0];
  const currentInputs = userInputs[lab.id] ?? {};

  const targetByCoord = useMemo(() => {
    const map = new Map<string, (typeof lab.targets)[number]>();
    for (const t of lab.targets) {
      map.set(`${t.row}:${t.col}`, t);
    }
    return map;
  }, [lab]);

  const targetByRef = useMemo(() => {
    const map = new Map<string, (typeof lab.targets)[number]>();
    for (const t of lab.targets) {
      map.set(t.ref, t);
    }
    return map;
  }, [lab]);

  const activeTarget = targetByRef.get(activeRef);
  const activeFormula = activeTarget ? currentInputs[activeTarget.ref] ?? '' : '';

  // Highlight các ô/vùng đang được tham chiếu trong công thức hiện tại
  const highlightedRanges = useMemo(
    () => parseFormulaReferences(activeFormula),
    [activeFormula]
  );

  // Gợi ý hàm & thanh tham số
  const autocompleteCtx = useMemo(
    () => getFormulaAutocompleteContext(activeFormula, cursorPos),
    [activeFormula, cursorPos]
  );

  const matchingFunctions = useMemo(() => {
    if (!autocompleteCtx.typingFuncPrefix) return [];
    const p = autocompleteCtx.typingFuncPrefix;
    return EXCEL_FUNCTIONS_DOCS.filter((f) => f.name.startsWith(p)).slice(0, 6);
  }, [autocompleteCtx.typingFuncPrefix]);

  // Tính toán toàn bộ bảng tính bằng HyperFormula
  const computedGrid = useMemo(() => {
    const matrix = lab.rows.map((row, rIdx) =>
      row.map((cell, cIdx) => {
        const target = targetByCoord.get(`${rIdx}:${cIdx}`);
        if (target) {
          const raw = currentInputs[target.ref];
          if (raw !== undefined && raw !== '') {
            return raw.startsWith('=') ? raw.replace(/;/g, ',') : raw;
          }
          return '';
        }
        return cell === null ? '' : cell;
      })
    );

    const hf = HyperFormula.buildFromArray(matrix, { licenseKey: 'gpl-v3' });
    const out = matrix.map((row, rIdx) =>
      row.map((_, cIdx) => hf.getCellValue({ sheet: 0, row: rIdx, col: cIdx }))
    );
    hf.destroy();
    return out;
  }, [lab, currentInputs, targetByCoord]);

  // Kết thúc kéo chuột toàn cục
  useEffect(() => {
    const handleWindowMouseUp = () => {
      if (dragSelect) {
        const finalPos = dragSelect.insertAt + dragSelect.lastInsertedLen;
        setDragSelect(null);
        setCursorPos(finalPos);
        window.setTimeout(() => {
          if (formulaInputRef.current) {
            formulaInputRef.current.focus();
            formulaInputRef.current.setSelectionRange(finalPos, finalPos);
          }
        }, 0);
      }

      if (fillDrag) {
        const minR = Math.min(fillDrag.sourceRow, fillDrag.currentRow);
        const maxR = Math.max(fillDrag.sourceRow, fillDrag.currentRow);
        const updates: Record<string, string> = {};
        for (let r = minR; r <= maxR; r++) {
          const t = targetByCoord.get(`${r}:${fillDrag.sourceCol}`);
          if (t && r !== fillDrag.sourceRow) {
            updates[t.ref] = shiftFormulaReferences(
              fillDrag.sourceFormula,
              r - fillDrag.sourceRow,
              0
            );
          }
        }
        if (Object.keys(updates).length > 0) {
          setUserInputs((prev) => ({
            ...prev,
            [lab.id]: {
              ...(prev[lab.id] ?? {}),
              ...updates,
            },
          }));
          setCheckResults(null);
        }
        setFillDrag(null);
      }
    };

    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => window.removeEventListener('mouseup', handleWindowMouseUp);
  }, [dragSelect, fillDrag, lab.id, targetByCoord]);

  const handleSelectLab = (id: string) => {
    const nextLab = LABS.find((l) => l.id === id) ?? LABS[0];
    setSelectedLabId(id);
    setActiveRef(nextLab.targets[0]?.ref ?? '');
    setCursorPos(0);
    setCheckResults(null);
    setShowHint(false);
    setDeZoom(1);
    setTouchRangeStart(null);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setShowLabList(false);
    }
  };

  const handleCellChange = (ref: string, value: string, nextCursor?: number) => {
    setUserInputs((prev) => ({
      ...prev,
      [lab.id]: {
        ...(prev[lab.id] ?? {}),
        [ref]: value,
      },
    }));
    if (nextCursor !== undefined) {
      setCursorPos(nextCursor);
    }
    setCheckResults(null);
  };

  // Chèn nhanh ký tự công thức (rất hữu ích trên bàn phím điện thoại)
  const handleInsertToken = (token: string) => {
    if (!activeTarget) return;
    const pos = formulaInputRef.current?.selectionStart ?? cursorPos;
    const nextFormula = activeFormula.slice(0, pos) + token + activeFormula.slice(pos);
    const nextPos = pos + token.length;
    handleCellChange(activeTarget.ref, nextFormula, nextPos);
    window.setTimeout(() => {
      if (formulaInputRef.current) {
        formulaInputRef.current.focus();
        formulaInputRef.current.setSelectionRange(nextPos, nextPos);
      }
    }, 0);
  };

  const handleF4Lock = () => {
    if (!activeTarget) return;
    const pos = formulaInputRef.current?.selectionStart ?? cursorPos;
    const toggled = toggleReferenceLock(activeFormula, pos);
    if (!toggled) return;
    handleCellChange(activeTarget.ref, toggled.nextFormula, toggled.nextCursorPos);
    window.setTimeout(() => {
      if (formulaInputRef.current) {
        formulaInputRef.current.focus();
        formulaInputRef.current.setSelectionRange(
          toggled.nextCursorPos,
          toggled.nextCursorPos
        );
      }
    }, 0);
  };

  const handleInsertFunction = (fnName: string) => {
    if (!activeTarget || !autocompleteCtx.typingFuncPrefix) return;
    const prefixLen = autocompleteCtx.typingFuncPrefix.length;
    const pos = formulaInputRef.current?.selectionStart ?? cursorPos;
    const inserted = `${fnName}(`;
    const nextFormula =
      activeFormula.slice(0, pos - prefixLen) + inserted + activeFormula.slice(pos);
    const nextPos = pos - prefixLen + inserted.length;
    handleCellChange(activeTarget.ref, nextFormula, nextPos);
    window.setTimeout(() => {
      if (formulaInputRef.current) {
        formulaInputRef.current.focus();
        formulaInputRef.current.setSelectionRange(nextPos, nextPos);
      }
    }, 0);
  };

  const handleFormulaKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'F4') {
      e.preventDefault();
      handleF4Lock();
      return;
    }
    if (e.key === 'Tab' && matchingFunctions.length > 0) {
      e.preventDefault();
      handleInsertFunction(matchingFunctions[0].name);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      // Nhảy xuống ô mục tiêu kế tiếp trong cùng cột nếu có
      if (activeTarget) {
        const nextBelow = targetByCoord.get(`${activeTarget.row + 1}:${activeTarget.col}`);
        if (nextBelow) {
          setActiveRef(nextBelow.ref);
          const nextVal = currentInputs[nextBelow.ref] ?? '';
          setCursorPos(nextVal.length);
        }
      }
    }
  };

  const handleCellMouseDown = (rIdx: number, cIdx: number, e: React.MouseEvent) => {
    // Kiểm tra xem đang ở chế độ "chỉ chọn ô/vùng cho công thức" hay không
    const curPos = formulaInputRef.current?.selectionStart ?? cursorPos;
    const target = targetByCoord.get(`${rIdx}:${cIdx}`);

    // Chế độ chạm 2 ô liên tiếp trên điện thoại để chọn vùng (A1:B5)
    if (touchRangeStart && activeTarget && !(target && target.ref === activeTarget.ref)) {
      e.preventDefault();
      if (touchRangeStart.row === -1) {
        const refStr = formatRangeRef(rIdx, cIdx, rIdx, cIdx);
        const nextFormula =
          activeFormula.slice(0, curPos) + refStr + activeFormula.slice(curPos);
        handleCellChange(activeTarget.ref, nextFormula, curPos + refStr.length);
        setTouchRangeStart({
          row: rIdx,
          col: cIdx,
          insertAt: curPos,
          lastLen: refStr.length,
        });
      } else {
        const rangeStr = formatRangeRef(
          touchRangeStart.row,
          touchRangeStart.col,
          rIdx,
          cIdx
        );
        const nextFormula =
          activeFormula.slice(0, touchRangeStart.insertAt) +
          rangeStr +
          activeFormula.slice(touchRangeStart.insertAt + touchRangeStart.lastLen);
        handleCellChange(
          activeTarget.ref,
          nextFormula,
          touchRangeStart.insertAt + rangeStr.length
        );
        setTouchRangeStart(null);
      }
      return;
    }

    if (
      activeTarget &&
      activeFormula.startsWith('=') &&
      canInsertReferenceAtCursor(activeFormula, curPos) &&
      !(target && target.ref === activeTarget.ref)
    ) {
      e.preventDefault(); // Giữ focus cho thao tác chọn vùng
      const refStr = formatRangeRef(rIdx, cIdx, rIdx, cIdx);
      const nextFormula =
        activeFormula.slice(0, curPos) + refStr + activeFormula.slice(curPos);
      handleCellChange(activeTarget.ref, nextFormula, curPos + refStr.length);
      setDragSelect({
        startRow: rIdx,
        startCol: cIdx,
        endRow: rIdx,
        endCol: cIdx,
        insertAt: curPos,
        lastInsertedLen: refStr.length,
      });
      return;
    }

    // Nếu không phải đang chèn tham chiếu -> chọn ô mục tiêu nếu click vào ô mục tiêu
    if (target) {
      setActiveRef(target.ref);
      const val = currentInputs[target.ref] ?? '';
      setCursorPos(val.length);
      window.setTimeout(() => {
        formulaInputRef.current?.focus();
      }, 0);
    }
  };

  const handleCellMouseEnter = (rIdx: number, cIdx: number) => {
    if (dragSelect && activeTarget) {
      const rangeStr = formatRangeRef(
        dragSelect.startRow,
        dragSelect.startCol,
        rIdx,
        cIdx
      );
      const nextFormula =
        activeFormula.slice(0, dragSelect.insertAt) +
        rangeStr +
        activeFormula.slice(dragSelect.insertAt + dragSelect.lastInsertedLen);
      handleCellChange(
        activeTarget.ref,
        nextFormula,
        dragSelect.insertAt + rangeStr.length
      );
      setDragSelect({
        ...dragSelect,
        endRow: rIdx,
        endCol: cIdx,
        lastInsertedLen: rangeStr.length,
      });
    } else if (fillDrag) {
      setFillDrag({
        ...fillDrag,
        currentRow: rIdx,
        currentCol: cIdx,
      });
    }
  };

  const handleCheck = () => {
    const results: Record<string, boolean> = {};
    let allCorrect = true;
    for (const t of lab.targets) {
      const raw = (currentInputs[t.ref] ?? '').trim();
      const val = computedGrid[t.row]?.[t.col];
      const ok = raw.startsWith('=') && valuesMatch(val, t.expectedValue);
      results[t.ref] = ok;
      if (!ok) allCorrect = false;
    }
    setCheckResults(results);
    if (allCorrect) {
      onCompleteLab(lab.id);
    }
  };

  const handleReset = () => {
    setUserInputs((prev) => ({ ...prev, [lab.id]: {} }));
    setCheckResults(null);
    setShowHint(false);
  };

  const handleFillSample = () => {
    const filled: Record<string, string> = {};
    for (const t of lab.targets) {
      filled[t.ref] = t.expectedFormula;
    }
    setUserInputs((prev) => ({ ...prev, [lab.id]: filled }));
    setCheckResults(null);
  };

  const correctCount = checkResults
    ? Object.values(checkResults).filter(Boolean).length
    : 0;

  const getHighlightClass = (rIdx: number, cIdx: number): string => {
    for (const range of highlightedRanges) {
      if (
        rIdx >= range.startRow &&
        rIdx <= range.endRow &&
        cIdx >= range.startCol &&
        cIdx <= range.endCol
      ) {
        return HIGHLIGHT_STYLES[range.colorIndex];
      }
    }
    return '';
  };

  return (
    <div className="flex flex-col xl:flex-row gap-4 items-start">
      {/* Cột 1: Danh sách bài Lab tương tác (có thể thu gọn) */}
      {showLabList ? (
        <div className="w-full xl:w-60 shrink-0 bg-white rounded-2xl border border-slate-200 p-3.5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Bài thực hành ({progress.completedInteractiveLabs.length}/{LABS.length})
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Kéo chọn vùng, F4 khóa $, kéo góc copy công thức.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowLabList(false)}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0"
              title="Thu gọn danh sách bài"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {(
              [
                { id: 'all', label: 'Tất cả' },
                { id: 'exam', label: '5 Đề ảnh' },
                { id: 'lesson', label: 'Bài hàm' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setGroupFilter(f.id)}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                  groupFilter === f.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="space-y-1.5 max-h-[65vh] overflow-y-auto pr-0.5">
            {filteredLabs.map((item) => {
              const active = item.id === lab.id;
              const done = progress.completedInteractiveLabs.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectLab(item.id)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-start gap-2 ${
                    active
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      done ? 'text-emerald-600' : 'text-slate-300'
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                      {item.badge}
                    </div>
                    <div className="leading-snug mt-0.5">{item.title}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="w-full xl:w-12 shrink-0 bg-white rounded-2xl border border-slate-200 p-2 flex xl:flex-col items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setShowLabList(true)}
            className="inline-flex items-center gap-1.5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
            title="Mở rộng danh sách bài"
          >
            <ChevronRight className="w-4 h-4" />
            <span className="text-xs font-semibold xl:hidden">
              Danh sách bài ({progress.completedInteractiveLabs.length}/{LABS.length})
            </span>
          </button>
          <div className="hidden xl:flex flex-col items-center gap-1 py-2 text-slate-500">
            <List className="w-4 h-4" />
            <span className="text-[10px] font-bold">
              {progress.completedInteractiveLabs.length}/{LABS.length}
            </span>
          </div>
        </div>
      )}

      {/* Khu vực làm bài: Ảnh đề bên trái + Sheet thực hành bên phải */}
      <div className="flex-1 min-w-0 w-full flex flex-col lg:flex-row gap-4 items-start">
        {/* Thanh chuyển chế độ xem trên điện thoại (< lg) */}
        {lab.imageUrl && (
          <div className="lg:hidden w-full flex gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs sticky top-14 z-20">
            {(
              [
                { id: 'split', label: 'Đề + Sheet' },
                { id: 'image', label: 'Chỉ Đề bài' },
                { id: 'sheet', label: 'Chỉ Bảng tính' },
              ] as const
            ).map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setMobileView(mode.id)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  mobileView === mode.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        )}

        {/* Cột 2: Ảnh đề bài (bên trái sheet thực hành) */}
        {lab.imageUrl &&
          (showDePane ? (
            <div
              className={`w-full lg:w-[44%] xl:w-[46%] shrink-0 bg-white rounded-2xl border border-slate-200 p-3 space-y-2.5 lg:sticky lg:top-4 ${
                mobileView === 'sheet' ? 'hidden lg:block' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Đề bài mẫu
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDeZoom((z) => Math.max(0.6, +(z - 0.2).toFixed(1)))}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                    title="Thu nhỏ ảnh đề"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeZoom(1)}
                    className="px-1.5 py-1 rounded-lg hover:bg-slate-100 text-[11px] font-semibold text-slate-600 min-w-[42px] text-center"
                    title="Đặt lại 100%"
                  >
                    {Math.round(deZoom * 100)}%
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeZoom((z) => Math.min(2.4, +(z + 0.2).toFixed(1)))}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                    title="Phóng to ảnh đề"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDePane(false)}
                    className="hidden lg:inline-flex p-1.5 ml-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                    title="Thu gọn đề bài"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div
                className={`overflow-auto bg-slate-50 rounded-xl p-2 border border-slate-100 ${
                  mobileView === 'split'
                    ? 'max-h-[34vh] lg:max-h-[75vh]'
                    : 'max-h-[72vh] lg:max-h-[75vh]'
                }`}
              >
                <img
                  src={lab.imageUrl}
                  alt={lab.title}
                  style={{ width: `${deZoom * 100}%`, maxWidth: 'none' }}
                  className="rounded-lg mx-auto block"
                />
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex w-11 shrink-0 bg-white rounded-2xl border border-slate-200 p-2 flex-col items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowDePane(true)}
                className="inline-flex items-center gap-1.5 p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800"
                title="Mở đề bài mẫu"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}

        {/* Cột 3: Bảng tính tương tác HyperFormula */}
        <div
          className={`flex-1 min-w-0 w-full space-y-4 ${
            lab.imageUrl && mobileView === 'image' ? 'hidden lg:block' : ''
          }`}
        >
          <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold mb-1">
                  {lab.badge}
                </span>
                <h2 className="text-lg font-bold text-slate-900">{lab.title}</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{lab.description}</p>
              </div>

              <div className="flex flex-wrap gap-2 shrink-0">
                {lab.theoryPoints && lab.theoryPoints.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowTheory((v) => !v)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                      showTheory
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Lý thuyết trọng tâm
                  </button>
                )}
              </div>
            </div>

          {/* Khối Lý thuyết trọng tâm */}
          {showTheory && lab.theoryPoints && lab.theoryPoints.length > 0 && (
            <div className="bg-indigo-50/60 rounded-xl p-4 border border-indigo-100 space-y-2.5">
              <div className="text-xs font-bold text-indigo-800 uppercase flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Lý thuyết trọng tâm cần nhớ
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {lab.theoryPoints.map((tp, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl p-3 border border-indigo-100 space-y-1"
                  >
                    <div className="text-xs font-bold text-slate-900">{tp.title}</div>
                    <code className="block px-2 py-1 rounded bg-slate-900 text-emerald-300 text-[11px] font-mono overflow-x-auto">
                      {tp.syntax}
                    </code>
                    <p className="text-xs text-slate-600 leading-snug">{tp.explanation}</p>
                    {tp.tip && (
                      <p className="text-[11px] text-amber-700 font-medium">
                        Mẹo: {tp.tip}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hướng dẫn từng câu */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-1">
            <div className="text-xs font-bold text-slate-700 uppercase">Yêu cầu bài tập:</div>
            <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-700 space-y-1">
              {lab.instructions.map((ins, i) => (
                <li key={i}>{ins}</li>
              ))}
            </ul>
          </div>

          {/* Mẹo thao tác nhanh */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600 bg-indigo-50/70 px-3 py-2 rounded-xl border border-indigo-100">
            <span className="inline-flex items-center gap-1 font-semibold text-indigo-700">
              <MousePointerClick className="w-3.5 h-3.5" /> Mẹo thao tác:
            </span>
            <span>Gõ <code className="bg-white px-1 rounded">=</code> rồi <strong>click/kéo chuột</strong> trên bảng để chọn vùng</span>
            <span>• Nhấn <strong>F4</strong> để khóa <code className="bg-white px-1 rounded">$</code></span>
            <span>• Kéo ô vuông góc dưới phải để copy công thức</span>
          </div>

          {/* Thanh Formula Bar + Autocomplete */}
          <div className="relative space-y-1.5">
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center bg-slate-100 p-2 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 w-14 text-center">
                  {activeRef || '--'}
                </span>
                <span className="text-xs font-serif italic font-bold text-emerald-700 px-1">
                  fx
                </span>
              </div>
              <input
                ref={formulaInputRef}
                type="text"
                disabled={!activeTarget}
                value={activeFormula}
                onChange={(e) =>
                  activeTarget &&
                  handleCellChange(
                    activeTarget.ref,
                    e.target.value,
                    e.target.selectionStart ?? e.target.value.length
                  )
                }
                onClick={(e) =>
                  setCursorPos(e.currentTarget.selectionStart ?? activeFormula.length)
                }
                onKeyUp={(e) =>
                  setCursorPos(e.currentTarget.selectionStart ?? activeFormula.length)
                }
                onKeyDown={handleFormulaKeyDown}
                placeholder={
                  activeTarget
                    ? `Nhập công thức cho ô ${activeTarget.ref} (ví dụ: =SUM( và kéo vùng)...`
                    : 'Click vào một ô màu xanh để nhập công thức'
                }
                className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50 disabled:text-slate-400"
              />
              <button
                type="button"
                disabled={!activeTarget || !activeFormula.startsWith('=')}
                onClick={handleF4Lock}
                className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 disabled:opacity-40 shrink-0"
                title="Chuyển đổi địa chỉ tuyệt đối $ (F4)"
              >
                <Lock className="w-3.5 h-3.5 text-indigo-600" /> F4 ($)
              </button>
            </div>

            {/* Thanh chèn ký tự nhanh & chọn vùng chạm 2 ô cho điện thoại */}
            {activeTarget && (
              <div className="flex flex-wrap items-center gap-1.5">
                {['=', '(', ')', ',', ':', '"', '$'].map((tok) => (
                  <button
                    key={tok}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleInsertToken(tok);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 text-xs font-mono font-bold min-w-[32px]"
                  >
                    {tok}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={!activeFormula.startsWith('=')}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setTouchRangeStart((prev) =>
                      prev ? null : { row: -1, col: -1, insertAt: 0, lastLen: 0 }
                    );
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-40 ${
                    touchRangeStart
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                  }`}
                >
                  {touchRangeStart
                    ? touchRangeStart.row === -1
                      ? 'Chạm ô đầu...'
                      : 'Chạm ô cuối...'
                    : 'Chạm 2 ô chọn vùng'}
                </button>
              </div>
            )}

            {/* Dropdown gợi ý tên hàm */}
            {matchingFunctions.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-md p-1.5 flex flex-wrap gap-1.5">
                {matchingFunctions.map((fn) => (
                  <button
                    key={fn.name}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleInsertFunction(fn.name);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs text-left transition-colors"
                  >
                    <span className="font-bold text-emerald-700">{fn.name}</span>
                    <span className="text-slate-400 ml-1.5 hidden sm:inline">
                      — {fn.description}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Thanh hướng dẫn đối số của hàm đang mở */}
            {autocompleteCtx.activeFunc && (
              <div className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-100 text-xs font-mono flex flex-wrap items-center gap-1">
                <span className="font-bold text-emerald-400">
                  {autocompleteCtx.activeFunc.name}(
                </span>
                {autocompleteCtx.activeFunc.args.map((arg, idx) => (
                  <React.Fragment key={arg}>
                    <span
                      className={
                        idx === autocompleteCtx.activeArgIndex
                          ? 'bg-emerald-500/30 text-white font-bold px-1 rounded underline'
                          : 'text-slate-300'
                      }
                    >
                      {arg}
                    </span>
                    {idx < autocompleteCtx.activeFunc!.args.length - 1 && (
                      <span className="text-slate-400">,</span>
                    )}
                  </React.Fragment>
                ))}
                <span className="font-bold text-emerald-400">)</span>
              </div>
            )}
          </div>

          {/* Lưới bảng tính */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="min-w-full text-xs border-collapse select-none">
              <thead>
                <tr className="bg-slate-100 text-slate-600">
                  <th className="w-9 py-1.5 border-b border-r border-slate-200 text-center font-mono">
                    #
                  </th>
                  {lab.colHeaders.map((col) => (
                    <th
                      key={col}
                      className="px-2 sm:px-2.5 py-1.5 border-b border-r border-slate-200 text-center font-semibold min-w-[72px] sm:min-w-[92px]"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lab.rows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    <td className="py-1.5 border-b border-r border-slate-200 bg-slate-50 text-slate-400 text-center font-mono">
                      {rIdx + 1}
                    </td>
                    {row.map((cell, cIdx) => {
                      const target = targetByCoord.get(`${rIdx}:${cIdx}`);
                      const val = computedGrid[rIdx]?.[cIdx];
                      const refHighlight = getHighlightClass(rIdx, cIdx);

                      // Khung preview khi kéo Fill Handle
                      const inFillPreview =
                        fillDrag &&
                        cIdx === fillDrag.sourceCol &&
                        rIdx >= Math.min(fillDrag.sourceRow, fillDrag.currentRow) &&
                        rIdx <= Math.max(fillDrag.sourceRow, fillDrag.currentRow);

                      if (!target) {
                        return (
                          <td
                            key={cIdx}
                            onMouseDown={(e) => handleCellMouseDown(rIdx, cIdx, e)}
                            onMouseEnter={() => handleCellMouseEnter(rIdx, cIdx)}
                            className={`px-2.5 py-1.5 border-b border-r border-slate-200 whitespace-nowrap cursor-cell ${
                              refHighlight
                                ? refHighlight
                                : rIdx === 0
                                ? 'bg-slate-50 font-semibold text-slate-800'
                                : 'bg-white text-slate-700'
                            }`}
                          >
                            {formatDisplayValue(cell)}
                          </td>
                        );
                      }

                      const isActive = activeRef === target.ref;
                      const status = checkResults?.[target.ref];
                      let cellStyle =
                        'bg-emerald-50/70 hover:bg-emerald-50 text-slate-900';
                      if (status === true) {
                        cellStyle = 'bg-emerald-100 text-emerald-900 font-semibold';
                      } else if (status === false) {
                        cellStyle = 'bg-rose-100 text-rose-900 font-semibold';
                      }
                      if (refHighlight && !isActive) {
                        cellStyle = refHighlight;
                      }
                      if (inFillPreview) {
                        cellStyle += ' outline-dashed outline-2 outline-emerald-600';
                      }
                      if (isActive) {
                        cellStyle += ' ring-2 ring-inset ring-emerald-600';
                      }

                      return (
                        <td
                          key={cIdx}
                          onMouseDown={(e) => handleCellMouseDown(rIdx, cIdx, e)}
                          onMouseEnter={() => handleCellMouseEnter(rIdx, cIdx)}
                          className={`relative p-0 border-b border-r border-slate-200 cursor-pointer transition-colors ${cellStyle}`}
                        >
                          <div className="px-2.5 py-1.5 min-h-[28px] flex items-center justify-between gap-1 font-mono">
                            <span>{formatDisplayValue(val)}</span>
                            {status === true && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            )}
                            {status === false && (
                              <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            )}
                          </div>

                          {/* Fill Handle ở góc dưới phải ô đang chọn */}
                          {isActive && activeFormula.startsWith('=') && (
                            <div
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setFillDrag({
                                  sourceRow: rIdx,
                                  sourceCol: cIdx,
                                  sourceFormula: activeFormula,
                                  currentRow: rIdx,
                                  currentCol: cIdx,
                                });
                              }}
                              title="Kéo xuống các ô bên dưới để sao chép công thức"
                              className="w-2.5 h-2.5 bg-emerald-600 border border-white absolute -bottom-1 -right-1 cursor-crosshair z-10"
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Gợi ý & Hành động */}
          {showHint && activeTarget && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-2">
              <div>
                Gợi ý cho ô <strong>{activeTarget.ref}</strong>:{' '}
                <code className="px-1.5 py-0.5 rounded bg-white border border-amber-200 font-mono">
                  {activeTarget.hint}
                </code>
              </div>
              <button
                onClick={() =>
                  handleCellChange(
                    activeTarget.ref,
                    activeTarget.expectedFormula,
                    activeTarget.expectedFormula.length
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700 shrink-0"
              >
                Áp dụng
              </button>
            </div>
          )}

          {checkResults && (
            <div
              className={`p-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 ${
                correctCount === lab.targets.length
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {correctCount === lab.targets.length ? (
                <>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    Xuất sắc! Bạn đã hoàn thành đúng {correctCount}/{lab.targets.length} ô công
                    thức.
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>
                    Đúng {correctCount}/{lab.targets.length} ô. Lưu ý mọi ô cần bắt đầu bằng dấu
                    &quot;=&quot; và đúng vùng tham chiếu.
                  </span>
                </>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleCheck}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-colors"
              >
                <Play className="w-4 h-4" /> Kiểm tra kết quả
              </button>
              <button
                onClick={() => setShowHint((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs sm:text-sm font-semibold transition-colors"
              >
                <HelpCircle className="w-4 h-4" /> Gợi ý ô {activeRef || ''}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleFillSample}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" /> Điền đáp án mẫu
              </button>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Làm lại
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
