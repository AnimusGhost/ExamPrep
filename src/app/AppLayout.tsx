import { ReactNode } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useSettings } from '../lib/settings';
import ToastHost from '../components/ToastHost';
import { useAuth } from '../lib/firebase/auth';
import { useSync } from '../lib/sync/syncManager';
import { useEffect, useState } from 'react';
import { fetchUserProfile } from '../lib/firebase/firestore';

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
  const { state, logout } = useAuth();
  const { status } = useSync();
  const [roles, setRoles] = useState<{ instructor?: boolean; admin?: boolean }>({});

  useEffect(() => {
    const load = async () => {
      if (!state.user) return;
      const profile = await fetchUserProfile(state.user.uid);
      setRoles(profile?.roles ?? {});
    };
    load();
  }, [state.user]);

  const syncLabel = settings.cloudMode
    ? status === 'syncing'
      ? 'Syncing…'
      : status === 'error'
        ? 'Sync error'
        : status === 'offline'
          ? 'Offline'
          : 'Synced'
    : 'Local only';

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
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">{syncLabel}</span>
            {state.user ? (
              <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {state.user.photoURL ? (
                  <img src={state.user.photoURL} alt="" className="h-6 w-6 rounded-full" />
                ) : (
                  <span className="h-6 w-6 rounded-full bg-brand-200 text-brand-700 flex items-center justify-center">
                    {state.user.email?.[0]?.toUpperCase() ?? 'U'}
                  </span>
                )}
                <Link to="/account" className="text-xs text-slate-600">
                  {state.user.email}
                </Link>
                <button className="text-xs text-rose-600" onClick={() => logout()}>
                  Logout
                </button>
              </div>
            ) : (
              <Link className="rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white" to="/auth">
                Sign in
              </Link>
            )}
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
            {roles.instructor && (
              <NavLink
                to="/instructor"
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                    isActive ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                Instructor
              </NavLink>
            )}
            {roles.admin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                    isActive ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                Admin
              </NavLink>
            )}
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
