import { useMemo, useState } from 'react';
import Panel from '../../components/Panel';
import Button from '../../components/Button';
import { getQuestionBank } from '../../data/questionBank';
import { Question } from '../../types/questions';
import { loadFromStorage, saveToStorage } from '../../lib/storage';
import { useSettings } from '../../lib/settings';
import { validateQuestion } from './validators';

const QuestionBankPage = () => {
  const { settings } = useSettings();
  const stored = loadFromStorage<Question[]>('customBank', []);
  const [customBank, setCustomBank] = useState<Question[]>(stored);
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [editQuestion, setEditQuestion] = useState<Question | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [exportPayload, setExportPayload] = useState('');

  const baseBank = getQuestionBank();
  const mergedBank = useMemo(() => [...customBank, ...baseBank], [customBank, baseBank]);

  const filtered = mergedBank.filter((question) => {
    const matchesSearch = question.prompt.toLowerCase().includes(search.toLowerCase());
    const matchesDomain = selectedDomain === 'All' || question.domain === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  const startEdit = (question?: Question) => {
    setEditQuestion(
      question ?? {
        id: `custom-${Date.now()}`,
        type: 'mcq',
        domain: 'Payroll Procedures and Calculations',
        difficulty: 'Easy',
        prompt: '',
        explanation: '',
        options: ['Option A', 'Option B'],
        correctIndex: 0
      }
    );
    setValidationErrors([]);
  };

  const buildQuestionForType = (type: Question['type'], previous: Question): Question => {
    const base = {
      id: previous.id,
      domain: previous.domain,
      difficulty: previous.difficulty,
      prompt: previous.prompt,
      explanation: previous.explanation,
      tags: previous.tags,
      scenario: previous.scenario
    };

    const options = 'options' in previous && Array.isArray(previous.options) ? previous.options : ['Option A', 'Option B'];

    switch (type) {
      case 'mcq':
        return { ...base, type, options, correctIndex: 'correctIndex' in previous ? previous.correctIndex : 0 };
      case 'msq':
        return { ...base, type, options, correctIndices: 'correctIndices' in previous ? previous.correctIndices : [0] };
      case 'numeric':
        return {
          ...base,
          type,
          correctValue: 'correctValue' in previous ? previous.correctValue : 0,
          tolerance: 'tolerance' in previous ? previous.tolerance : 0.5,
          unitHint: 'unitHint' in previous ? previous.unitHint : undefined
        };
      case 'fill':
        return { ...base, type, correctAnswer: 'correctAnswer' in previous ? previous.correctAnswer : '' };
      case 'order':
        return { ...base, type, options, correctOrder: 'correctOrder' in previous ? previous.correctOrder : [0, 1] };
      case 'match':
        return {
          ...base,
          type,
          rows: 'rows' in previous && Array.isArray(previous.rows) ? previous.rows : ['Row A', 'Row B'],
          options,
          correctMatches: 'correctMatches' in previous ? previous.correctMatches : [0, 1]
        };
      default:
        return previous;
    }
  };

  const saveQuestion = () => {
    if (!editQuestion) return;
    const errors = validateQuestion(editQuestion as Question);
    if (errors.length) {
      setValidationErrors(errors);
      return;
    }
    const updated = customBank.some((item) => item.id === editQuestion.id)
      ? customBank.map((item) => (item.id === editQuestion.id ? editQuestion : item))
      : [editQuestion, ...customBank];
    setCustomBank(updated);
    saveToStorage('customBank', updated);
    setEditQuestion(null);
  };

  const removeQuestion = (id: string) => {
    const updated = customBank.filter((item) => item.id !== id);
    setCustomBank(updated);
    saveToStorage('customBank', updated);
  };

  const exportCustomBank = () => {
    setExportPayload(JSON.stringify(customBank, null, 2));
  };

  return (
    <div className="flex flex-col gap-6">
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Question Bank</p>
            <h2 className="text-2xl font-semibold text-ink-900">Browse and refine questions</h2>
          </div>
          {settings.authorMode && (
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={exportCustomBank}>
                Export authored JSON
              </Button>
              <Button variant="primary" onClick={() => startEdit()}>
                Add question
              </Button>
            </div>
          )}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <input
            className="input"
            placeholder="Search questions"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select className="input" value={selectedDomain} onChange={(event) => setSelectedDomain(event.target.value)}>
            <option value="All">All domains</option>
            {Array.from(new Set(mergedBank.map((question) => question.domain))).map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </select>
        </div>
      </Panel>

      {settings.authorMode && exportPayload && (
        <Panel>
          <h3 className="card-title">Exported custom bank</h3>
          <textarea className="input mt-3 h-48" value={exportPayload} readOnly />
        </Panel>
      )}

      {editQuestion && settings.authorMode && (
        <Panel>
          <h3 className="card-title">Author Mode: Edit question</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">ID</label>
              <input className="input" value={editQuestion.id} onChange={(event) => setEditQuestion({ ...editQuestion, id: event.target.value })} />
            </div>
            <div>
              <label className="label">Type</label>
              <select
                className="input"
                value={editQuestion.type}
                onChange={(event) =>
                  setEditQuestion((prev) =>
                    prev ? buildQuestionForType(event.target.value as Question['type'], prev) : prev
                  )
                }
              >
                <option value="mcq">MCQ</option>
                <option value="msq">MSQ</option>
                <option value="numeric">Numeric</option>
                <option value="fill">Fill</option>
                <option value="order">Order</option>
                <option value="match">Match</option>
              </select>
            </div>
            <div>
              <label className="label">Domain</label>
              <input className="input" value={editQuestion.domain} onChange={(event) => setEditQuestion({ ...editQuestion, domain: event.target.value as Question['domain'] })} />
            </div>
            <div>
              <label className="label">Difficulty</label>
              <select
                className="input"
                value={editQuestion.difficulty}
                onChange={(event) => setEditQuestion({ ...editQuestion, difficulty: event.target.value as Question['difficulty'] })}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="label">Prompt</label>
            <textarea className="input" rows={3} value={editQuestion.prompt} onChange={(event) => setEditQuestion({ ...editQuestion, prompt: event.target.value })} />
          </div>
          <div className="mt-4">
            <label className="label">Explanation</label>
            <textarea className="input" rows={3} value={editQuestion.explanation} onChange={(event) => setEditQuestion({ ...editQuestion, explanation: event.target.value })} />
          </div>
          <div className="mt-4">
            <label className="label">Options (comma separated for mcq/msq/order/match)</label>
            <input
              className="input"
              value={'options' in editQuestion && Array.isArray(editQuestion.options) ? editQuestion.options.join(', ') : ''}
              onChange={(event) => {
                const options = event.target.value.split(',').map((item) => item.trim());
                setEditQuestion({ ...editQuestion, options } as Question);
              }}
            />
          </div>
          {editQuestion.type === 'match' && (
            <div className="mt-4">
              <label className="label">Match rows (comma separated)</label>
              <input
                className="input"
                value={'rows' in editQuestion && Array.isArray(editQuestion.rows) ? editQuestion.rows.join(', ') : ''}
                onChange={(event) => {
                  const rows = event.target.value.split(',').map((item) => item.trim());
                  setEditQuestion({ ...editQuestion, rows } as Question);
                }}
              />
            </div>
          )}
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Correct answer (index or comma list)</label>
              <input
                className="input"
                value={
                  'correctIndex' in editQuestion
                    ? `${editQuestion.correctIndex}`
                    : 'correctIndices' in editQuestion
                      ? editQuestion.correctIndices.join(',')
                      : 'correctValue' in editQuestion
                        ? `${editQuestion.correctValue}`
                        : 'correctAnswer' in editQuestion
                          ? editQuestion.correctAnswer
                          : 'correctOrder' in editQuestion
                            ? editQuestion.correctOrder.join(',')
                            : 'correctMatches' in editQuestion
                              ? editQuestion.correctMatches.join(',')
                              : ''
                }
                onChange={(event) => {
                  const value = event.target.value;
                  let updated: Question = { ...editQuestion } as Question;
                  if (editQuestion.type === 'mcq') {
                    updated = { ...editQuestion, correctIndex: Number(value) } as Question;
                  } else if (editQuestion.type === 'msq') {
                    updated = { ...editQuestion, correctIndices: value.split(',').map((item) => Number(item)) } as Question;
                  } else if (editQuestion.type === 'numeric') {
                    updated = { ...editQuestion, correctValue: Number(value), tolerance: editQuestion.tolerance ?? 0.5 } as Question;
                  } else if (editQuestion.type === 'fill') {
                    updated = { ...editQuestion, correctAnswer: value } as Question;
                  } else if (editQuestion.type === 'order') {
                    updated = { ...editQuestion, correctOrder: value.split(',').map((item) => Number(item)) } as Question;
                  } else if (editQuestion.type === 'match') {
                    updated = { ...editQuestion, correctMatches: value.split(',').map((item) => Number(item)) } as Question;
                  }
                  setEditQuestion(updated);
                }}
              />
            </div>
            <div>
              <label className="label">Numeric tolerance / unit hint</label>
              <input
                className="input"
                value={'tolerance' in editQuestion ? editQuestion.tolerance ?? '' : ''}
                onChange={(event) => {
                  if (editQuestion.type === 'numeric') {
                    setEditQuestion({ ...editQuestion, tolerance: Number(event.target.value) } as Question);
                  }
                }}
              />
            </div>
          </div>
          {editQuestion.type === 'numeric' && (
            <div className="mt-4">
              <label className="label">Unit hint</label>
              <input
                className="input"
                value={editQuestion.unitHint ?? ''}
                onChange={(event) => setEditQuestion({ ...editQuestion, unitHint: event.target.value } as Question)}
              />
            </div>
          )}
          {validationErrors.length > 0 && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {validationErrors.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="primary" onClick={saveQuestion}>
              Save question
            </Button>
            <Button variant="secondary" onClick={() => setEditQuestion(null)}>
              Cancel
            </Button>
          </div>
        </Panel>
      )}

      <Panel>
        <div className="space-y-4">
          {filtered.map((question) => (
            <div key={question.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{question.type.toUpperCase()}</p>
                  <h3 className="mt-2 text-sm font-semibold text-slate-800">{question.prompt}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="tag tag-domain">{question.domain}</span>
                  <span className="tag tag-difficulty">{question.difficulty}</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-500">{question.explanation}</p>
              {settings.authorMode && customBank.some((item) => item.id === question.id) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => startEdit(question)}>
                    Edit
                  </Button>
                  <Button variant="ghost" onClick={() => removeQuestion(question.id)}>
                    Delete
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
};

export default QuestionBankPage;
