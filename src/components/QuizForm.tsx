import React, { useState } from 'react';
import { BookOpen, Sparkles, Layers, Sliders, AlertCircle, ArrowRight, Lightbulb } from 'lucide-react';
import { Difficulty } from '../../api/types.ts';
import { QuizConfig } from '../types/quiz.ts';

interface QuizFormProps {
  onGenerate: (config: QuizConfig) => void;
  isLoading: boolean;
  errorMessage?: string | null;
}

const PRESET_TOPICS = [
  { topic: 'Cellular Respiration & Krebs Cycle', difficulty: 'intermediate' as Difficulty, focus: 'ATP synthase & electron transport' },
  { topic: 'Macroeconomics: Monetary Policy & Inflation', difficulty: 'intermediate' as Difficulty, focus: 'Central bank interest rates & reserve ratios' },
  { topic: 'Computer Science: Graph Algorithms & BFS/DFS', difficulty: 'advanced' as Difficulty, focus: 'Time complexity and cycle detection' },
  { topic: 'Quantum Mechanics: Wave-Particle Duality', difficulty: 'advanced' as Difficulty, focus: 'Photoelectric effect and de Broglie wavelength' },
  { topic: 'Organic Chemistry: SN1 vs SN2 Reactions', difficulty: 'intermediate' as Difficulty, focus: 'Stereochemistry and nucleophilicity' },
  { topic: 'Cognitive Psychology: Memory & Biases', difficulty: 'beginner' as Difficulty, focus: 'Working memory and confirmation bias' },
  { topic: 'World War II: The Pacific Theater Strategy', difficulty: 'beginner' as Difficulty, focus: 'Island hopping and Battle of Midway' },
  { topic: 'Microbiology: Bacterial Genetics & Plasmids', difficulty: 'intermediate' as Difficulty, focus: 'Conjugation, transformation, and transduction' },
];

