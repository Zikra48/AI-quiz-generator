import React, { useEffect, useState, useCallback } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Bookmark, 
  BookmarkCheck, 
  AlertCircle, 
  Send,
  HelpCircle
} from 'lucide-react';
import { OptionLetter } from '../../api/types.ts';
import { ActiveQuizState } from '../types/quiz.ts';

interface ActiveQuizProps {
  quizState: ActiveQuizState;
  onSelectAnswer: (questionId: number, answer: OptionLetter) => void;
  onToggleFlag: (questionId: number) => void;
  onChangeIndex: (newIndex: number) => void;
  onSubmitQuiz: () => void;
  isSubmitting: boolean;
  submissionError?: string | null;
}

export const ActiveQuiz: React.FC<ActiveQuizProps> = ({
  quizState,
  onSelectAnswer,
  onToggleFlag,
  onChangeIndex,
  onSubmitQuiz,
  isSubmitting,
  submissionError,
}) => {
  const {
    topic,
    difficulty,
    questions,
    currentIndex,
    userAnswers,
    flaggedQuestions,
  } = quizState;

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(userAnswers).length;
  const allAnswered = answeredCount === totalQuestions;
  const currentAnswer = userAnswers[currentQuestion.id];
  const isFlagged = !!flaggedQuestions[currentQuestion.id];

  // Stopwatch timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger if user is in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key)) {
        onSelectAnswer(currentQuestion.id, key as OptionLetter);
      } else if (key === '1') {
        onSelectAnswer(currentQuestion.id, 'A');
      } else if (key === '2') {
        onSelectAnswer(currentQuestion.id, 'B');
      } else if (key === '3') {
        onSelectAnswer(currentQuestion.id, 'C');
      } else if (key === '4') {
        onSelectAnswer(currentQuestion.id, 'D');
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onChangeIndex(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < totalQuestions - 1) {
        onChangeIndex(currentIndex + 1);
      } else if (e.key === 'f' || e.key === 'F') {
        onToggleFlag(currentQuestion.id);
      }
    },
    [currentQuestion.id, currentIndex, totalQuestions, onSelectAnswer, onChangeIndex, onToggleFlag]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Find unanswered questions list
  const unansweredIndices = questions
    .map((q, idx) => (userAnswers[q.id] ? null : idx))
    .filter((idx): idx is number => idx !== null);

  const jumpToFirstUnanswered = () => {
    if (unansweredIndices.length > 0) {
      onChangeIndex(unansweredIndices[0]);
    }
  };

  const optionKeys: OptionLetter[] = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
      {/* Top Bar: Topic, Timer & Overall Status */}
      <div className="bg-white rounded-xl border border-[#182B3A]/10 p-4 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#F7F5F0] border border-[#182B3A]/10 flex items-center justify-center font-bold text-[#182B3A] text-sm">
            {currentIndex + 1}/{totalQuestions}
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#182B3A] line-clamp-1">
              {topic}
            </h2>
            <div className="flex items-center gap-2 text-xs text-[#182B3A]/60 font-medium">
              <span className="capitalize">{difficulty}</span>
              <span aria-hidden="true">·</span>
              <span>{answeredCount} of {totalQuestions} answered</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Elapsed Timer */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7F5F0] border border-[#182B3A]/10 text-xs font-semibold text-[#182B3A]">
            <Clock className="w-3.5 h-3.5 text-[#D94C27]" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>

          {/* Jump to first unanswered shortcut if missing */}
          {!allAnswered && (
            <button
              onClick={jumpToFirstUnanswered}
              className="text-xs font-semibold text-[#D94C27] hover:underline cursor-pointer hidden md:inline-flex items-center gap-1"
            >
              <span>{totalQuestions - answeredCount} unanswered</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#182B3A]/10 h-2 rounded-full overflow-hidden mb-6">
        <div
          className="bg-[#D94C27] h-full transition-all duration-300 ease-out"
          style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Question Card Column */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl border border-[#182B3A]/10 shadow-sm p-6 sm:p-8">
            {/* Question Header & Flag action */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold tracking-wider uppercase text-[#D94C27]">
                Question {currentIndex + 1}
              </span>
              <button
                onClick={() => onToggleFlag(currentQuestion.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                  isFlagged
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : 'text-[#182B3A]/60 hover:text-[#182B3A] border-transparent hover:bg-[#F7F5F0]'
                }`}
                title="Flag question for review"
              >
                {isFlagged ? (
                  <>
                    <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>Flagged</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Flag (F)</span>
                  </>
                )}
              </button>
            </div>

            {/* Question Prompt */}
            <h3 className="text-lg sm:text-xl font-bold text-[#182B3A] leading-relaxed mb-6">
              {currentQuestion.question}
            </h3>

            {/* 4 Option Buttons (A, B, C, D) */}
            <div className="space-y-3">
              {optionKeys.map((letter) => {
                const optionText = currentQuestion.options[letter];
                const isSelected = currentAnswer === letter;

                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => onSelectAnswer(currentQuestion.id, letter)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3.5 cursor-pointer group ${
                      isSelected
                        ? 'bg-[#182B3A]/5 border-[#182B3A] text-[#182B3A] shadow-xs'
                        : 'bg-[#F7F5F0]/50 hover:bg-[#F7F5F0] border-[#182B3A]/15 text-[#182B3A] hover:border-[#182B3A]/30'
                    }`}
                  >
                    {/* Letter Badge */}
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#182B3A] text-white'
                          : 'bg-white border border-[#182B3A]/20 text-[#182B3A] group-hover:border-[#182B3A]'
                      }`}
                    >
                      {letter}
                    </div>

                    {/* Option Text */}
                    <div className="flex-1 text-sm sm:text-base font-medium leading-relaxed pt-1">
                      {optionText}
                    </div>

                    {/* Checkmark when selected */}
                    {isSelected && (
                      <div className="shrink-0 pt-1 text-[#182B3A]">
                        <CheckCircle className="w-5 h-5 fill-[#182B3A] text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Keyboard shortcut hint */}
            <div className="mt-6 pt-4 border-t border-[#182B3A]/10 flex flex-wrap items-center justify-between text-xs text-[#182B3A]/50 gap-2">
              <span>Press <kbd className="px-1.5 py-0.5 bg-[#F7F5F0] border rounded font-mono text-[10px]">A</kbd>, <kbd className="px-1.5 py-0.5 bg-[#F7F5F0] border rounded font-mono text-[10px]">B</kbd>, <kbd className="px-1.5 py-0.5 bg-[#F7F5F0] border rounded font-mono text-[10px]">C</kbd>, <kbd className="px-1.5 py-0.5 bg-[#F7F5F0] border rounded font-mono text-[10px]">D</kbd> or <kbd className="px-1.5 py-0.5 bg-[#F7F5F0] border rounded font-mono text-[10px]">1-4</kbd> to select</span>
              <span>Use <kbd className="px-1.5 py-0.5 bg-[#F7F5F0] border rounded font-mono text-[10px]">←</kbd> <kbd className="px-1.5 py-0.5 bg-[#F7F5F0] border rounded font-mono text-[10px]">→</kbd> to navigate</span>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => onChangeIndex(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-[#182B3A] bg-white border border-[#182B3A]/15 hover:bg-[#F7F5F0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentIndex < totalQuestions - 1 ? (
              <button
                onClick={() => onChangeIndex(currentIndex + 1)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#182B3A] hover:bg-[#D94C27] transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onSubmitQuiz}
                disabled={!allAnswered || isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#D94C27] hover:bg-[#C23F1C] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Grading Quiz...' : 'Submit & Grade Quiz'}</span>
              </button>
            )}
          </div>

          {/* Alert if on last question and questions remain unanswered */}
          {currentIndex === totalQuestions - 1 && !allAnswered && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  {totalQuestions - answeredCount} question(s) remain unanswered
                </p>
                <p className="text-amber-800/80 mt-0.5">
                  All questions must be answered before you can submit. You may change any of your answers before final grading.
                </p>
                <button
                  onClick={jumpToFirstUnanswered}
                  className="mt-2 text-xs font-bold text-[#D94C27] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  Jump to first unanswered question →
                </button>
              </div>
            </div>
          )}

          {submissionError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="font-medium">
                {submissionError}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Question Navigator Matrix */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#182B3A]/10 shadow-xs p-5">
            <h4 className="text-sm font-bold text-[#182B3A] mb-3 flex items-center justify-between">
              <span>Question Navigator</span>
              <span className="text-xs font-semibold text-[#182B3A]/60">
                {answeredCount}/{totalQuestions}
              </span>
            </h4>

            {/* Grid of question buttons */}
            <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-2 mb-4">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = !!userAnswers[q.id];
                const flagged = !!flaggedQuestions[q.id];

                return (
                  <button
                    key={q.id}
                    onClick={() => onChangeIndex(idx)}
                    className={`relative h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                      isCurrent
                        ? 'bg-[#182B3A] text-white ring-2 ring-[#D94C27] ring-offset-2'
                        : isAnswered
                        ? 'bg-[#182B3A]/10 text-[#182B3A] hover:bg-[#182B3A]/20'
                        : 'bg-[#F7F5F0] text-[#182B3A]/60 hover:text-[#182B3A] border border-[#182B3A]/10'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {flagged && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="text-[11px] text-[#182B3A]/70 space-y-1.5 pt-3 border-t border-[#182B3A]/10">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-[#182B3A]/10 inline-block" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-[#F7F5F0] border border-[#182B3A]/10 inline-block" />
                <span>Unanswered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-[#182B3A] ring-1 ring-[#D94C27] inline-block" />
                <span>Current</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span>Flagged for review</span>
              </div>
            </div>

            {/* Submit Quiz button in sidebar */}
            <div className="mt-5 pt-4 border-t border-[#182B3A]/10">
              <button
                onClick={onSubmitQuiz}
                disabled={!allAnswered || isSubmitting}
                className="w-full py-2.5 px-3 rounded-xl font-bold text-xs text-white bg-[#D94C27] hover:bg-[#C23F1C] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Quiz ({answeredCount}/{totalQuestions})</span>
              </button>
              {!allAnswered && (
                <p className="text-[10px] text-center text-[#182B3A]/50 mt-1.5">
                  Answer all questions to enable submit
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
