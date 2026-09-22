export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // 0 for A, 1 for B, 2 for C, 3 for D
  explanation: string;
  quoteReference: string;
  difficultyLabel?: string;
}

export interface QuizData {
  id: string;
  title: string;
  summary?: string;
  numQuestions: number;
  timeMinutes: number;
  difficulty: 'easy' | 'normal' | 'hard';
  createdAt: string;
  questions: QuizQuestion[];
}

export interface QuizConfig {
  apiKey: string;
  model: string;
  numQuestions: number;
  timeMinutes: number;
  difficulty: 'easy' | 'normal' | 'hard';
  documentText: string;
  documentFileName?: string;
  documentFile?: {
    name: string;
    mimeType: string;
    base64: string;
  } | null;
  topicName: string;
}

export interface QuizResult {
  id: string;
  studentName: string;
  studentClass?: string;
  quizTitle: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  score: number; // 1 point per correct question
  percentage: number;
  timeSpentSeconds: number;
  timeLimitMinutes: number;
  difficulty: 'easy' | 'normal' | 'hard';
  completedAt: string;
  userAnswers: Record<number, number>; // question id -> option index (0..3 or -1)
  questions: QuizQuestion[];
}

export interface LeaderboardEntry {
  id: string;
  studentName: string;
  studentClass?: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  accuracy: number;
  timeSpentSeconds: number;
  difficulty: 'easy' | 'normal' | 'hard';
  completedAt: string;
}

export type AppView = 'setup' | 'quiz' | 'result' | 'leaderboard';
