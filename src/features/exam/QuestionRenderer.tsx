import { Answer, Question } from '../../types/questions';

const QuestionRenderer = ({
  question,
  answer,
  onAnswer,
  disabled
}: {
  question: Question;
  answer: Answer;
  onAnswer: (answer: Answer) => void;
  disabled?: boolean;
}) => {
  if (question.type === 'mcq') {
    return (
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <label key={option} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name={question.id}
              disabled={disabled}
              checked={answer.type === 'mcq' && answer.value === index}
              onChange={() => onAnswer({ type: 'mcq', value: index })}
            />
            {option}
          </label>
        ))}
      </div>
    );
  }

  if (question.type === 'msq') {
    const selected = answer.type === 'msq' ? answer.value : [];
    const toggle = (index: number) => {
      const next = selected.includes(index)
        ? selected.filter((value) => value !== index)
        : [...selected, index];
      onAnswer({ type: 'msq', value: next });
    };
    return (
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <label key={option} className="flex items-center gap-2 text-sm">
            <input type="checkbox" disabled={disabled} checked={selected.includes(index)} onChange={() => toggle(index)} />
            {option}
          </label>
        ))}
      </div>
    );
  }

  if (question.type === 'numeric') {
    return (
      <div className="space-y-2">
        <label className="label">Answer {question.unitHint ? `(${question.unitHint})` : ''}</label>
        <input
          type="number"
          className="input"
          disabled={disabled}
          value={answer.type === 'numeric' && answer.value !== null ? answer.value : ''}
          onChange={(event) => onAnswer({ type: 'numeric', value: event.target.value ? Number(event.target.value) : null })}
        />
        <p className="text-xs text-slate-500">Tolerance: ±{question.tolerance}</p>
      </div>
    );
  }

  if (question.type === 'fill') {
    return (
      <div className="space-y-2">
        <label className="label">Answer</label>
        <input
          className="input"
          disabled={disabled}
          value={answer.type === 'fill' ? answer.value : ''}
          onChange={(event) => onAnswer({ type: 'fill', value: event.target.value })}
        />
      </div>
    );
  }

  if (question.type === 'order') {
    return (
      <div className="space-y-3">
        {question.correctOrder.map((_, position) => (
          <div key={`${question.id}-${position}`} className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">#{position + 1}</span>
            <select
              className="input"
              disabled={disabled}
              value={answer.type === 'order' ? answer.value[position] : 0}
              onChange={(event) => {
                const next = answer.type === 'order' ? [...answer.value] : [...question.correctOrder];
                next[position] = Number(event.target.value);
                onAnswer({ type: 'order', value: next });
              }}
            >
              {question.options.map((option, optionIndex) => (
                <option key={option} value={optionIndex}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    );
  }

  if (question.type === 'match') {
    return (
      <div className="space-y-3">
        {question.rows.map((row, rowIndex) => (
          <div key={row} className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="text-sm font-medium text-slate-700 sm:w-48">{row}</span>
            <select
              className="input"
              disabled={disabled}
              value={answer.type === 'match' ? answer.value[rowIndex] : 0}
              onChange={(event) => {
                const next = answer.type === 'match' ? [...answer.value] : question.rows.map(() => 0);
                next[rowIndex] = Number(event.target.value);
                onAnswer({ type: 'match', value: next });
              }}
            >
              {question.options.map((option, optionIndex) => (
                <option key={option} value={optionIndex}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default QuestionRenderer;
