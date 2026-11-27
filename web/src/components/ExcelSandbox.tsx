import React, { useEffect, useMemo, useRef, useState } from 'react';
import { HyperFormula } from 'hyperformula';
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
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
  const [showTheory, setShowTheory] = useState(true);
  // Tráº¡ng thÃ¡i cá»™t Ä‘á» bÃ i (trÃ¡i): hiá»‡n/áº©n & zoom
  const [showDePane, setShowDePane] = useState(true);
  const [deZoom, setDeZoom] = useState(1);

  // Tráº¡ng thÃ¡i kÃ©o chá»n vÃ¹ng tham chiáº¿u
  const [dragSelect, setDragSelect] = useState<{
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
    insertAt: number;
    lastInsertedLen: number;
  } | null>(null);

  // Tráº¡ng thÃ¡i kÃ©o Fill Handle sao chÃ©p cÃ´ng thá»©c
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

  // Highlight cÃ¡c Ã´/vÃ¹ng Ä‘ang Ä‘Æ°á»£c tham chiáº¿u trong cÃ´ng thá»©c hiá»‡n táº¡i
  const highlightedRanges = useMemo(
    () => parseFormulaReferences(activeFormula),
    [activeFormula]
  );

  // Gá»£i Ã½ hÃ m & thanh tham sá»‘
  const autocompleteCtx = useMemo(
    () => getFormulaAutocompleteContext(activeFormula, cursorPos),
    [activeFormula, cursorPos]
  );

  const matchingFunctions = useMemo(() => {
    if (!autocompleteCtx.typingFuncPrefix) return [];
    const p = autocompleteCtx.typingFuncPrefix;
    return EXCEL_FUNCTIONS_DOCS.filter((f) => f.name.startsWith(p)).slice(0, 6);
  }, [autocompleteCtx.typingFuncPrefix]);

  // TÃ­nh toÃ¡n toÃ n bá»™ báº£ng tÃ­nh báº±ng HyperFormula
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

  // Káº¿t thÃºc kÃ©o chuá»™t toÃ n cá»¥c
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
    // Reset zoom Ä‘á» khi Ä‘á»•i bÃ i
    setDeZoom(1);
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
      // Nháº£y xuá»‘ng Ã´ má»¥c tiÃªu káº¿ tiáº¿p trong cÃ¹ng cá»™t náº¿u cÃ³
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
    // Kiá»ƒm tra xem Ä‘ang á»Ÿ cháº¿ Ä‘á»™ "chá»‰ chá»n Ã´/vÃ¹ng cho cÃ´ng thá»©c" hay khÃ´ng
    const curPos = formulaInputRef.current?.selectionStart ?? cursorPos;
    const target = targetByCoord.get(`${rIdx}:${cIdx}`);

    if (
      activeTarget &&
      activeFormula.startsWith('=') &&
      canInsertReferenceAtCursor(activeFormula, curPos) &&
      !(target && target.ref === activeTarget.ref)
    ) {
      e.preventDefault(); // Giá»¯ focus cho thao tÃ¡c chá»n vÃ¹ng
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

    // Náº¿u khÃ´ng pháº£i Ä‘ang chÃ¨n tham chiáº¿u -> chá»n Ã´ má»¥c tiÃªu náº¿u click vÃ o Ã´ má»¥c tiÃªu
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
    /* Layout tá»•ng: flex row â€” [danh sÃ¡ch bÃ i] | [áº£nh Ä‘á»] | [sheet thá»±c hÃ nh] */
    <div className="flex gap-4 h-full min-h-0">

      {/* â•â•â• Cá»˜T 1: Danh sÃ¡ch bÃ i Lab â•â•â• */}
      <div className="w-56 shrink-0 bg-white rounded-2xl border border-slate-200 p-4 space-y-4 h-fit">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">
            Thá»±c hÃ nh cÃ´ng thá»©c ({progress.completedInteractiveLabs.length}/{LABS.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Há»— trá»£ kÃ©o chá»n vÃ¹ng, F4 cá»‘ Ä‘á»‹nh $, kÃ©o gÃ³c copy cÃ´ng thá»©c.
          </p>
        </div>

        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {(
            [
              { id: 'all', label: 'Táº¥t cáº£' },
              { id: 'exam', label: '5 Äá»' },
              { id: 'lesson', label: 'HÃ m' },
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

        <div className="space-y-1.5">
          {filteredLabs.map((item) => {
            const active = item.id === lab.id;
            const done = progress.completedInteractiveLabs.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleSelectLab(item.id)}
                className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
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
                  <div className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                    {item.badge}
                  </div>
                  <div className="leading-snug mt-0.5">{item.title}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* â•â•â• Cá»˜T 2: áº¢nh Ä‘á» bÃ i (cÃ³ thá»ƒ thu gá»n) â•â•â• */}
      {lab.imageUrl && (
        <div
          className={`shrink-0 flex flex-col transition-all duration-200 ${
            showDePane ? 'w-80' : 'w-10'
          }`}
        >
          {/* Header cá»™t Ä‘á» */}
          <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 px-3 py-2 mb-2">
            {showDePane && (
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex-1">
                Äá» bÃ i
              </span>
            )}
            {showDePane && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setDeZoom((z) => Math.max(0.5, +(z - 0.2).toFixed(1)))}
                  className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                  title="Thu nhá»"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-semibold text-slate-600 w-10 text-center">
                  {Math.round(deZoom * 100)}%
                </span>
                <button
                  onClick={() => setDeZoom((z) => Math.min(2.5, +(z + 0.2).toFixed(1)))}
                  className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                  title="PhÃ³ng to"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {/* NÃºt Ä‘Ã³ng/má»Ÿ cá»™t Ä‘á» */}
            <button
              onClick={() => setShowDePane((v) => !v)}
              className="p-1 ml-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
              title={showDePane ? 'Thu gá»n Ä‘á» bÃ i' : 'Má»Ÿ rá»™ng Ä‘á» bÃ i'}
            >
              {showDePane ? (
                <ChevronLeft className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* áº¢nh Ä‘á» */}
          {showDePane && (
            <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-3 overflow-auto max-h-[calc(100vh-200px)]">
              <img
                src={lab.imageUrl}
                alt={lab.title}
                style={{ width: `${deZoom * 100}%`, maxWidth: 'none' }}
                className="rounded-lg mx-auto block transition-all"
              />
            </div>
          )}
        </div>
      )}

      {/* â•â•â• Cá»˜T 3: Sheet thá»±c hÃ nh â•â•â• */}
      <div className="flex-1 min-w-0 space-y-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
          {/* TiÃªu Ä‘á» bÃ i + toggle lÃ½ thuyáº¿t */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold mb-1">
                {lab.badge}
              </span>
              <h2 className="text-lg font-bold text-slate-900">{lab.title}</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{lab.description}</p>
            </div>

            {lab.theoryPoints && lab.theoryPoints.length > 0 && (
              <button
                type="button"
                onClick={() => setShowTheory((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors shrink-0 ${
                  showTheory
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> LÃ½ thuyáº¿t trá»ng tÃ¢m
              </button>
            )}
          </div>

          {/* Khá»‘i LÃ½ thuyáº¿t trá»ng tÃ¢m */}
          {showTheory && lab.theoryPoints && lab.theoryPoints.length > 0 && (
            <div className="bg-indigo-50/60 rounded-xl p-4 border border-indigo-100 space-y-2.5">
              <div className="text-xs font-bold text-indigo-800 uppercase flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> LÃ½ thuyáº¿t trá»ng tÃ¢m cáº§n nhá»›
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
                        Máº¹o: {tp.tip}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HÆ°á»›ng dáº«n tá»«ng cÃ¢u */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-1">
            <div className="text-xs font-bold text-slate-700 uppercase">YÃªu cáº§u bÃ i táº­p:</div>
            <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-700 space-y-1">
              {lab.instructions.map((ins, i) => (
                <li key={i}>{ins}</li>
              ))}
            </ul>
          </div>

          {/* Máº¹o thao tÃ¡c nhanh */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600 bg-indigo-50/70 px-3 py-2 rounded-xl border border-indigo-100">
            <span className="inline-flex items-center gap-1 font-semibold text-indigo-700">
              <MousePointerClick className="w-3.5 h-3.5" /> Máº¹o thao tÃ¡c:
            </span>
            <span>GÃµ <code className="bg-white px-1 rounded">=</code> rá»“i <strong>click/kÃ©o chuá»™t</strong> trÃªn báº£ng Ä‘á»ƒ chá»n vÃ¹ng</span>
            <span>â€¢ Nháº¥n <strong>F4</strong> Ä‘á»ƒ khÃ³a <code className="bg-white px-1 rounded">$</code></span>
            <span>â€¢ KÃ©o Ã´ vuÃ´ng gÃ³c dÆ°á»›i pháº£i Ä‘á»ƒ copy cÃ´ng thá»©c</span>
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
                    ? `Nháº­p cÃ´ng thá»©c cho Ã´ ${activeTarget.ref} (vÃ­ dá»¥: =SUM( vÃ  kÃ©o vÃ¹ng)...`
                    : 'Click vÃ o má»™t Ã´ mÃ u xanh Ä‘á»ƒ nháº­p cÃ´ng thá»©c'
                }
                className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50 disabled:text-slate-400"
              />
              <button
                type="button"
                disabled={!activeTarget || !activeFormula.startsWith('=')}
                onClick={handleF4Lock}
                className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 disabled:opacity-40 shrink-0"
                title="Chuyá»ƒn Ä‘á»•i Ä‘á»‹a chá»‰ tuyá»‡t Ä‘á»‘i $ (F4)"
              >
                <Lock className="w-3.5 h-3.5 text-indigo-600" /> F4 ($)
              </button>
            </div>

            {/* Dropdown gá»£i Ã½ tÃªn hÃ m */}
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
                      â€” {fn.description}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Thanh hÆ°á»›ng dáº«n Ä‘á»‘i sá»‘ cá»§a hÃ m Ä‘ang má»Ÿ */}
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

          {/* LÆ°á»›i báº£ng tÃ­nh */}
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
                      className="px-2.5 py-1.5 border-b border-r border-slate-200 text-center font-semibold min-w-[92px]"
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

                          {/* Fill Handle á»Ÿ gÃ³c dÆ°á»›i pháº£i Ã´ Ä‘ang chá»n */}
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
                              title="KÃ©o xuá»‘ng cÃ¡c Ã´ bÃªn dÆ°á»›i Ä‘á»ƒ sao chÃ©p cÃ´ng thá»©c"
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

          {/* Gá»£i Ã½ & HÃ nh Ä‘á»™ng */}
          {showHint && activeTarget && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-2">
              <div>
                Gá»£i Ã½ cho Ã´ <strong>{activeTarget.ref}</strong>:{' '}
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
                Ãp dá»¥ng
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
                    Xuáº¥t sáº¯c! Báº¡n Ä‘Ã£ hoÃ n thÃ nh Ä‘Ãºng {correctCount}/{lab.targets.length} Ã´ cÃ´ng
                    thá»©c.
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>
                    ÄÃºng {correctCount}/{lab.targets.length} Ã´. LÆ°u Ã½ má»i Ã´ cáº§n báº¯t Ä‘áº§u báº±ng dáº¥u
                    &quot;=&quot; vÃ  Ä‘Ãºng vÃ¹ng tham chiáº¿u.
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
                <Play className="w-4 h-4" /> Kiá»ƒm tra káº¿t quáº£
              </button>
              <button
                onClick={() => setShowHint((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs sm:text-sm font-semibold transition-colors"
              >
                <HelpCircle className="w-4 h-4" /> Gá»£i Ã½ Ã´ {activeRef || ''}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleFillSample}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" /> Äiá»n Ä‘Ã¡p Ã¡n máº«u
              </button>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> LÃ m láº¡i
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
