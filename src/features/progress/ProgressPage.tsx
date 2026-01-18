import Panel from '../../components/Panel';
import { useProgress } from '../../lib/progress';
import { BarChart, ScoreLineChart, RollingAverageChart, domainAccuracyData } from './Charts';
import Button from '../../components/Button';
import { Link } from 'react-router-dom';
import { getQuestionBank } from '../../data/questionBank';

const ProgressPage = () => {
  const { state } = useProgress();
  const attempts = state.attempts;
  const domainData = domainAccuracyData(attempts);
  const bank = getQuestionBank();
  const difficultyData = ['Easy', 'Medium', 'Hard'].map((difficulty) => {
    const questions = bank.filter((question) => question.difficulty === difficulty);
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
    const value = totals.total ? Math.round((totals.correct / totals.total) * 100) : 0;
    return { label: difficulty, value };
  });

  const weakAreas = domainData
    .filter((item) => item.value < 70)
    .map((item) => item.label)
    .slice(0, 3);

  const readinessScore = (() => {
    const coverage = Math.min(Object.keys(state.statsByQuestion).length / 120, 1);
    const overall = attempts.length
      ? attempts.reduce((acc, item) => acc + item.score, 0) / attempts.length / 100
      : 0;
    const stability = domainData.length
      ? 1 - domainData.reduce((acc, item) => acc + Math.abs(item.value - 70), 0) / (domainData.length * 100)
      : 0;
    return Math.round((overall * 0.5 + stability * 0.3 + coverage * 0.2) * 100);
  })();

  return (
    <div className="flex flex-col gap-6">
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Progress Analytics</p>
            <h2 className="text-2xl font-semibold text-ink-900 dark:text-white">Track improvement over time</h2>
          </div>
          <Button as={Link} to="/practice" variant="primary">
            Create study set
          </Button>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <h3 className="card-title">Scores over time</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Latest attempts: {attempts.length}</p>
          <div className="mt-4">
            {attempts.length ? <ScoreLineChart attempts={attempts.slice(0, 8)} /> : <div className="text-sm text-slate-500">No attempts yet.</div>}
          </div>
        </Panel>
        <Panel>
          <h3 className="card-title">Domain accuracy</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Aggregate accuracy by domain.</p>
          <div className="mt-4">
            <BarChart data={domainData} />
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <h3 className="card-title">Readiness score</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Blends accuracy, consistency, and coverage.</p>
          <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-900">
            <p className="text-3xl font-semibold text-ink-900 dark:text-white">{readinessScore}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Target 75+ before exam day.</p>
          </div>
        </Panel>
        <Panel>
          <h3 className="card-title">Difficulty breakdown</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Overall performance across difficulty levels.</p>
          <div className="mt-4">
            <BarChart data={difficultyData} />
          </div>
        </Panel>
        <Panel>
          <h3 className="card-title">Rolling average trend</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">3-attempt rolling average.</p>
          <div className="mt-4">
            {attempts.length ? <RollingAverageChart attempts={attempts.slice(0, 8)} /> : <div className="text-sm text-slate-500">No attempts yet.</div>}
          </div>
        </Panel>
        <Panel>
          <h3 className="card-title">Recommended next steps</h3>
          {weakAreas.length ? (
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {weakAreas.map((area) => (
                <li key={area} className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 dark:border-amber-900/60 dark:bg-amber-900/30">
                  Focus on {area} with targeted drills and flashcards.
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">You are trending strong across all domains. Keep consistency!</p>
          )}
          <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Build a remediation plan by launching a practice session filtered to missed items.
          </div>
        </Panel>
      </div>
    </div>
  );
};

export default ProgressPage;
