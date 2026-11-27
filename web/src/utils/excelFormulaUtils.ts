export interface CellCoord {
  row: number;
  col: number;
}

export interface HighlightRange {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  colorIndex: number;
}

export interface ExcelFunctionDoc {
  name: string;
  signature: string;
  args: string[];
  description: string;
}

export const EXCEL_FUNCTIONS_DOCS: ExcelFunctionDoc[] = [
  {
    name: 'SUM',
    signature: 'SUM(number1, [number2], ...)',
    args: ['number1', '[number2], ...'],
    description: 'Tính tổng các giá trị số trong vùng chọn.',
  },
  {
    name: 'SUMIF',
    signature: 'SUMIF(range, criteria, [sum_range])',
    args: ['range (vùng điều kiện)', 'criteria (điều kiện)', '[sum_range] (vùng tính tổng)'],
    description: 'Tính tổng các ô thỏa mãn một điều kiện cho trước.',
  },
  {
    name: 'SUMIFS',
    signature: 'SUMIFS(sum_range, criteria_range1, criteria1, ...)',
    args: ['sum_range (vùng tính tổng)', 'criteria_range1 (vùng ĐK 1)', 'criteria1 (ĐK 1)'],
    description: 'Tính tổng các ô thỏa mãn nhiều điều kiện.',
  },
  {
    name: 'AVERAGE',
    signature: 'AVERAGE(number1, [number2], ...)',
    args: ['number1', '[number2], ...'],
    description: 'Tính trung bình cộng của các số.',
  },
  {
    name: 'AVERAGEIF',
    signature: 'AVERAGEIF(range, criteria, [average_range])',
    args: ['range (vùng điều kiện)', 'criteria (điều kiện)', '[average_range] (vùng tính TB)'],
    description: 'Tính trung bình các ô thỏa mãn một điều kiện.',
  },
  {
    name: 'AVERAGEIFS',
    signature: 'AVERAGEIFS(average_range, criteria_range1, criteria1, ...)',
    args: ['average_range (vùng tính TB)', 'criteria_range1 (vùng ĐK 1)', 'criteria1 (ĐK 1)'],
    description: 'Tính trung bình các ô thỏa mãn nhiều điều kiện.',
  },
  {
    name: 'MAX',
    signature: 'MAX(number1, [number2], ...)',
    args: ['number1', '[number2], ...'],
    description: 'Tìm giá trị lớn nhất trong vùng dữ liệu.',
  },
  {
    name: 'MAXIFS',
    signature: 'MAXIFS(max_range, criteria_range1, criteria1, ...)',
    args: ['max_range (vùng lấy MAX)', 'criteria_range1 (vùng ĐK 1)', 'criteria1 (ĐK 1)'],
    description: 'Tìm giá trị lớn nhất thỏa mãn một hoặc nhiều điều kiện.',
  },
  {
    name: 'MIN',
    signature: 'MIN(number1, [number2], ...)',
    args: ['number1', '[number2], ...'],
    description: 'Tìm giá trị nhỏ nhất trong vùng dữ liệu.',
  },
  {
    name: 'MINIFS',
    signature: 'MINIFS(min_range, criteria_range1, criteria1, ...)',
    args: ['min_range (vùng lấy MIN)', 'criteria_range1 (vùng ĐK 1)', 'criteria1 (ĐK 1)'],
    description: 'Tìm giá trị nhỏ nhất thỏa mãn một hoặc nhiều điều kiện.',
  },
  {
    name: 'COUNT',
    signature: 'COUNT(value1, [value2], ...)',
    args: ['value1', '[value2], ...'],
    description: 'Đếm số lượng ô chứa giá trị số.',
  },
  {
    name: 'COUNTA',
    signature: 'COUNTA(value1, [value2], ...)',
    args: ['value1', '[value2], ...'],
    description: 'Đếm số lượng ô không rỗng (cả chữ và số).',
  },
  {
    name: 'COUNTBLANK',
    signature: 'COUNTBLANK(range)',
    args: ['range (vùng cần đếm)'],
    description: 'Đếm số ô trống trong vùng.',
  },
  {
    name: 'COUNTIF',
    signature: 'COUNTIF(range, criteria)',
    args: ['range (vùng điều kiện)', 'criteria (điều kiện)'],
    description: 'Đếm số ô thỏa mãn một điều kiện.',
  },
  {
    name: 'COUNTIFS',
    signature: 'COUNTIFS(criteria_range1, criteria1, ...)',
    args: ['criteria_range1', 'criteria1'],
    description: 'Đếm số ô thỏa mãn nhiều điều kiện.',
  },
  {
    name: 'IF',
    signature: 'IF(logical_test, value_if_true, [value_if_false])',
    args: ['logical_test (biểu thức ĐK)', 'value_if_true (giá trị đúng)', '[value_if_false] (giá trị sai)'],
    description: 'Kiểm tra điều kiện và trả về giá trị tương ứng.',
  },
  {
    name: 'AND',
    signature: 'AND(logical1, [logical2], ...)',
    args: ['logical1', '[logical2], ...'],
    description: 'Trả về TRUE nếu tất cả các điều kiện đều đúng.',
  },
  {
    name: 'OR',
    signature: 'OR(logical1, [logical2], ...)',
    args: ['logical1', '[logical2], ...'],
    description: 'Trả về TRUE nếu có ít nhất một điều kiện đúng.',
  },
  {
    name: 'LEFT',
    signature: 'LEFT(text, [num_chars])',
    args: ['text (chuỗi)', '[num_chars] (số ký tự bên trái)'],
    description: 'Trích xuất ký tự từ bên trái chuỗi.',
  },
  {
    name: 'RIGHT',
    signature: 'RIGHT(text, [num_chars])',
    args: ['text (chuỗi)', '[num_chars] (số ký tự bên phải)'],
    description: 'Trích xuất ký tự từ bên phải chuỗi.',
  },
  {
    name: 'MID',
    signature: 'MID(text, start_num, num_chars)',
    args: ['text (chuỗi)', 'start_num (vị trí bắt đầu)', 'num_chars (số ký tự)'],
    description: 'Trích xuất ký tự từ giữa chuỗi.',
  },
  {
    name: 'VALUE',
    signature: 'VALUE(text)',
    args: ['text (chuỗi số)'],
    description: 'Chuyển đổi chuỗi ký tự số thành giá trị số.',
  },
  {
    name: 'VLOOKUP',
    signature: 'VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])',
    args: [
      'lookup_value (giá trị dò)',
      'table_array (bảng dò, nên F4)',
      'col_index_num (cột lấy)',
      '[range_lookup] (0: chính xác)',
    ],
    description: 'Tìm kiếm theo cột dọc trong bảng phụ.',
  },
  {
    name: 'HLOOKUP',
    signature: 'HLOOKUP(lookup_value, table_array, row_index_num, [range_lookup])',
    args: [
      'lookup_value (giá trị dò)',
      'table_array (bảng dò, nên F4)',
      'row_index_num (hàng lấy)',
      '[range_lookup] (0: chính xác)',
    ],
    description: 'Tìm kiếm theo hàng ngang trong bảng phụ.',
  },
  {
    name: 'INDEX',
    signature: 'INDEX(array, row_num, [column_num])',
    args: ['array (vùng dữ liệu)', 'row_num (số dòng)', '[column_num] (số cột)'],
    description: 'Trả về giá trị tại giao điểm dòng và cột trong vùng.',
  },
  {
    name: 'MATCH',
    signature: 'MATCH(lookup_value, lookup_array, [match_type])',
    args: ['lookup_value', 'lookup_array', '[match_type] (0: chính xác)'],
    description: 'Tìm vị trí của giá trị trong hàng hoặc cột.',
  },
  {
    name: 'ROUND',
    signature: 'ROUND(number, num_digits)',
    args: ['number (số)', 'num_digits (số chữ số làm tròn)'],
    description: 'Làm tròn số đến số chữ số chỉ định.',
  },
  {
    name: 'INT',
    signature: 'INT(number)',
    args: ['number (số thập phân)'],
    description: 'Làm tròn xuống số nguyên gần nhất.',
  },
  {
    name: 'MOD',
    signature: 'MOD(number, divisor)',
    args: ['number (số bị chia)', 'divisor (số chia)'],
    description: 'Trả về phần dư của phép chia.',
  },
  {
    name: 'IFERROR',
    signature: 'IFERROR(value, value_if_error)',
    args: ['value (giá trị hoặc công thức)', 'value_if_error (kết quả nếu lỗi)'],
    description: 'Bắt lỗi công thức và trả về giá trị thay thế nếu có lỗi.',
  },
  {
    name: 'RANK',
    signature: 'RANK(number, ref, [order])',
    args: ['number (số cần xếp hạng)', 'ref (danh sách số)', '[order] (0: giảm dần, 1: tăng dần)'],
    description: 'Xếp hạng của một số trong danh sách.',
  },
  {
    name: 'LEN',
    signature: 'LEN(text)',
    args: ['text (chuỗi văn bản)'],
    description: 'Độ dài (số lượng ký tự) của chuỗi.',
  },
  {
    name: 'TRIM',
    signature: 'TRIM(text)',
    args: ['text (chuỗi văn bản)'],
    description: 'Xóa khoảng trắng thừa ở đầu, cuối và giữa các từ.',
  },
  {
    name: 'CONCAT',
    signature: 'CONCAT(text1, [text2], ...)',
    args: ['text1', '[text2], ...'],
    description: 'Nối hai hay nhiều chuỗi văn bản lại với nhau.',
  },
  {
    name: 'DAY',
    signature: 'DAY(serial_number)',
    args: ['serial_number (ngày tháng)'],
    description: 'Lấy ngày (1-31) từ giá trị ngày tháng.',
  },
  {
    name: 'MONTH',
    signature: 'MONTH(serial_number)',
    args: ['serial_number (ngày tháng)'],
    description: 'Lấy tháng (1-12) từ giá trị ngày tháng.',
  },
  {
    name: 'YEAR',
    signature: 'YEAR(serial_number)',
    args: ['serial_number (ngày tháng)'],
    description: 'Lấy năm từ giá trị ngày tháng.',
  },
  {
    name: 'DATE',
    signature: 'DATE(year, month, day)',
    args: ['year (năm)', 'month (tháng)', 'day (ngày)'],
    description: 'Tạo giá trị ngày tháng hợp lệ từ năm, tháng, ngày.',
  },
  {
    name: 'TODAY',
    signature: 'TODAY()',
    args: [],
    description: 'Trả về ngày hiện tại của hệ thống.',
  },
  {
    name: 'NOW',
    signature: 'NOW()',
    args: [],
    description: 'Trả về ngày và giờ hiện tại của hệ thống.',
  },
];

