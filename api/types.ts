export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type OptionLetter = 'A' | 'B' | 'C' | 'D';

export interface QuizQuestionRaw {
  id: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: OptionLetter;
  explanation: string;
}

// Client-safe question (answers and explanations omitted before submission)
export interface ClientQuestion {
  id: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
}

export interface GenerateQuizRequest {
  topic: string;
  difficulty?: Difficulty;
  numQuestions?: number;
  focusArea?: string;
}

export interface GenerateQuizResponse {
  success: boolean;
  quizId: string;
  topic: string;
  difficulty: Difficulty;
  totalQuestions: number;
  questions: ClientQuestion[];
  sessionToken: string;
  estimatedTimeMinutes: number;
  generatedAt: string;
  error?: string;
}

export interface GradeQuizRequest {
  sessionToken: string;
  answers: Record<number, OptionLetter>;
  timeTakenSeconds?: number;
}

export interface QuestionResult {
  id: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  selectedAnswer: OptionLetter | null;
  correctAnswer: OptionLetter;
  isCorrect: boolean;
  explanation: string;
}

export interface GradeQuizResponse {
  success: boolean;
  quizId?: string;
  topic: string;
  difficulty: Difficulty;
  score: number;
  totalQuestions: number;
  percentage: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  passed: boolean;
  gradeBadge: string;
  timeTakenSeconds?: number;
  results: QuestionResult[];
  error?: string;
}
