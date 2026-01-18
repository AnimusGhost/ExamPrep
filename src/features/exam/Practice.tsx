import { useState } from 'react';
import Panel from '../../components/Panel';
import Button from '../../components/Button';
import QuestionRenderer from './QuestionRenderer';
import { buildPractice } from '../../lib/examGenerator';
import { defaultAnswer, isCorrect, formatAnswer, correctAnswerLabel } from '../../lib/questions';
import { Question, Answer, Domain, QuestionType, Difficulty } from '../../types/questions';
import { useProgress } from '../../lib/progress';
import { useSettings } from '../../lib/settings';
import { useToast } from '../../lib/toast';
import { getQuestionBank } from '../../data/questionBank';
import { clearStudySet, loadStudySet, saveStudySet } from '../../lib/studySet';
import { Link } from 'react-router-dom';
import { useSync } from '../../lib/sync/syncManager';

const allDomains: Domain[] = [
  'Payroll Procedures and Calculations',
  'Tax Laws and Regulations',
  'Compliance and Recordkeeping',
  'Payroll Software and Systems',
  'Ethical Considerations and Customer Service'
];

const allTypes: QuestionType[] = ['mcq', 'msq', 'numeric', 'fill', 'order', 'match'];
const allDifficulty: Difficulty[] = ['Easy', 'Medium', 'Hard'];