export const QuizForm: React.FC<QuizFormProps> = ({
  onGenerate,
  isLoading,
  errorMessage,
}) => {
  const [topic, setTopic] = useState('');
  const [focusArea, setFocusArea] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [numQuestions, setNumQuestions] = useState(5);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTopic = topic.trim();
    if (!cleanTopic) {
      setValidationError('Please enter an academic topic to generate questions.');
      return;
    }
    if (cleanTopic.length < 2) {
      setValidationError('Topic must be at least 2 characters long.');
      return;
    }
    setValidationError(null);
    onGenerate({
      topic: cleanTopic,
      focusArea: focusArea.trim() || undefined,
      difficulty,
      numQuestions,
    });
  };

  const handleSelectPreset = (preset: typeof PRESET_TOPICS[0]) => {
    setTopic(preset.topic);
    setDifficulty(preset.difficulty);
    if (preset.focus) setFocusArea(preset.focus);
    setValidationError(null);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
      {/* Title & Introduction */}
      <div className="text-center mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#D94C27] mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Academic Knowledge Assessment</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#182B3A] mb-3">
          Test Your Mastery on Any Topic
        </h1>
        <p className="text-base sm:text-lg text-[#182B3A]/70 max-w-xl mx-auto leading-relaxed">
          Generate rigorous university-grade multiple-choice quizzes with Google Gemini AI. Practice with instant feedback and in-depth conceptual explanations.
        </p>
      </div>

      {/* Main Generator Card */}
      <div className="bg-white rounded-2xl border border-[#182B3A]/10 shadow-sm p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle decorative top bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D94C27] via-[#182B3A] to-[#D94C27]" />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Topic Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="topic-input" className="block text-sm font-bold text-[#182B3A]">
                Academic Subject or Topic <span className="text-[#D94C27]">*</span>
              </label>
              <span className="text-xs text-[#182B3A]/50">
                {topic.length}/150 characters
              </span>
            </div>
            <div className="relative">
              <input
                id="topic-input"
                type="text"
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value.slice(0, 150));
                  if (validationError) setValidationError(null);
                }}
                placeholder="e.g. Cellular Respiration, Monetary Policy, Binary Search Trees..."
                className="w-full px-4 py-3 bg-[#F7F5F0] border border-[#182B3A]/15 rounded-xl text-[#182B3A] placeholder-[#182B3A]/40 text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#D94C27] focus:border-transparent transition-all"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#182B3A]/60 mb-2.5">
              <Lightbulb className="w-3.5 h-3.5 text-[#D94C27]" />
              <span>Or try an academic preset:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TOPICS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-[#F7F5F0] hover:bg-[#182B3A] hover:text-white text-[#182B3A]/80 border border-[#182B3A]/10 transition-colors cursor-pointer text-left"
                >
                  {p.topic}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Focus Area */}
          <div>
            <label htmlFor="focus-input" className="block text-sm font-semibold text-[#182B3A] mb-1.5">
              Specific Focus Area or Concept <span className="text-xs font-normal text-[#182B3A]/50">(Optional)</span>
            </label>
            <input
              id="focus-input"
              type="text"
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value.slice(0, 120))}
              placeholder="e.g. Focus on enzyme kinetics, mathematical proofs, specific historical treaties..."
              className="w-full px-4 py-2.5 bg-[#F7F5F0] border border-[#182B3A]/15 rounded-xl text-[#182B3A] placeholder-[#182B3A]/40 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D94C27] focus:border-transparent transition-all"
              disabled={isLoading}
            />
          </div>

          {/* Difficulty Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-[#182B3A]">
                Difficulty Level
              </label>
              <span className="text-xs text-[#182B3A]/60">
                {difficulty === 'beginner' && 'Introductory definitions & core vocabulary'}
                {difficulty === 'intermediate' && 'Conceptual problem-solving & application'}
                {difficulty === 'advanced' && 'Analytical synthesis, nuances & edge cases'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2.5 p-1.5 bg-[#F7F5F0] rounded-xl border border-[#182B3A]/10">
              {(['beginner', 'intermediate', 'advanced'] as Difficulty[]).map((level) => {
                const isActive = difficulty === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold capitalize transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                      isActive
                        ? 'bg-white text-[#182B3A] shadow-sm border border-[#182B3A]/15'
                        : 'text-[#182B3A]/60 hover:text-[#182B3A] hover:bg-white/50'
                    }`}
                  >
                    <span>{level}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Number of Questions (3 - 10) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="num-questions-slider" className="block text-sm font-bold text-[#182B3A]">
                Number of Questions
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-[#D94C27]">
                  {numQuestions}
                </span>
                <span className="text-xs text-[#182B3A]/60">
                  questions (~{Math.round(numQuestions * 1.5)} min)
                </span>
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-3">
              <input
                id="num-questions-slider"
                type="range"
                min={3}
                max={10}
                step={1}
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="w-full h-2 bg-[#182B3A]/10 rounded-lg appearance-none cursor-pointer accent-[#D94C27]"
                disabled={isLoading}
              />
              {/* Stepper Quick Buttons */}
              <div className="flex items-center justify-between text-xs">
                {[3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setNumQuestions(num)}
                    className={`w-7 h-7 rounded-md font-bold transition-colors cursor-pointer flex items-center justify-center ${
                      numQuestions === num
                        ? 'bg-[#182B3A] text-white shadow-xs'
                        : 'text-[#182B3A]/60 hover:bg-[#F7F5F0] hover:text-[#182B3A]'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error alerts */}
          {(validationError || errorMessage) && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">
                {validationError || errorMessage}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-white text-base bg-[#D94C27] hover:bg-[#C23F1C] active:bg-[#B33515] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 group"
            >
              <Sparkles className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span>Generate Academic Quiz</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </form>
      </div>

      {/* Feature highlights below generator */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="p-4 rounded-xl bg-white/60 border border-[#182B3A]/5">
          <h3 className="text-sm font-bold text-[#182B3A] mb-1">
            4 Distinct Choices
          </h3>
          <p className="text-xs text-[#182B3A]/70">
            Standard A, B, C, D structure with exactly one unambiguous correct answer.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white/60 border border-[#182B3A]/5">
          <h3 className="text-sm font-bold text-[#182B3A] mb-1">
            Encrypted Sessions
          </h3>
          <p className="text-xs text-[#182B3A]/70">
            Answer keys remain hidden until final submission for genuine self-testing.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white/60 border border-[#182B3A]/5">
          <h3 className="text-sm font-bold text-[#182B3A] mb-1">
            Deep Explanations
          </h3>
          <p className="text-xs text-[#182B3A]/70">
            Learn why the correct answer holds true and why common distractors fail.
          </p>
        </div>
      </div>
    </div>
  );
};
