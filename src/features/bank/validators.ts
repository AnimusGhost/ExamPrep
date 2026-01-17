import { Question } from '../../types/questions';

export const validateQuestion = (question: Question) => {
  const errors: string[] = [];
  if (!question.id) errors.push('ID is required.');
  if (!question.prompt) errors.push('Prompt is required.');
  if (!question.explanation) errors.push('Explanation is required.');
  if (!question.domain) errors.push('Domain is required.');
  if (!question.type) errors.push('Question type is required.');

  if (question.type === 'mcq') {
    if (!question.options?.length) errors.push('MCQ options are required.');
    if (question.correctIndex === undefined) errors.push('MCQ correctIndex is required.');
  }
  if (question.type === 'msq') {
    if (!question.options?.length) errors.push('MSQ options are required.');
    if (!question.correctIndices?.length) errors.push('MSQ correctIndices are required.');
  }
  if (question.type === 'numeric') {
    if (question.correctValue === undefined) errors.push('Numeric correctValue is required.');
    if (question.tolerance === undefined) errors.push('Numeric tolerance is required.');
  }
  if (question.type === 'fill' && !question.correctAnswer) {
    errors.push('Fill correctAnswer is required.');
  }
  if (question.type === 'order') {
    if (!question.options?.length) errors.push('Order options are required.');
    if (!question.correctOrder?.length) errors.push('Order correctOrder is required.');
  }
  if (question.type === 'match') {
    if (!question.rows?.length) errors.push('Match rows are required.');
    if (!question.options?.length) errors.push('Match options are required.');
    if (!question.correctMatches?.length) errors.push('Match correctMatches are required.');
  }

  return errors;
};
