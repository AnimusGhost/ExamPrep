import { Question, Domain, Difficulty, QuestionType } from '../types/questions';
import { getQuestionBank } from '../data/questionBank';
import { sample } from './random';

const domainTargets: Domain[] = [
  'Payroll Procedures and Calculations',
  'Tax Laws and Regulations',
  'Compliance and Recordkeeping',
  'Payroll Software and Systems',
  'Ethical Considerations and Customer Service'
];

const typeTargets: QuestionType[] = [
  'mcq',
  'mcq',
  'mcq',
  'mcq',
  'mcq',
  'mcq',
  'mcq',
  'mcq',
  'mcq',
  'mcq',
  'mcq',
  'mcq',
  'mcq',
  'mcq',
  'msq',
  'msq',
  'msq',
  'msq',
  'msq',
  'msq',
  'numeric',
  'numeric',
  'numeric',
  'numeric',
  'numeric',
  'numeric',
  'numeric',
  'order',
  'order',
  'match'
];

export type PracticeConfig = {
  count: number;
  domains: Domain[];
  types: QuestionType[];
  difficulty: Difficulty[];
  repeatMissed?: boolean;
};

export const buildTimedExam = (seed?: string) => {
  const bank = getQuestionBank(seed);
  const selected: Question[] = [];

  domainTargets.forEach((domain, index) => {
    const count = [7, 6, 6, 5, 6][index];
    const pool = bank.filter((question) => question.domain === domain);
    selected.push(...sample(pool, count, seed ? `${seed}-${domain}` : undefined));
  });

  const withTypes: Question[] = [];
  typeTargets.forEach((type, index) => {
    const pool = selected.filter((question) => question.type === type);
    const fallback = bank.filter((question) => question.type === type);
    const chosen = pool.length ? pool[Math.floor(Math.random() * pool.length)] : fallback[index % fallback.length];
    withTypes.push(chosen);
  });

  const adjusted = withTypes.length === 30 ? withTypes : sample(bank, 30, seed);
  return sample(adjusted, 30, seed ? `${seed}-final` : undefined);
};

export const buildPractice = (config: PracticeConfig, source?: Question[]) => {
  const bank = source ?? getQuestionBank();
  const pool = bank.filter(
    (question) =>
      config.domains.includes(question.domain) &&
      config.types.includes(question.type) &&
      config.difficulty.includes(question.difficulty)
  );
  return sample(pool.length ? pool : bank, config.count);
};
