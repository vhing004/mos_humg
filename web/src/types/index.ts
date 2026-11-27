export type ModuleCategory = 'word' | 'excel' | 'ppt' | 'foundation';

export interface QuizQuestion {
  number: number;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface QuizModuleMeta {
  id: string;
  code: string;
  title: string;
  category: ModuleCategory;
  description: string;
  questionCount: number;
}

export interface QuizModuleData extends Omit<QuizModuleMeta, 'questionCount'> {
  questions: QuizQuestion[];
}

export interface ExcelSheetPreview {
  name: string;
  rows: string[][];
}

export interface ExcelLessonFile {
  name: string;
  url: string;
  ext: string;
  size: number;
  kind: 'lecture' | 'exercise' | 'image';
  sheets: ExcelSheetPreview[];
}

export interface ExcelLesson {
  id: string;
  number: number;
  folderName: string;
  title: string;
  description: string;
  files: ExcelLessonFile[];
}

export interface PracticeLab {
  id: string;
  subject: 'word' | 'excel' | 'ppt' | 'test';
  title: string;
  description: string;
  images: string[];
  tasks: string[];
}

export interface MockExamRecord {
  id: string;
  title: string;
  moduleId: string;
  score: number;
  total: number;
  durationSeconds: number;
  createdAt: string;
}

export interface ExcelTargetCell {
  row: number;
  col: number;
  ref: string;
  expectedFormula: string;
  expectedValue: string | number;
  hint: string;
}

export interface ExcelTheoryPoint {
  title: string;
  syntax: string;
  explanation: string;
  tip?: string;
}

export interface ExcelInteractiveLab {
  id: string;
  group: 'lesson' | 'exam';
  badge: string;
  title: string;
  description: string;
  imageUrl?: string;
  theoryPoints?: ExcelTheoryPoint[];
  instructions: string[];
  colHeaders: string[];
  rows: (string | number | null)[][];
  targets: ExcelTargetCell[];
}

export interface LearningProgress {
  /** Lưu câu trả lời của người dùng theo key `${moduleId}:${questionNumber}` -> true (đúng) / false (sai) */
  quizAnswers: Record<string, boolean>;
  /** Danh sách id các bài Excel (00..23) đã hoàn thành */
  completedExcelLessons: string[];
  /** Danh sách id các bài Excel tương tác đã giải đúng 100% */
  completedInteractiveLabs: string[];
  /** Checklist các bước thực hành đã tick theo key `${labId}:${taskIndex}` */
  completedLabTasks: Record<string, boolean>;
  /** Lịch sử các lần thi thử */
  examHistory: MockExamRecord[];
}
