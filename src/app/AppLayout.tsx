import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useSettings } from '../lib/settings';
import ToastHost from '../components/ToastHost';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/exam', label: 'Timed Exam' },
  { to: '/practice', label: 'Practice' },
  { to: '/flashcards', label: 'Flashcards' },
  { to: '/progress', label: 'Progress' },
  { to: '/bank', label: 'Question Bank' },
  { to: '/settings', label: 'Settings' }
];

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { settings } = useSettings();

  return (
    <div
      className={`app-shell bg-slate-50 text-slate-900 ${settings.reducedMotion ? 'reduce-motion' : ''}`}
      style={{ fontSize: `${settings.fontScale}rem` }}
    >
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Payroll Technician</p>
            <h1 className="text-xl font-semibold text-ink-900">Exam Prep Studio</h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {settings.funMode ? 'Fun Mode On' : 'Focused Mode'}
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Ready in {settings.defaultTimer}m
            </span>
          </div>
        </div>
        <nav className="border-t border-slate-100 bg-white/95">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                    isActive ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">{children}</main>
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>Designed for Payroll Technician candidates. Local-only data storage.</p>
          <p>Need a reset? Use Settings → Export/Import to back up progress.</p>
        </div>
      </footer>
      <ToastHost />
    </div>
  );
};

export default AppLayout;
