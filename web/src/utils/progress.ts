import { LearningProgress, MockExamRecord } from '../types';

const STORAGE_KEY = 'mos_learning_progress_v1';

const DEFAULT_PROGRESS: LearningProgress = {
  quizAnswers: {},
  completedExcelLessons: [],
  completedInteractiveLabs: [],
  completedLabTasks: {},
  examHistory: [],
};

/** Đọc tiến độ học tập từ localStorage */
export function loadProgress(): LearningProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw) as Partial<LearningProgress>;
    return {
      quizAnswers: parsed.quizAnswers ?? {},
      completedExcelLessons: parsed.completedExcelLessons ?? [],
      completedInteractiveLabs: parsed.completedInteractiveLabs ?? [],
      completedLabTasks: parsed.completedLabTasks ?? {},
      examHistory: parsed.examHistory ?? [],
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

/** Lưu tiến độ học tập vào localStorage */
export function saveProgress(progress: LearningProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function recordQuizAnswer(
  progress: LearningProgress,
  moduleId: string,
  questionNumber: number,
  isCorrect: boolean
): LearningProgress {
  const next: LearningProgress = {
    ...progress,
    quizAnswers: {
      ...progress.quizAnswers,
      [`${moduleId}:${questionNumber}`]: isCorrect,
    },
  };
  saveProgress(next);
  return next;
}

export function toggleExcelLessonComplete(
  progress: LearningProgress,
  lessonId: string
): LearningProgress {
  const exists = progress.completedExcelLessons.includes(lessonId);
  const completedExcelLessons = exists
    ? progress.completedExcelLessons.filter((id) => id !== lessonId)
    : [...progress.completedExcelLessons, lessonId];
  const next: LearningProgress = { ...progress, completedExcelLessons };
  saveProgress(next);
  return next;
}

export function markInteractiveLabComplete(
  progress: LearningProgress,
  labId: string
): LearningProgress {
  if (progress.completedInteractiveLabs.includes(labId)) return progress;
  const next: LearningProgress = {
    ...progress,
    completedInteractiveLabs: [...progress.completedInteractiveLabs, labId],
  };
  saveProgress(next);
  return next;
}

export function toggleLabTaskComplete(
  progress: LearningProgress,
  labId: string,
  taskIndex: number
): LearningProgress {
  const key = `${labId}:${taskIndex}`;
  const next: LearningProgress = {
    ...progress,
    completedLabTasks: {
      ...progress.completedLabTasks,
      [key]: !progress.completedLabTasks[key],
    },
  };
  saveProgress(next);
  return next;
}

export function addMockExamRecord(
  progress: LearningProgress,
  record: MockExamRecord
): LearningProgress {
  const next: LearningProgress = {
    ...progress,
    examHistory: [record, ...progress.examHistory].slice(0, 30),
  };
  saveProgress(next);
  return next;
}

export function resetAllProgress(): LearningProgress {
  localStorage.removeItem(STORAGE_KEY);
  return { ...DEFAULT_PROGRESS };
}
