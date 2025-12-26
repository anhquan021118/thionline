
export type QuestionType = 'choice' | 'text' | 'group';

export interface SubQuestion {
  id: string;
  content: string;
  correctAnswer: boolean;
}

export interface Question {
  id: number;
  type: QuestionType;
  section?: string;
  question: string;
  options?: string[];
  answer?: string;
  subQuestions?: SubQuestion[];
}

export interface StudentResult {
  id: string;
  name: string;
  className: string;
  email?: string; // Added email property
  score: number;
  total: number;
  date?: string;
  timeSpent?: number;
  violations: number;
  counts: {
    correct: number;
    wrong: number;
    empty: number;
  };
  answers?: any;
}

export interface GradingConfig {
  part1Total: number;
  part2Total: number;
  part3Total: number;
  part4Total: number;
  groupGradingMethod: 'progressive' | 'equal';
}

export interface ExamConfig {
  id: string;
  code: string;
  securityCode: string;
  title: string;
  className: string;
  duration: number;
  maxAttempts?: number;
  maxViolations?: number;
  gradingConfig?: GradingConfig;
  allowHints: boolean;
  allowReview: boolean;
  questions: Question[];
  results: StudentResult[];
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  className: string;
  email?: string;
  isApproved?: boolean;
}

export type UserRole = 'teacher' | 'student';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  className?: string;
  school?: string;
  isApproved?: boolean;
  createdAt?: string;
}

// Khởi tạo mảng trống cho dự án mới
export const INITIAL_QUESTIONS: Question[] = [];
