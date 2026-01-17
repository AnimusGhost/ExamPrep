import { AttemptSummary } from '../../lib/progress';
import { Domain } from '../../types/questions';

export const ScoreLineChart = ({ attempts }: { attempts: AttemptSummary[] }) => {
  const points = attempts
    .slice()
    .reverse()
    .map((attempt, index) => ({ x: index * 60 + 20, y: 120 - attempt.score }));
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`).join(' ');

  return (
    <svg viewBox="0 0 400 140" className="h-36 w-full">
      <rect width="400" height="140" rx="16" fill="#f8fafc" />
      <path d="M20,120 L380,120" stroke="#e2e8f0" strokeWidth="2" />
      {points.length > 1 && <path d={path} stroke="#3b6bff" strokeWidth="3" fill="none" />}
      {points.map((point) => (
        <circle key={`${point.x}-${point.y}`} cx={point.x} cy={point.y} r="4" fill="#1d4ed8" />
      ))}
    </svg>
  );
};

export const RollingAverageChart = ({ attempts }: { attempts: AttemptSummary[] }) => {
  const sorted = attempts.slice().reverse();
  const averages = sorted.map((attempt, index) => {
    const window = sorted.slice(Math.max(0, index - 2), index + 1);
    const avg = window.reduce((acc, item) => acc + item.score, 0) / window.length;
    return { x: index * 60 + 20, y: 120 - avg };
  });
  const path = averages.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`).join(' ');
  return (
    <svg viewBox="0 0 400 140" className="h-36 w-full">
      <rect width="400" height="140" rx="16" fill="#f8fafc" />
      <path d="M20,120 L380,120" stroke="#e2e8f0" strokeWidth="2" />
      {averages.length > 1 && <path d={path} stroke="#14b8a6" strokeWidth="3" fill="none" />}
      {averages.map((point) => (
        <circle key={`${point.x}-${point.y}`} cx={point.x} cy={point.y} r="4" fill="#0f766e" />
      ))}
    </svg>
  );
};

export const BarChart = ({ data }: { data: { label: string; value: number }[] }) => {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div key={item.label} className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{item.label}</span>
            <span>{item.value}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-brand-500" style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export const domainAccuracyData = (attempts: AttemptSummary[]): { label: string; value: number }[] => {
  const domains: Record<Domain, { correct: number; total: number }> = {
    'Payroll Procedures and Calculations': { correct: 0, total: 0 },
    'Tax Laws and Regulations': { correct: 0, total: 0 },
    'Compliance and Recordkeeping': { correct: 0, total: 0 },
    'Payroll Software and Systems': { correct: 0, total: 0 },
    'Ethical Considerations and Customer Service': { correct: 0, total: 0 }
  };

  attempts.forEach((attempt) => {
    Object.entries(attempt.domainBreakdown).forEach(([domain, stats]) => {
      const key = domain as Domain;
      domains[key].correct += stats.correct;
      domains[key].total += stats.total;
    });
  });

  return Object.entries(domains).map(([label, stats]) => ({
    label,
    value: stats.total ? Math.round((stats.correct / stats.total) * 100) : 0
  }));
};
