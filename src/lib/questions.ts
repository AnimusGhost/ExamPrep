import { Answer, Question } from '../types/questions';

export const defaultAnswer = (question: Question): Answer => {
  switch (question.type) {
    case 'mcq':
      return { type: 'mcq', value: null };
    case 'msq':
      return { type: 'msq', value: [] };
    case 'numeric':
      return { type: 'numeric', value: null };
    case 'fill':
      return { type: 'fill', value: '' };
    case 'order':
      return { type: 'order', value: question.correctOrder.map((_, index) => index) };
    case 'match':
      return { type: 'match', value: question.rows.map(() => 0) };
    default:
      return { type: 'mcq', value: null };
  }
};

export const isCorrect = (question: Question, answer: Answer): boolean => {
  switch (question.type) {
    case 'mcq':
      return answer.type === 'mcq' && answer.value === question.correctIndex;
    case 'msq':
      if (answer.type !== 'msq') return false;
      return (
        answer.value.length === question.correctIndices.length &&
        answer.value.every((value) => question.correctIndices.includes(value))
      );
    case 'numeric':
      if (answer.type !== 'numeric' || answer.value === null) return false;
      return Math.abs(answer.value - question.correctValue) <= question.tolerance;
    case 'fill':
      if (answer.type !== 'fill') return false;
      return answer.value.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
    case 'order':
      if (answer.type !== 'order') return false;
      return answer.value.every((value, index) => value === question.correctOrder[index]);
    case 'match':
      if (answer.type !== 'match') return false;
      return answer.value.every((value, index) => value === question.correctMatches[index]);
    default:
      return false;
  }
};

export const formatAnswer = (question: Question, answer: Answer) => {
  switch (question.type) {
    case 'mcq':
      return answer.type === 'mcq' && answer.value !== null ? question.options[answer.value] : 'No answer';
    case 'msq':
      return answer.type === 'msq'
        ? answer.value.map((index) => question.options[index]).join(', ')
        : 'No answer';
    case 'numeric':
      return answer.type === 'numeric' && answer.value !== null ? `${answer.value}` : 'No answer';
    case 'fill':
      return answer.type === 'fill' && answer.value ? answer.value : 'No answer';
    case 'order':
      return answer.type === 'order'
        ? answer.value.map((index) => question.options[index]).join(' → ')
        : 'No answer';
    case 'match':
      return answer.type === 'match'
        ? answer.value.map((matchIndex, row) => `${question.rows[row]} → ${question.options[matchIndex]}`).join('; ')
        : 'No answer';
    default:
      return 'No answer';
  }
};

export const correctAnswerLabel = (question: Question) => {
  switch (question.type) {
    case 'mcq':
      return question.options[question.correctIndex];
    case 'msq':
      return question.correctIndices.map((index) => question.options[index]).join(', ');
    case 'numeric':
      return `${question.correctValue} ${question.unitHint ?? ''}`.trim();
    case 'fill':
      return question.correctAnswer;
    case 'order':
      return question.correctOrder.map((index) => question.options[index]).join(' → ');
    case 'match':
      return question.correctMatches
        .map((matchIndex, row) => `${question.rows[row]} → ${question.options[matchIndex]}`)
        .join('; ');
    default:
      return '';
  }
};