const Practice = () => {
  const { settings } = useSettings();
  const { recordAttempt, state } = useProgress();
  const { push } = useToast();
  const { queueAttempt } = useSync();
  const [config, setConfig] = useState({
    count: 10,
    domains: allDomains,
    types: allTypes,
    difficulty: allDifficulty,
    immediateFeedback: true,
    repeatMissed: false
  });
  const [questions, setQuestions] = useState<Question[]>(() => buildPractice({
    count: 10,
    domains: allDomains,
    types: allTypes,
    difficulty: allDifficulty
  }));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [showSummary, setShowSummary] = useState(false);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentQuestion.id] ?? defaultAnswer(currentQuestion);

  const updateAnswer = (answer: Answer) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }));
  };

  const startSession = () => {
    const studySet = loadStudySet();
    let pool = getQuestionBank();
    if (studySet.length) {
      pool = pool.filter((question) => studySet.includes(question.id));
      clearStudySet();
    } else if (config.repeatMissed) {
      const missedIds = Object.entries(state.statsByQuestion)
        .filter(([, stats]) => stats.seen > 0 && stats.correct < stats.seen)
        .map(([id]) => id);
      pool = pool.filter((question) => missedIds.includes(question.id));
    }
    const nextQuestions = buildPractice(
      {
        count: config.count,
        domains: studySet.length ? allDomains : config.domains,
        types: studySet.length ? allTypes : config.types,
        difficulty: studySet.length ? allDifficulty : config.difficulty,
        repeatMissed: config.repeatMissed
      },
      pool
    );
    setQuestions(nextQuestions);
    setCurrentIndex(0);
    setAnswers({});
    setShowSummary(false);
    if (settings.funMode) push('Practice session loaded. Stay curious.');
  };

  const submitPractice = () => {
    const scored = questions.map((question) => ({
      question,
      answer: answers[question.id] ?? defaultAnswer(question),
      correct: isCorrect(question, answers[question.id] ?? defaultAnswer(question))
    }));
    const totalCorrect = scored.filter((item) => item.correct).length;
    const percent = Math.round((totalCorrect / questions.length) * 100);
    const breakdown = questions.reduce((acc, question, index) => {
      const domain = question.domain;
      const correct = scored[index].correct ? 1 : 0;
      acc[domain] = acc[domain] || { correct: 0, total: 0 };
      acc[domain].correct += correct;
      acc[domain].total += 1;
      return acc;
    }, {} as Record<Domain, { correct: number; total: number }>);

    recordAttempt(
      {
        id: `${Date.now()}`,
        date: new Date().toISOString(),
        mode: 'practice',
        score: percent,
        durationMinutes: 0,
        domainBreakdown: breakdown
      },
      scored.reduce((acc, item) => {
        const prev = acc[item.question.id] ?? { seen: 0, correct: 0 };
        acc[item.question.id] = {
          seen: prev.seen + 1,
          correct: prev.correct + (item.correct ? 1 : 0),
          lastMissed: item.correct ? prev.lastMissed : new Date().toISOString()
        };
        return acc;
      }, {} as Record<string, { seen: number; correct: number; lastMissed?: string }>)
    );
    if (settings.cloudMode) {
      queueAttempt({
        mode: 'practice',
        score: percent,
        correct: totalCorrect,
        total: questions.length,
        domainBreakdown: breakdown,
        answers: scored.map((item) => ({ id: item.question.id, correct: item.correct }))
      });
    }

    setShowSummary(true);
  };

  const showFeedback = config.immediateFeedback && !showSummary;
  const answerCorrect = isCorrect(currentQuestion, currentAnswer);

  return (
    <div className="flex flex-col gap-6">
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Topic Practice</p>
            <h2 className="text-2xl font-semibold text-ink-900">Build your practice set</h2>
          </div>
          <Button variant="primary" onClick={startSession}>
            Start Practice
          </Button>
        </div>
        <div className="mt-4">
          <Button
            variant="secondary"
            onClick={() => {
              const weakest = allDomains
                .map((domain) => {
                  const questions = getQuestionBank().filter((question) => question.domain === domain);
                  const totals = questions.reduce(
                    (acc, question) => {
                      const stats = state.statsByQuestion[question.id];
                      if (stats) {
                        acc.total += stats.seen;
                        acc.correct += stats.correct;
                      }
                      return acc;
                    },
                    { total: 0, correct: 0 }
                  );
                  const accuracy = totals.total ? totals.correct / totals.total : 0;
                  return { domain, accuracy };
                })
                .sort((a, b) => a.accuracy - b.accuracy)
                .slice(0, 2)
                .map((item) => item.domain);
              setConfig((prev) => ({ ...prev, domains: weakest.length ? weakest : prev.domains }));
            }}
          >
            Smart Practice: Weakest Areas
          </Button>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div>
            <label className="label">Number of questions</label>
            <input
              className="input"
              type="number"
              min={5}
              max={50}
              value={config.count}
              onChange={(event) => setConfig((prev) => ({ ...prev, count: Number(event.target.value) }))}
            />
          </div>
          <div>
            <label className="label">Instant feedback</label>
            <select
              className="input"
              value={config.immediateFeedback ? 'yes' : 'no'}
              onChange={(event) => setConfig((prev) => ({ ...prev, immediateFeedback: event.target.value === 'yes' }))}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div>
            <label className="label">Repeat missed questions only</label>
            <select
              className="input"
              value={config.repeatMissed ? 'yes' : 'no'}
              onChange={(event) => setConfig((prev) => ({ ...prev, repeatMissed: event.target.value === 'yes' }))}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div>
            <label className="label">Domains</label>
            <div className="mt-2 space-y-1">
              {allDomains.map((domain) => (
                <label key={domain} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={config.domains.includes(domain)}
                    onChange={(event) =>
                      setConfig((prev) => ({
                        ...prev,
                        domains: event.target.checked
                          ? [...prev.domains, domain]
                          : prev.domains.filter((item) => item !== domain)
                      }))
                    }
                  />
                  {domain}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Difficulty</label>
            <div className="mt-2 space-y-1">
              {allDifficulty.map((difficulty) => (
                <label key={difficulty} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={config.difficulty.includes(difficulty)}
                    onChange={(event) =>
                      setConfig((prev) => ({
                        ...prev,
                        difficulty: event.target.checked
                          ? [...prev.difficulty, difficulty]
                          : prev.difficulty.filter((item) => item !== difficulty)
                      }))
                    }
                  />
                  {difficulty}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Question types</label>
            <div className="mt-2 space-y-1">
              {allTypes.map((type) => (
                <label key={type} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={config.types.includes(type)}
                    onChange={(event) =>
                      setConfig((prev) => ({
                        ...prev,
                        types: event.target.checked ? [...prev.types, type] : prev.types.filter((item) => item !== type)
                      }))
                    }
                  />
                  {type.toUpperCase()}
                </label>
              ))}
            </div>
          </div>
        </div>
      </Panel>

      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div aria-live="polite">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Question {currentIndex + 1}</p>
            <h3 className="mt-2 text-lg font-semibold text-ink-900">{currentQuestion.prompt}</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="tag tag-domain">{currentQuestion.domain}</span>
              <span className="tag tag-difficulty">{currentQuestion.difficulty}</span>
              <span className="tag tag-type">{currentQuestion.type.toUpperCase()}</span>
            </div>
          </div>
          <div className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            {currentIndex + 1} / {questions.length}
          </div>
        </div>

        <div className="mt-6">
          <QuestionRenderer question={currentQuestion} answer={currentAnswer} onAnswer={updateAnswer} disabled={showSummary} />
        </div>

        {showFeedback && (
          <div
            className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
              answerCorrect ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'
            }`}
          >
            {answerCorrect ? 'Correct! ' : 'Not quite. '} {currentQuestion.explanation}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
              disabled={currentIndex === 0}
            >
              Prev
            </Button>
            <Button
              variant="secondary"
              onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1))}
              disabled={currentIndex === questions.length - 1}
            >
              Next
            </Button>
          </div>
          <Button variant="primary" onClick={submitPractice}>
            Finish Session
          </Button>
        </div>
      </Panel>

      {showSummary && (
        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xl font-semibold text-ink-900">Practice Review</h3>
            <Button
              variant="secondary"
              as={Link}
              to="/practice"
              onClick={() => {
                const missed = questions
                  .filter((question) => !isCorrect(question, answers[question.id] ?? defaultAnswer(question)))
                  .map((question) => question.id);
                saveStudySet(missed);
              }}
            >
              Create study set
            </Button>
          </div>
          <div className="mt-4 space-y-4">
            {questions.map((question, index) => {
              const answer = answers[question.id] ?? defaultAnswer(question);
              const correct = isCorrect(question, answer);
              return (
                <div key={question.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-semibold text-slate-500">Q{index + 1}</span>
                    <span className={`tag ${correct ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {correct ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  <p className="mt-3 font-semibold text-slate-800">{question.prompt}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Your answer: <span className="font-semibold text-slate-800">{formatAnswer(question, answer)}</span>
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Correct answer: <span className="font-semibold text-slate-800">{correctAnswerLabel(question)}</span>
                  </p>
                  <p className="mt-2 text-sm text-slate-500">{question.explanation}</p>
                </div>
              );
            })}
          </div>
        </Panel>
      )}
    </div>
  );
};

export default Practice;
