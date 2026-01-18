import { Link } from 'react-router-dom';
import Panel from '../components/Panel';
import Button from '../components/Button';
import StatCard from '../components/StatCard';
import { useProgress } from '../lib/progress';
import { useSettings } from '../lib/settings';
import { getQuestionBank } from '../data/questionBank';

const Dashboard = () => {
  const { summary } = useProgress();
  const { settings } = useSettings();
  const questionCount = getQuestionBank().length;

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Panel>
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Dashboard</p>
              <h2 className="mt-2 text-3xl font-semibold text-ink-900 dark:text-white">Practice with confidence.</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-300">
                Build payroll accuracy across calculations, compliance, software workflows, and customer scenarios.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button as={Link} to="/exam" variant="primary">
                Start Timed Exam
              </Button>
              <Button as={Link} to="/practice" variant="secondary">
                Practice by Topic
              </Button>
              <Button as={Link} to="/progress" variant="ghost">
                My Progress
              </Button>
              <Button as={Link} to="/bank" variant="ghost">
                Question Bank
              </Button>
              <Button as={Link} to="/calculator" variant="ghost">
                Calculator
              </Button>
              <Button as={Link} to="/settings" variant="ghost">
                Settings
              </Button>
            </div>
            <div className="rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm text-brand-700 dark:border-brand-800/60 dark:bg-brand-900/30 dark:text-brand-100">
              <strong>Readiness estimate:</strong> {summary.readiness}% based on your last {summary.attempts} sessions.
              {settings.funMode && (
                <span className="ml-2 block text-brand-600 dark:text-brand-200">
                  Memory cue: "Payroll is a rhythm—set your cadence and follow the beat."
                </span>
              )}
            </div>
          </div>
        </Panel>
        <div className="grid gap-4">
          <StatCard label="Current streak" value={`${summary.streak} days`} helper="Keep the momentum going." />
          <StatCard label="Last score" value={`${summary.lastScore}%`} helper="Last timed or practice session." />
          <StatCard label="Best score" value={`${summary.bestScore}%`} helper="Your personal record." />
          <StatCard label="Question bank size" value={`${questionCount}`} helper="Across 5 domains." />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Panel>
          <h3 className="card-title">Practice pathways</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Drill by domain, difficulty, or question type. Build a session with instant feedback or review later.
          </p>
        </Panel>
        <Panel>
          <h3 className="card-title">Exam-day simulation</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Use the two-panel proctor layout, keyboard shortcuts, and 60-minute timer to mirror the real exam.
          </p>
        </Panel>
        <Panel>
          <h3 className="card-title">Progress analytics</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Track scores over time, see your weakest domains, and generate a remediation plan automatically.
          </p>
        </Panel>
      </section>
    </div>
  );
};

export default Dashboard;
