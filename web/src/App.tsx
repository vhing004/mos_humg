import React, { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { SubjectPage } from './pages/SubjectPage';
import { FoundationPage } from './pages/FoundationPage';
import { MockExamPage } from './pages/MockExamPage';
import { LabsPage } from './pages/LabsPage';
import {
  addMockExamRecord,
  loadProgress,
  markInteractiveLabComplete,
  recordQuizAnswer,
  resetAllProgress,
  toggleExcelLessonComplete,
  toggleLabTaskComplete,
} from './utils/progress';
import { LearningProgress, MockExamRecord } from './types';

export const App: React.FC = () => {
  const [progress, setProgress] = useState<LearningProgress>(() => loadProgress());

  const handleAnswerQuiz = (
    moduleId: string,
    questionNumber: number,
    isCorrect: boolean
  ) => {
    setProgress((prev) =>
      recordQuizAnswer(prev, moduleId, questionNumber, isCorrect)
    );
  };

  const handleToggleExcelComplete = (lessonId: string) => {
    setProgress((prev) => toggleExcelLessonComplete(prev, lessonId));
  };

  const handleCompleteInteractiveLab = (labId: string) => {
    setProgress((prev) => markInteractiveLabComplete(prev, labId));
  };

  const handleToggleLabTask = (labId: string, taskIndex: number) => {
    setProgress((prev) => toggleLabTaskComplete(prev, labId, taskIndex));
  };

  const handleSaveExam = (record: MockExamRecord) => {
    setProgress((prev) => addMockExamRecord(prev, record));
  };

  const handleResetProgress = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ tiến độ học tập?')) {
      setProgress(resetAllProgress());
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route
            path="/"
            element={
              <DashboardPage
                progress={progress}
                onResetProgress={handleResetProgress}
              />
            }
          />
          <Route
            path="/word"
            element={
              <SubjectPage
                key="word"
                subject="word"
                progress={progress}
                onAnswerQuiz={handleAnswerQuiz}
                onToggleExcelComplete={handleToggleExcelComplete}
                onCompleteInteractiveLab={handleCompleteInteractiveLab}
                onToggleLabTask={handleToggleLabTask}
              />
            }
          />
          <Route
            path="/excel"
            element={
              <SubjectPage
                key="excel"
                subject="excel"
                progress={progress}
                onAnswerQuiz={handleAnswerQuiz}
                onToggleExcelComplete={handleToggleExcelComplete}
                onCompleteInteractiveLab={handleCompleteInteractiveLab}
                onToggleLabTask={handleToggleLabTask}
              />
            }
          />
          <Route
            path="/ppt"
            element={
              <SubjectPage
                key="ppt"
                subject="ppt"
                progress={progress}
                onAnswerQuiz={handleAnswerQuiz}
                onToggleExcelComplete={handleToggleExcelComplete}
                onCompleteInteractiveLab={handleCompleteInteractiveLab}
                onToggleLabTask={handleToggleLabTask}
              />
            }
          />
          <Route
            path="/foundation"
            element={
              <FoundationPage
                progress={progress}
                onAnswerQuiz={handleAnswerQuiz}
              />
            }
          />
          <Route
            path="/mock-exam"
            element={<MockExamPage onSaveExam={handleSaveExam} />}
          />
          <Route
            path="/labs"
            element={
              <LabsPage
                progress={progress}
                onToggleLabTask={handleToggleLabTask}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