/** Chuyển chỉ số cột (0 -> A, 1 -> B...) */
export function colIndexToLetter(col: number): string {
  let result = '';
  let n = col + 1;
  while (n > 0) {
    const rem = (n - 1) % 26;
    result = String.fromCharCode(65 + rem) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
}

/** Chuyển tên cột (A -> 0, B -> 1...) */
export function colLetterToIndex(letters: string): number {
  let col = 0;
  const upper = letters.toUpperCase();
  for (let i = 0; i < upper.length; i++) {
    col = col * 26 + (upper.charCodeAt(i) - 64);
  }
  return col - 1;
}

export function coordToRef(row: number, col: number): string {
  return `${colIndexToLetter(col)}${row + 1}`;
}

export function refToCoord(ref: string): CellCoord | null {
  const m = /^\$?([A-Z]+)\$?(\d+)$/i.exec(ref.trim());
  if (!m) return null;
  return {
    col: colLetterToIndex(m[1]),
    row: parseInt(m[2], 10) - 1,
  };
}

export function formatRangeRef(r1: number, c1: number, r2: number, c2: number): string {
  const top = Math.min(r1, r2);
  const bottom = Math.max(r1, r2);
  const left = Math.min(c1, c2);
  const right = Math.max(c1, c2);
  if (top === bottom && left === right) {
    return coordToRef(top, left);
  }
  return `${coordToRef(top, left)}:${coordToRef(bottom, right)}`;
}

/** Xóa phần nằm trong dấu ngoặc kép để tránh nhận nhầm chuỗi text là tham chiếu ô */
function maskStringLiterals(formula: string): string {
  return formula.replace(/"[^"]*"/g, (m) => ' '.repeat(m.length));
}

/** Trích xuất các ô/vùng đang được tham chiếu trong công thức để tô màu highlight */
export function parseFormulaReferences(formula: string): HighlightRange[] {
  if (!formula.startsWith('=')) return [];
  const masked = maskStringLiterals(formula);
  const regex = /(\$?[A-Z]{1,3}\$?\d+)(?::(\$?[A-Z]{1,3}\$?\d+))?/gi;
  const ranges: HighlightRange[] = [];
  let match: RegExpExecArray | null;
  let colorIndex = 0;

  while ((match = regex.exec(masked)) !== null) {
    const start = refToCoord(match[1]);
    const end = match[2] ? refToCoord(match[2]) : start;
    if (start && end) {
      ranges.push({
        startRow: Math.min(start.row, end.row),
        startCol: Math.min(start.col, end.col),
        endRow: Math.max(start.row, end.row),
        endCol: Math.max(start.col, end.col),
        colorIndex: colorIndex % 4,
      });
      colorIndex++;
    }
  }
  return ranges;
}

/** Xoay vòng trạng thái dấu $ cho 1 tham chiếu ô đơn lẻ (A1 -> $A$1 -> A$1 -> $A1 -> A1) */
function cycleSingleRefLock(singleRef: string): string {
  const m = /^(\$?)([A-Z]+)(\$?)(\d+)$/i.exec(singleRef);
  if (!m) return singleRef;
  const [, colLock, col, rowLock, row] = m;
  const colUpper = col.toUpperCase();
  if (!colLock && !rowLock) return `$${colUpper}$${row}`;
  if (colLock && rowLock) return `${colUpper}$${row}`;
  if (!colLock && rowLock) return `$${colUpper}${row}`;
  return `${colUpper}${row}`;
}

/** Xử lý phím F4: tìm tham chiếu ô hoặc vùng tại vị trí con trỏ và xoay vòng khóa $ */
export function toggleReferenceLock(
  formula: string,
  cursorPos: number
): { nextFormula: string; nextCursorPos: number } | null {
  if (!formula.startsWith('=')) return null;
  const masked = maskStringLiterals(formula);
  const regex = /(\$?[A-Z]{1,3}\$?\d+)(?::(\$?[A-Z]{1,3}\$?\d+))?/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(masked)) !== null) {
    const start = match.index;
    const end = start + match[0].length;
    if (cursorPos >= start && cursorPos <= end) {
      const part1 = cycleSingleRefLock(match[1]);
      const replaced = match[2] ? `${part1}:${cycleSingleRefLock(match[2])}` : part1;
      const nextFormula = formula.slice(0, start) + replaced + formula.slice(end);
      return { nextFormula, nextCursorPos: start + replaced.length };
    }
  }
  return null;
}

