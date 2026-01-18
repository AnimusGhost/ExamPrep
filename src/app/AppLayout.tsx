import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useSettings } from '../lib/settings';
import ToastHost from '../components/ToastHost';

const navItems = [
  { to: '/practice', label: 'Practice' },
  { to: '/exam', label: 'Timed Exam' },
  { to: '/bank', label: 'Question Bank' },
  { to: '/calculator', label: 'Calculator' },
  { to: '/progress', label: 'Progress' },
  { to: '/settings', label: 'Settings' }
];

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { settings, update } = useSettings();
  const themeLabel =
    settings.theme === 'system' ? 'System theme' : settings.theme === 'dark' ? 'Dark mode' : 'Light mode';
  const nextTheme =
    settings.theme === 'system' ? 'light' : settings.theme === 'light' ? 'dark' : 'system';

  return (
    <div
      className={`app-shell bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 ${
        settings.reducedMotion ? 'reduce-motion' : ''
      }`}
      style={{ fontSize: `${settings.fontScale}rem` }}
    >
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Payroll Technician</p>
            <h1 className="text-xl font-semibold text-ink-900 dark:text-white">Exam Prep Studio</h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200">
              {settings.funMode ? 'Fun Mode On' : 'Focused Mode'}
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
              Ready in {settings.defaultTimer}m
            </span>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
              {themeLabel}
            </span>
            <button
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={() => update({ theme: nextTheme })}
              type="button"
            >
              Theme: {nextTheme}
            </button>
          </div>
        </div>
        <nav className="border-t border-slate-100 bg-white/95 dark:border-slate-800 dark:bg-slate-950/90">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-brand-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
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
      <footer className="border-t border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:text-slate-400">
          <p>Designed for Payroll Technician candidates. Local-only data storage.</p>
          <p>Need a reset? Use Settings to export or reset your data.</p>
        </div>
      </footer>
      <ToastHost />
    </div>
  );
};

export default AppLayout;
