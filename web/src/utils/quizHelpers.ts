import { QuizModuleData, QuizQuestion } from '../types';
import module01 from '../data/quizzes/module01.json';
import module02 from '../data/quizzes/module02.json';
import module03 from '../data/quizzes/module03.json';
import module04 from '../data/quizzes/module04.json';
import module05 from '../data/quizzes/module05.json';
import module06 from '../data/quizzes/module06.json';
import modulesIndex from '../data/quizzes/index.json';
import type { QuizModuleMeta } from '../types';

export const QUIZ_MODULES_META: QuizModuleMeta[] = modulesIndex as QuizModuleMeta[];

const MODULE_MAP: Record<string, QuizModuleData> = {
  module01: module01 as QuizModuleData,
  module02: module02 as QuizModuleData,
  module03: module03 as QuizModuleData,
  module04: module04 as QuizModuleData,
  module05: module05 as QuizModuleData,
  module06: module06 as QuizModuleData,
};

export function getQuizModule(moduleId: string): QuizModuleData | undefined {
  return MODULE_MAP[moduleId];
}

export interface ShuffledQuestion {
  number: number;
  moduleId: string;
  question: string;
  options: string[];
  correctIndex: number;
}

/** Xáo trộn mảng theo thuật toán Fisher-Yates (không làm biến đổi mảng gốc) */
export function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Tạo danh sách câu hỏi đã trộn đáp án để tránh học vẹt vị trí A */
export function prepareShuffledQuestions(
  moduleId: string,
  questions: QuizQuestion[]
): ShuffledQuestion[] {
  return questions.map((q) => {
    const indexed = q.options.map((text, idx) => ({
      text,
      isCorrect: idx === q.correctIndex,
    }));
    const shuffled = shuffleArray(indexed);
    return {
      number: q.number,
      moduleId,
      question: q.question,
      options: shuffled.map((o) => o.text),
      correctIndex: shuffled.findIndex((o) => o.isCorrect),
    };
  });
}

/** Định dạng giây thành mm:ss */
export function formatSeconds(totalSec: number): string {
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
