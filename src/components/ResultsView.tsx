import React, { useState } from 'react';
import { 
  Trophy, 
  RotateCcw, 
  PlusCircle, 
  Download, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Clock, 
  BookOpen, 
  Filter,
  FileText
} from 'lucide-react';
import { GradeQuizResponse, OptionLetter } from '../../api/types.ts';

interface ResultsViewProps {
  results: GradeQuizResponse;
  onRetake: () => void;
  onNewQuiz: () => void;
  onOpenStudySheet: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  results,
  onRetake,
  onNewQuiz,
  onOpenStudySheet,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'incorrect' | 'correct'>('all');

  const {
    topic,
    difficulty,
    score,
    totalQuestions,
    percentage,
    correctCount,
    incorrectCount,
    gradeBadge,
    timeTakenSeconds,
    results: questionResults,
  } = results;

  const filteredQuestions = questionResults.filter((q) => {
    if (filterType === 'correct') return q.isCorrect;
    if (filterType === 'incorrect') return !q.isCorrect;
    return true;
  });

  const formatTime = (secs?: number) => {
    if (!secs) return 'N/A';
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    if (mins === 0) return `${rem}s`;
    return `${mins}m ${rem}s`;
  };

  const optionLetters: OptionLetter[] = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
      {/* Hero Score Card */}
      <div className="bg-white rounded-3xl border border-[#182B3A]/10 shadow-sm p-6 sm:p-10 mb-8 relative overflow-hidden">
        {/* Decorative background circle */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D94C27]/5 rounded-full blur-3xl -z-0 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-[#D94C27] mb-2">
              <Trophy className="w-4 h-4" />
              <span>Assessment Completed</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#182B3A] mb-2">
              {topic}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[#182B3A]/70 font-medium">
              <span className="capitalize">{difficulty} Level</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatTime(timeTakenSeconds)}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-[#182B3A]">{gradeBadge}</span>
            </div>
          </div>

          {/* Big Score Display */}
          <div className="flex items-center gap-6 self-start md:self-auto bg-[#F7F5F0] px-6 py-5 rounded-2xl border border-[#182B3A]/10">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-[#182B3A] tracking-tight">
                {score}<span className="text-xl sm:text-2xl font-bold text-[#182B3A]/40">/{totalQuestions}</span>
              </div>
              <div className="text-xs font-bold text-[#182B3A]/60 uppercase tracking-wider mt-0.5">
                Total Score
              </div>
            </div>

            <div className="w-px h-12 bg-[#182B3A]/15" />

            <div className="text-center">
              <div className={`text-4xl sm:text-5xl font-black tracking-tight ${
                percentage >= 80 ? 'text-emerald-700' : percentage >= 60 ? 'text-amber-700' : 'text-[#D94C27]'
              }`}>
                {percentage}%
              </div>
              <div className="text-xs font-bold text-[#182B3A]/60 uppercase tracking-wider mt-0.5">
                Percentage
              </div>
            </div>
          </div>
        </div>

        {/* Quick Breakdown Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-[#182B3A]/10">
          <div className="p-3 bg-[#F7F5F0]/60 rounded-xl">
            <span className="text-xs text-[#182B3A]/60 font-semibold block">Correct</span>
            <span className="text-lg font-bold text-emerald-700">{correctCount}</span>
          </div>
          <div className="p-3 bg-[#F7F5F0]/60 rounded-xl">
            <span className="text-xs text-[#182B3A]/60 font-semibold block">Incorrect</span>
            <span className="text-lg font-bold text-red-600">{incorrectCount}</span>
          </div>
          <div className="p-3 bg-[#F7F5F0]/60 rounded-xl">
            <span className="text-xs text-[#182B3A]/60 font-semibold block">Accuracy</span>
            <span className="text-lg font-bold text-[#182B3A]">{percentage}%</span>
          </div>
          <div className="p-3 bg-[#F7F5F0]/60 rounded-xl">
            <span className="text-xs text-[#182B3A]/60 font-semibold block">Avg Time/Question</span>
            <span className="text-lg font-bold text-[#182B3A]">
              {timeTakenSeconds ? Math.round(timeTakenSeconds / totalQuestions) : 0}s
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 mt-8">
          <button
            onClick={onNewQuiz}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white bg-[#D94C27] hover:bg-[#C23F1C] transition-all shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Generate New Quiz</span>
          </button>

          <button
            onClick={onRetake}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-[#182B3A] bg-[#F7F5F0] hover:bg-[#ECE8DF] border border-[#182B3A]/15 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-[#182B3A]" />
            <span>Retake This Quiz</span>
          </button>

          <button
            onClick={onOpenStudySheet}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm text-[#182B3A] hover:text-[#D94C27] bg-white border border-[#182B3A]/15 hover:border-[#D94C27] transition-all cursor-pointer ml-auto"
          >
            <FileText className="w-4 h-4 text-[#D94C27]" />
            <span>Export Study Guide</span>
          </button>
        </div>
      </div>

      {/* Review Section Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-[#182B3A]">
            Comprehensive Question Review
          </h2>
          <p className="text-xs sm:text-sm text-[#182B3A]/60 mt-0.5">
            Compare your selections with the answer key and study academic explanations.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-[#182B3A]/10 shadow-2xs self-start sm:self-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterType === 'all'
                ? 'bg-[#182B3A] text-white'
                : 'text-[#182B3A]/70 hover:text-[#182B3A]'
            }`}
          >
            All ({totalQuestions})
          </button>
          <button
            onClick={() => setFilterType('incorrect')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterType === 'incorrect'
                ? 'bg-red-700 text-white'
                : 'text-red-700 hover:bg-red-50'
            }`}
          >
            Incorrect ({incorrectCount})
          </button>
          <button
            onClick={() => setFilterType('correct')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterType === 'correct'
                ? 'bg-emerald-700 text-white'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            Correct ({correctCount})
          </button>
        </div>
      </div>

      {/* Questions Review List */}
      <div className="space-y-6">
        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#182B3A]/10 p-8 text-center text-[#182B3A]/60">
            No questions match this filter.
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const isCorrect = q.isCorrect;
            const selected = q.selectedAnswer;
            const correct = q.correctAnswer;

            return (
              <div
                key={q.id}
                className={`bg-white rounded-2xl border-2 p-6 sm:p-8 shadow-xs transition-all ${
                  isCorrect
                    ? 'border-emerald-200'
                    : 'border-red-200'
                }`}
              >
                {/* Header with status badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold tracking-wider uppercase text-[#182B3A]/60">
                      Question {q.id}
                    </span>
                    <span aria-hidden="true" className="text-[#182B3A]/20">·</span>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md">
                        <XCircle className="w-3.5 h-3.5" />
                        Incorrect
                      </span>
                    )}
                  </div>
                </div>

                {/* Prompt */}
                <h3 className="text-base sm:text-lg font-bold text-[#182B3A] mb-5 leading-relaxed">
                  {q.question}
                </h3>

                {/* Options Review */}
                <div className="space-y-2.5 mb-6">
                  {optionLetters.map((letter) => {
                    const text = q.options[letter];
                    const isStudentChoice = selected === letter;
                    const isRightAnswer = correct === letter;

                    let rowStyle = 'bg-[#F7F5F0]/60 border-[#182B3A]/10 text-[#182B3A]';
                    let badgeStyle = 'bg-white border-[#182B3A]/20 text-[#182B3A]';

                    if (isRightAnswer) {
                      rowStyle = 'bg-emerald-50/70 border-emerald-500 text-emerald-950 font-medium ring-1 ring-emerald-500/30';
                      badgeStyle = 'bg-emerald-600 text-white font-bold';
                    } else if (isStudentChoice && !isCorrect) {
                      rowStyle = 'bg-red-50/70 border-red-500 text-red-950 font-medium ring-1 ring-red-500/30';
                      badgeStyle = 'bg-red-600 text-white font-bold';
                    }

                    return (
                      <div
                        key={letter}
                        className={`p-3.5 rounded-xl border flex items-start gap-3.5 transition-colors ${rowStyle}`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${badgeStyle}`}
                        >
                          {letter}
                        </div>
                        <div className="flex-1 text-sm leading-relaxed pt-0.5">
                          {text}
                        </div>
                        <div className="shrink-0 text-xs font-bold pt-1">
                          {isRightAnswer && (
                            <span className="text-emerald-700 bg-white/80 px-2 py-0.5 rounded border border-emerald-300">
                              Correct Answer
                            </span>
                          )}
                          {isStudentChoice && !isRightAnswer && (
                            <span className="text-red-700 bg-white/80 px-2 py-0.5 rounded border border-red-300">
                              Your Choice
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Box */}
                <div className="bg-[#F7F5F0] rounded-xl border border-[#182B3A]/10 p-4 sm:p-5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#182B3A] uppercase tracking-wider mb-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#D94C27]" />
                    <span>Academic Explanation</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#182B3A]/85 leading-relaxed font-normal">
                    {q.explanation}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="mt-10 p-6 bg-white rounded-2xl border border-[#182B3A]/10 text-center shadow-xs">
        <h4 className="text-base font-bold text-[#182B3A] mb-1">
          Ready for another challenge?
        </h4>
        <p className="text-xs sm:text-sm text-[#182B3A]/60 mb-4">
          Generate a quiz on a related subtopic, change difficulty, or explore a new subject.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onNewQuiz}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#D94C27] hover:bg-[#C23F1C] transition-all cursor-pointer shadow-xs"
          >
            Create New Quiz
          </button>
          <button
            onClick={onRetake}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-[#182B3A] bg-[#F7F5F0] hover:bg-[#ECE8DF] border border-[#182B3A]/15 transition-all cursor-pointer"
          >
            Retake Same Questions
          </button>
        </div>
      </div>
    </div>
  );
};
