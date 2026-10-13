import { ClientQuestion, Difficulty, OptionLetter, QuestionResult, GradeQuizResponse } from '../../api/types.ts';

export type QuizViewMode = 'form' | 'loading' | 'taking' | 'grading' | 'results';

export interface QuizConfig {
  topic: string;
  focusArea?: string;
  difficulty: Difficulty;
  numQuestions: number;
}

export interface ActiveQuizState {
  quizId: string;
  topic: string;
  difficulty: Difficulty;
  totalQuestions: number;
  questions: ClientQuestion[];
  sessionToken: string;
  userAnswers: Record<number, OptionLetter>;
  flaggedQuestions: Record<number, boolean>;
  currentIndex: number;
  startTime: number;
  estimatedTimeMinutes: number;
}

export interface StoredQuizRecord {
  id: string;
  topic: string;
  difficulty: Difficulty;
  totalQuestions: number;
  score: number;
  percentage: number;
  gradeBadge: string;
  completedAt: string;
  timeTakenSeconds: number;
  results: QuestionResult[];
}
