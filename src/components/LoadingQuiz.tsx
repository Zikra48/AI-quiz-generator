import React, { useEffect, useState } from 'react';
import { BookOpen, Sparkles, Brain, CheckCircle2 } from 'lucide-react';
import { Difficulty } from '../../api/types.ts';

interface LoadingQuizProps {
  topic: string;
  difficulty: Difficulty;
  numQuestions: number;
}

const STEPS = [
  'Querying academic curriculum for authoritative concepts...',
  'Structuring plausible multiple-choice distractors (A, B, C, D)...',
  'Verifying single unambiguous correct answer per question...',
  'Authoring deep educational explanations and review notes...',
  'Encrypting session key for secure self-assessment...',
];

export const LoadingQuiz: React.FC<LoadingQuizProps> = ({
  topic,
  difficulty,
  numQuestions,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-xl mx-auto py-16 px-4 text-center">
      {/* Animated icon circle */}
      <div className="relative w-20 h-20 mx-auto mb-6">
        <div className="absolute inset-0 rounded-2xl bg-[#D94C27]/15 animate-ping opacity-75" />
        <div className="relative w-20 h-20 rounded-2xl bg-[#182B3A] text-white flex items-center justify-center shadow-md">
          <Brain className="w-10 h-10 text-[#F7F5F0] animate-pulse" />
        </div>
      </div>

      <h2 className="text-2xl font-extrabold text-[#182B3A] mb-2 tracking-tight">
        Generating Academic Quiz
      </h2>
      <p className="text-sm text-[#182B3A]/70 mb-6 font-medium">
        Creating {numQuestions} {difficulty} questions for <span className="font-bold text-[#182B3A]">"{topic}"</span>
      </p>

      {/* Progress steps box */}
      <div className="bg-white rounded-xl border border-[#182B3A]/10 p-5 shadow-xs text-left max-w-md mx-auto space-y-3">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          return (
            <div
              key={idx}
              className={`flex items-center gap-3 text-xs sm:text-sm transition-all duration-300 ${
                isDone
                  ? 'text-emerald-700 font-medium'
                  : isCurrent
                  ? 'text-[#182B3A] font-bold'
                  : 'text-[#182B3A]/30'
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : isCurrent ? (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-[#D94C27] border-t-transparent animate-spin" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-[#182B3A]/20" />
                )}
              </div>
              <span className="flex-1">{step}</span>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-[#182B3A]/50 mt-6">
        Using Google Gemini 3.8 Flash · Questions adhere to academic standards
      </p>
    </div>
  );
};
