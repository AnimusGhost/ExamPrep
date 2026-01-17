import { useEffect, useMemo, useState } from 'react';
import Panel from '../../components/Panel';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import QuestionRenderer from './QuestionRenderer';
import { buildTimedExam } from '../../lib/examGenerator';
import { defaultAnswer, isCorrect, formatAnswer, correctAnswerLabel } from '../../lib/questions';
import { Question, Answer, Domain } from '../../types/questions';
import { useSettings } from '../../lib/settings';
import { useProgress } from '../../lib/progress';
import { useToast } from '../../lib/toast';
import { saveStudySet } from '../../lib/studySet';
import { Link } from 'react-router-dom';

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const ExamSimulator = () => {
  const { settings } = useSettings();
  const { recordAttempt } = useProgress();
  const { push } = useToast();
  const [questions, setQuestions] = useState<Question[]>(() => buildTimedExam());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>(() => ({}));
  const [flagged, setFlagged] = useState<Set<string>>(() => new Set());
  const [secondsLeft, setSecondsLeft] = useState(settings.defaultTimer * 60);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  const answeredCount = useMemo(
    () => questions.filter((question) => answers[question.id] && !isBlankAnswer(answers[question.id])).length,
    [answers, questions]
  );

  useEffect(() => {
    if (showReview) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [showReview]);

  useEffect(() => {
    if (secondsLeft === 0 && !showReview) {
      setShowSubmit(true);
    }
  }, [secondsLeft, showReview]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1));
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      }
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        setShowSubmit(true);
      }
      if (event.altKey && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        toggleFlag(questions[currentIndex].id);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentIndex, questions]);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentQuestion.id] ?? defaultAnswer(currentQuestion);

  const updateAnswer = (answer: Answer) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }));
  };

  const toggleFlag = (id: string) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        if (settings.funMode) push('Flag cleared. Clean slate.');
      } else {
        next.add(id);
        if (settings.funMode) push('Flagged for follow-up. Sharp eyes!');
      }
      return next;
    });
  };

  const resetExam = () => {
    setQuestions(buildTimedExam());
    setCurrentIndex(0);
    setAnswers({});
    setFlagged(new Set());
    setSecondsLeft(settings.defaultTimer * 60);
    setShowReview(false);
    setShowSubmit(false);
    if (settings.funMode) push('New simulation loaded. Set your pace.');
  };

  const onSubmitExam = () => {
    const scored = questions.map((question) => ({
      question,
      answer: answers[question.id] ?? defaultAnswer(question),
      correct: isCorrect(question, answers[question.id] ?? defaultAnswer(question))
    }));
    const totalCorrect = scored.filter((item) => item.correct).length;
    const percent = Math.round((totalCorrect / questions.length) * 100);
    const breakdown = questions.reduce((acc, question, index) => {
      const domain = question.domain as Domain;
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
        mode: 'exam',
        score: percent,
        durationMinutes: Math.round((settings.defaultTimer * 60 - secondsLeft) / 60),
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

    setShowReview(true);
    setShowSubmit(false);
    if (settings.funMode) push('Exam complete. Great focus.');
  };

  const pass = useMemo(() => {
    const totalCorrect = questions.filter((question) =>
      isCorrect(question, answers[question.id] ?? defaultAnswer(question))
    ).length;
    const percent = Math.round((totalCorrect / questions.length) * 100);
    return percent >= settings.passThreshold;
  }, [answers, questions, settings.passThreshold]);

  const reviewSummary = useMemo(() => {
    const scored = questions.map((question) => ({
      question,
      correct: isCorrect(question, answers[question.id] ?? defaultAnswer(question))
    }));
    const totalCorrect = scored.filter((item) => item.correct).length;
    const percent = Math.round((totalCorrect / questions.length) * 100);
    const domainBreakdown = scored.reduce((acc, item) => {
      const domain = item.question.domain;
      acc[domain] = acc[domain] || { correct: 0, total: 0 };
      acc[domain].correct += item.correct ? 1 : 0;
      acc[domain].total += 1;
      return acc;
    }, {} as Record<Domain, { correct: number; total: number }>);
    return { totalCorrect, percent, domainBreakdown };
  }, [answers, questions]);

  return (
    <div className="flex flex-col gap-6">
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Timed Exam Simulator</p>
            <h2 className="text-2xl font-semibold text-ink-900">Payroll Technician Exam</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
              Time left: {formatTime(secondsLeft)}
            </div>
            <div className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
              Answered: {answeredCount}/{questions.length}
            </div>
            <Button variant="ghost" onClick={resetExam}>
              Reset
            </Button>
          </div>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <Panel className="h-fit lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Navigation</h3>
            <button className="text-xs text-brand-600 lg:hidden" onClick={() => setNavOpen(!navOpen)}>
              {navOpen ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className={`mt-4 space-y-3 ${navOpen ? 'block' : 'hidden'} lg:block`}>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((question, index) => {
                const answered = answers[question.id] && !isBlankAnswer(answers[question.id]);
                const isFlagged = flagged.has(question.id);
                return (
                  <button
                    key={question.id}
                    className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                      index === currentIndex
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : isFlagged
                          ? 'border-rose-500 bg-rose-50 text-rose-700'
                          : answered
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-white text-slate-500'
                    }`}
                    onClick={() => setCurrentIndex(index)}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            <div className="space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Answered
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-400" /> Flagged
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-300" /> Unanswered
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-brand-500"
                style={{ width: `${(answeredCount / questions.length) * 100}%` }}
              />
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
                {flagged.has(currentQuestion.id) && <span className="tag bg-rose-100 text-rose-700">Flagged</span>}
              </div>
            </div>
            {settings.funMode && (
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Memory hint: anchor each figure before you move on.
              </div>
            )}
          </div>

          <div className="mt-6">
            <QuestionRenderer question={currentQuestion} answer={currentAnswer} onAnswer={updateAnswer} disabled={showReview} />
          </div>

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
              <Button variant="ghost" onClick={() => toggleFlag(currentQuestion.id)}>
                {flagged.has(currentQuestion.id) ? 'Unflag' : 'Flag'}
              </Button>
            </div>
            <Button variant="primary" onClick={() => setShowSubmit(true)}>
              Submit
            </Button>
          </div>
        </Panel>
      </div>

      {showReview && (
        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-ink-900">Exam Review</h3>
              <p className="text-sm text-slate-500">Review your answers and remediation cues.</p>
            </div>
            <div className={`rounded-full px-4 py-2 text-sm font-semibold ${pass ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {pass ? 'PASS' : 'FAIL'}
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Score</p>
              <p className="mt-2 text-2xl font-semibold text-ink-900">{reviewSummary.percent}%</p>
              <p className="text-xs text-slate-500">
                {reviewSummary.totalCorrect} of {questions.length} correct
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600 md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Domain breakdown</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {Object.entries(reviewSummary.domainBreakdown).map(([domain, stats]) => (
                  <div key={domain} className="flex items-center justify-between text-xs text-slate-600">
                    <span>{domain}</span>
                    <span className="font-semibold text-slate-800">
                      {stats.correct}/{stats.total} ({Math.round((stats.correct / stats.total) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                const missed = questions
                  .filter((question) => !isCorrect(question, answers[question.id] ?? defaultAnswer(question)) || flagged.has(question.id))
                  .map((question) => question.id);
                saveStudySet(missed);
              }}
              as={Link}
              to="/practice"
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
                    <span className="tag tag-domain">{question.domain}</span>
                    <span className={`tag ${correct ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {correct ? 'Correct' : 'Incorrect'}
                    </span>
                    {flagged.has(question.id) && <span className="tag bg-rose-100 text-rose-700">Flagged</span>}
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

      <Modal title="Submit exam?" open={showSubmit} onClose={() => setShowSubmit(false)}>
        <p className="text-sm text-slate-600">
          You have answered {answeredCount} of {questions.length} questions. Submitting will lock your responses and
          generate a review summary.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="primary" onClick={onSubmitExam}>
            Submit now
          </Button>
          <Button variant="secondary" onClick={() => setShowSubmit(false)}>
            Keep working
          </Button>
        </div>
      </Modal>
    </div>
  );
};

const isBlankAnswer = (answer?: Answer) => {
  if (!answer) return true;
  if (answer.type === 'mcq') return answer.value === null;
  if (answer.type === 'msq') return answer.value.length === 0;
  if (answer.type === 'numeric') return answer.value === null;
  if (answer.type === 'fill') return answer.value.trim().length === 0;
  return false;
};

export default ExamSimulator;
