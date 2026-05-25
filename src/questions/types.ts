export type Difficulty = "easy" | "medium" | "hard" | "expert";

export type RawQuestion = {
  id?: number | string;
  category?: string;
  premium?: boolean;
  difficulty?: Difficulty | string;
  text?: string;
  question?: string;
  answers?: unknown;
  options?: unknown;
  correct?: unknown;
  correctAnswer?: unknown;
  answer?: unknown;
  correctAnswerIndex?: unknown;
  explanation?: unknown;
  tags?: unknown;
  [key: string]: unknown;
};

export type NormalizedQuestion = {
  id: number | string;
  text: string;
  answers: string[];
  correctAnswer: string;
  correctAnswerIndex: number;
  difficulty: Difficulty;
  category: string;
  premium: boolean;
  explanation?: string;
  tags: string[];
};

export type QuestionSourceModule =
  | RawQuestion[]
  | {
      default?: RawQuestion[];
    };

export type QuestionContext = {
  keys: () => string[];
  (key: string): unknown;
};

export type DifficultyBreakdown = Record<Difficulty, number>;

export type QuestionCategoryMetadata = {
  key: string;
  displayName: string;
  description?: string;
  icon: string;
  premium: boolean;
  featured?: boolean;
  color?: string;
};

export type QuestionPackStats = {
  total: number;
  premium: number;
  free: number;
  difficulty: DifficultyBreakdown;
  packCount: number;
  emptyPackCount: number;
};

export type QuestionRegistryIssueType =
  | "empty-pack"
  | "normalization-error"
  | "duplicate-id"
  | "duplicate-text"
  | "category-mismatch";

export type QuestionRegistryIssue = {
  type: QuestionRegistryIssueType;
  category: string;
  fileName?: string;
  questionId?: number | string;
  message: string;
};

export type RegisteredQuestionPack = {
  id: string;
  fileName: string;
  label: string;
  raw: NormalizedQuestion[];
  questionCount: number;
  valid: boolean;
  error?: string;
  packFiles?: string[];
  packCount?: number;
  metadata: QuestionCategoryMetadata;
  stats: QuestionPackStats;
  issues: QuestionRegistryIssue[];
};