/** Dịch chuyển tham chiếu ô/vùng khi kéo Fill Handle (giữ nguyên phần có $) */
export function shiftFormulaReferences(
  formula: string,
  deltaRow: number,
  deltaCol: number
): string {
  if (!formula.startsWith('=')) return formula;

  // Tách các đoạn chuỗi "..." để không dịch chuyển nội dung text
  const parts = formula.split(/("[^"]*")/g);
  return parts
    .map((part, idx) => {
      if (idx % 2 === 1) return part; // trong dấu ngoặc kép
      return part.replace(/(\$?)([A-Z]{1,3})(\$?)(\d+)/gi, (_m, cLock, colStr, rLock, rowStr) => {
        const origCol = colLetterToIndex(colStr);
        const origRow = parseInt(rowStr, 10) - 1;
        const newCol = cLock ? origCol : Math.max(0, origCol + deltaCol);
        const newRow = rLock ? origRow : Math.max(0, origRow + deltaRow);
        return `${cLock}${colIndexToLetter(newCol)}${rLock}${newRow + 1}`;
      });
    })
    .join('');
}

/** Kiểm tra xem vị trí con trỏ trong công thức có thể chèn tham chiếu ô/vùng khi click lưới không */
export function canInsertReferenceAtCursor(formula: string, cursorPos: number): boolean {
  if (!formula.startsWith('=')) return false;
  const before = formula.slice(0, cursorPos).trimEnd();
  if (!before) return false;
  const lastChar = before[before.length - 1];
  return ['=', '(', ',', ';', '+', '-', '*', '/', '&', '<', '>'].includes(lastChar);
}

/** Phân tích ngữ cảnh gợi ý hàm & thanh hướng dẫn đối số */
export function getFormulaAutocompleteContext(formula: string, cursorPos: number): {
  typingFuncPrefix: string | null;
  activeFunc: ExcelFunctionDoc | null;
  activeArgIndex: number;
} {
  if (!formula.startsWith('=')) {
    return { typingFuncPrefix: null, activeFunc: null, activeArgIndex: 0 };
  }
  const before = formula.slice(0, cursorPos);

  // 1. Kiểm tra có đang gõ tên hàm ở cuối (ví dụ =VLO hoặc =IF(AND)
  const prefixMatch = /(?:^|[=(,;+\-*/&<>])([A-Za-z]{1,12})$/.exec(before);
  const typingFuncPrefix = prefixMatch ? prefixMatch[1].toUpperCase() : null;

  // 2. Tìm hàm đang mở ngoặc gần nhất chưa đóng
  let depth = 0;
  let commaCount = 0;
  let activeFunc: ExcelFunctionDoc | null = null;
  let inQuotes = false;

  for (let i = before.length - 1; i >= 0; i--) {
    const ch = before[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (inQuotes) continue;

    if (ch === ')') {
      depth++;
    } else if (ch === '(') {
      if (depth === 0) {
        const fnMatch = /([A-Za-z]+)$/.exec(before.slice(0, i));
        if (fnMatch) {
          const fnName = fnMatch[1].toUpperCase();
          activeFunc = EXCEL_FUNCTIONS_DOCS.find((d) => d.name === fnName) ?? null;
        }
        break;
      }
      depth--;
    } else if ((ch === ',' || ch === ';') && depth === 0) {
      commaCount++;
    }
  }

  return {
    typingFuncPrefix,
    activeFunc,
    activeArgIndex: commaCount,
  };
}

