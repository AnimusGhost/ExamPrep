import Panel from './Panel';

const StatCard = ({ label, value, helper }: { label: string; value: string; helper: string }) => (
  <Panel>
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
    <p className="mt-2 text-3xl font-semibold text-ink-900">{value}</p>
    <p className="mt-2 text-sm text-slate-500">{helper}</p>
  </Panel>
);

export default StatCard;
