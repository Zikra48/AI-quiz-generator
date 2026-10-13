/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { QuizForm } from './components/QuizForm.tsx';
import { LoadingQuiz } from './components/LoadingQuiz.tsx';
import { ActiveQuiz } from './components/ActiveQuiz.tsx';
import { ResultsView } from './components/ResultsView.tsx';
import { StudySheetModal } from './components/StudySheetModal.tsx';
import { QuizHistoryModal } from './components/QuizHistoryModal.tsx';
import { 
  QuizViewMode, 
  QuizConfig, 
  ActiveQuizState, 
  StoredQuizRecord 
} from './types/quiz.ts';
import { 
  GenerateQuizResponse, 
  GradeQuizResponse, 
  OptionLetter 
} from '../api/types.ts';
import { 
  getQuizHistory, 
  saveQuizRecord, 
  deleteQuizRecord, 
  clearQuizHistory 
} from './utils/history.ts';

export default function App() {
  const [viewMode, setViewMode] = useState<QuizViewMode>('form');
  const [activeConfig, setActiveConfig] = useState<QuizConfig | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<ActiveQuizState | null>(null);
  const [quizResults, setQuizResults] = useState<GradeQuizResponse | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Modals
  const [isStudySheetOpen, setIsStudySheetOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyRecords, setHistoryRecords] = useState<StoredQuizRecord[]>([]);

  // Quit confirmation modal if user clicks new quiz while taking test
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  useEffect(() => {
    setHistoryRecords(getQuizHistory());
  }, []);

  // 1. Generate Quiz API handler
  const handleGenerate = async (config: QuizConfig) => {
    setActiveConfig(config);
    setIsLoading(true);
    setErrorMessage(null);
    setViewMode('loading');

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data: GenerateQuizResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate quiz questions.');
      }

      if (!data.questions || data.questions.length === 0) {
        throw new Error('Received empty question set from generator.');
      }

      setActiveQuiz({
        quizId: data.quizId,
        topic: data.topic,
        difficulty: data.difficulty,
        totalQuestions: data.totalQuestions,
        questions: data.questions,
        sessionToken: data.sessionToken,
        userAnswers: {},
        flaggedQuestions: {},
        currentIndex: 0,
        startTime: Date.now(),
        estimatedTimeMinutes: data.estimatedTimeMinutes,
      });

      setViewMode('taking');
    } catch (err: any) {
      console.error('Quiz generation error:', err);
      setErrorMessage(err?.message || 'Failed to communicate with quiz generation service. Please check your network and try again.');
      setViewMode('form');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Interactive Answer Selection
  const handleSelectAnswer = (questionId: number, answer: OptionLetter) => {
    if (!activeQuiz) return;
    setActiveQuiz((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        userAnswers: {
          ...prev.userAnswers,
          [questionId]: answer,
        },
      };
    });
  };

  // 3. Question Flag Toggle
  const handleToggleFlag = (questionId: number) => {
    if (!activeQuiz) return;
    setActiveQuiz((prev) => {
      if (!prev) return prev;
      const isCurrentlyFlagged = !!prev.flaggedQuestions[questionId];
      return {
        ...prev,
        flaggedQuestions: {
          ...prev.flaggedQuestions,
          [questionId]: !isCurrentlyFlagged,
        },
      };
    });
  };

  // 4. Change Active Question Index
  const handleChangeIndex = (newIndex: number) => {
    if (!activeQuiz) return;
    if (newIndex >= 0 && newIndex < activeQuiz.questions.length) {
      setActiveQuiz((prev) => (prev ? { ...prev, currentIndex: newIndex } : prev));
    }
  };

  // 5. Submit Quiz API handler
  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;

    // Strict validation: Prevent submission until all questions are answered
    const total = activeQuiz.questions.length;
    const answeredCount = Object.keys(activeQuiz.userAnswers).length;
    if (answeredCount < total) {
      setSubmissionError(`Please answer all ${total} questions before submitting (currently answered: ${answeredCount}/${total}).`);
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    const timeTakenSeconds = Math.max(1, Math.round((Date.now() - activeQuiz.startTime) / 1000));

    try {
      const response = await fetch('/api/grade-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken: activeQuiz.sessionToken,
          answers: activeQuiz.userAnswers,
          timeTakenSeconds,
        }),
      });

      const data: GradeQuizResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to grade quiz.');
      }

      setQuizResults(data);

      // Save to localStorage history
      const record: StoredQuizRecord = {
        id: data.quizId || `quiz_${Date.now()}`,
        topic: data.topic,
        difficulty: data.difficulty,
        totalQuestions: data.totalQuestions,
        score: data.score,
        percentage: data.percentage,
        gradeBadge: data.gradeBadge,
        completedAt: new Date().toISOString(),
        timeTakenSeconds,
        results: data.results,
      };
      saveQuizRecord(record);
      setHistoryRecords(getQuizHistory());

      setViewMode('results');
    } catch (err: any) {
      console.error('Quiz grading error:', err);
      setSubmissionError(err?.message || 'Failed to submit quiz for grading. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 6. Retake Current Quiz Questions
  const handleRetake = () => {
    if (!activeQuiz) {
      // If retaking from archived results, recreate active questions
      if (quizResults) {
        setActiveQuiz({
          quizId: quizResults.quizId || `quiz_${Date.now()}`,
          topic: quizResults.topic,
          difficulty: quizResults.difficulty,
          totalQuestions: quizResults.totalQuestions,
          questions: quizResults.results.map((r) => ({
            id: r.id,
            question: r.question,
            options: r.options,
          })),
          sessionToken: '', // Answers already available in results if needed
          userAnswers: {},
          flaggedQuestions: {},
          currentIndex: 0,
          startTime: Date.now(),
          estimatedTimeMinutes: Math.round(quizResults.totalQuestions * 1.5),
        });
        setViewMode('taking');
      }
      return;
    }

    setActiveQuiz((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        userAnswers: {},
        flaggedQuestions: {},
        currentIndex: 0,
        startTime: Date.now(),
      };
    });
    setSubmissionError(null);
    setViewMode('taking');
  };

  // 7. Request New Quiz
  const handleNewQuizClick = () => {
    if (viewMode === 'taking') {
      setShowQuitConfirm(true);
    } else {
      setViewMode('form');
      setErrorMessage(null);
    }
  };

  const confirmQuitAndNewQuiz = () => {
    setShowQuitConfirm(false);
    setActiveQuiz(null);
    setViewMode('form');
    setErrorMessage(null);
  };

  // 8. Select Past Record to Review
  const handleSelectRecord = (record: StoredQuizRecord) => {
    setQuizResults({
      success: true,
      quizId: record.id,
      topic: record.topic,
      difficulty: record.difficulty,
      score: record.score,
      totalQuestions: record.totalQuestions,
      percentage: record.percentage,
      correctCount: record.score,
      incorrectCount: record.totalQuestions - record.score,
      unansweredCount: 0,
      passed: record.percentage >= 70,
      gradeBadge: record.gradeBadge,
      timeTakenSeconds: record.timeTakenSeconds,
      results: record.results,
    });
    setViewMode('results');
  };

  const handleDeleteRecord = (id: string) => {
    const updated = deleteQuizRecord(id);
    setHistoryRecords(updated);
  };

  const handleClearHistory = () => {
    clearQuizHistory();
    setHistoryRecords([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#182B3A]">
      {/* Top Header */}
      <Header
        onNewQuiz={handleNewQuizClick}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={historyRecords.length}
        isTakingQuiz={viewMode === 'taking'}
      />

      {/* Main Body */}
      <main className="flex-1">
        {viewMode === 'form' && (
          <QuizForm
            onGenerate={handleGenerate}
            isLoading={isLoading}
            errorMessage={errorMessage}
          />
        )}

        {viewMode === 'loading' && activeConfig && (
          <LoadingQuiz
            topic={activeConfig.topic}
            difficulty={activeConfig.difficulty}
            numQuestions={activeConfig.numQuestions}
          />
        )}

        {viewMode === 'taking' && activeQuiz && (
          <ActiveQuiz
            quizState={activeQuiz}
            onSelectAnswer={handleSelectAnswer}
            onToggleFlag={handleToggleFlag}
            onChangeIndex={handleChangeIndex}
            onSubmitQuiz={handleSubmitQuiz}
            isSubmitting={isSubmitting}
            submissionError={submissionError}
          />
        )}

        {viewMode === 'results' && quizResults && (
          <ResultsView
            results={quizResults}
            onRetake={handleRetake}
            onNewQuiz={() => setViewMode('form')}
            onOpenStudySheet={() => setIsStudySheetOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#182B3A]/10 bg-white py-6 text-center text-xs text-[#182B3A]/60">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#182B3A]">Quiz Studio</span>
            <span aria-hidden="true">·</span>
            <span>AI Academic Multiple-Choice Generator</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Powered by Google Gemini 3.8</span>
            <span aria-hidden="true">·</span>
            <span>Vercel Serverless Ready</span>
          </div>
        </div>
      </footer>

      {/* Study Sheet Modal */}
      {quizResults && (
        <StudySheetModal
          isOpen={isStudySheetOpen}
          onClose={() => setIsStudySheetOpen(false)}
          results={quizResults}
        />
      )}

      {/* Quiz History Modal */}
      <QuizHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={historyRecords}
        onSelectRecord={handleSelectRecord}
        onClearHistory={handleClearHistory}
        onDeleteRecord={handleDeleteRecord}
      />

      {/* Quit Active Quiz Confirmation Modal */}
      {showQuitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#182B3A]/60 backdrop-blur-xs">
          <div 
            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-[#182B3A]/15 text-center"
            role="dialog"
            aria-modal="true"
            aria-label="Confirm Quit"
          >
            <h3 className="text-lg font-bold text-[#182B3A] mb-2">
              Quit Current Quiz?
            </h3>
            <p className="text-xs text-[#182B3A]/70 mb-6">
              Your active answers for this session will be discarded if you leave without submitting.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowQuitConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#182B3A] bg-[#F7F5F0] hover:bg-[#ECE8DF] border border-[#182B3A]/15 cursor-pointer"
              >
                Continue Quiz
              </button>
              <button
                onClick={confirmQuitAndNewQuiz}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 cursor-pointer"
              >
                Quit Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
