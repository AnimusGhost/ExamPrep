export type Domain =
  | 'Payroll Procedures and Calculations'
  | 'Tax Laws and Regulations'
  | 'Compliance and Recordkeeping'
  | 'Payroll Software and Systems'
  | 'Ethical Considerations and Customer Service';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type QuestionType = 'mcq' | 'msq' | 'numeric' | 'fill' | 'order' | 'match';

export type BaseQuestion = {
  id: string;
  domain: Domain;
  difficulty: Difficulty;
  type: QuestionType;
  prompt: string;
  explanation: string;
  tags?: string[];
  scenario?: boolean;
};

export type McqQuestion = BaseQuestion & {
  type: 'mcq';
  options: string[];
  correctIndex: number;
};

export type MsqQuestion = BaseQuestion & {
  type: 'msq';
  options: string[];
  correctIndices: number[];
};

export type NumericQuestion = BaseQuestion & {
  type: 'numeric';
  correctValue: number;
  tolerance: number;
  unitHint?: string;
};

export type FillQuestion = BaseQuestion & {
  type: 'fill';
  correctAnswer: string;
};

export type OrderQuestion = BaseQuestion & {
  type: 'order';
  options: string[];
  correctOrder: number[];
};

export type MatchQuestion = BaseQuestion & {
  type: 'match';
  rows: string[];
  options: string[];
  correctMatches: number[];
};

export type Question =
  | McqQuestion
  | MsqQuestion
  | NumericQuestion
  | FillQuestion
  | OrderQuestion
  | MatchQuestion;

export type Answer =
  | { type: 'mcq'; value: number | null }
  | { type: 'msq'; value: number[] }
  | { type: 'numeric'; value: number | null }
  | { type: 'fill'; value: string }
  | { type: 'order'; value: number[] }
  | { type: 'match'; value: number[] };

export type QuestionAttempt = {
  seen: number;
  correct: number;
  lastMissed?: string;
};
