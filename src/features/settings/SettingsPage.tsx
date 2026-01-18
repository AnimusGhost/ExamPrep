import { useMemo, useState } from 'react';
import Panel from '../../components/Panel';
import Button from '../../components/Button';
import { useSettings } from '../../lib/settings';
import { exportStorage, importStorage } from '../../lib/storage';
import { getAnonymousId } from '../../lib/identity';

const SettingsPage = () => {
  const { settings, update } = useSettings();
  const [importPayload, setImportPayload] = useState('');
  const [exportPayload, setExportPayload] = useState('');
  const anonymousId = useMemo(() => getAnonymousId(), []);

  const handleExport = () => {
    setExportPayload(exportStorage());
  };

  const handleImport = () => {
    if (!importPayload.trim()) return;
    importStorage(importPayload);
    window.location.reload();
  };

  return (
    <div className="flex flex-col gap-6">
      <Panel>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Settings</p>
          <h2 className="text-2xl font-semibold text-ink-900 dark:text-white">Customize your study experience</h2>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Theme</label>
            <select className="input" value={settings.theme} onChange={(event) => update({ theme: event.target.value as typeof settings.theme })}>
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Default follows your system preference.</p>
          </div>
          <div>
            <label className="label">Fun Mode</label>
            <select className="input" value={settings.funMode ? 'on' : 'off'} onChange={(event) => update({ funMode: event.target.value === 'on' })}>
              <option value="off">Off</option>
              <option value="on">On</option>
            </select>
          </div>
          <div>
            <label className="label">Reduced motion</label>
            <select
              className="input"
              value={settings.reducedMotion ? 'on' : 'off'}
              onChange={(event) => update({ reducedMotion: event.target.value === 'on' })}
            >
              <option value="off">Off</option>
              <option value="on">On</option>
            </select>
          </div>
          <div>
            <label className="label">Default timer (minutes)</label>
            <input
              className="input"
              type="number"
              min={30}
              max={120}
              value={settings.defaultTimer}
              onChange={(event) => update({ defaultTimer: Number(event.target.value) })}
            />
          </div>
          <div>
            <label className="label">Pass threshold (%)</label>
            <input
              className="input"
              type="number"
              min={50}
              max={90}
              value={settings.passThreshold}
              onChange={(event) => update({ passThreshold: Number(event.target.value) })}
            />
          </div>
          <div>
            <label className="label">Font scale</label>
            <input
              className="input"
              type="number"
              step={0.05}
              min={0.9}
              max={1.2}
              value={settings.fontScale}
              onChange={(event) => update({ fontScale: Number(event.target.value) })}
            />
          </div>
          <div>
            <label className="label">Author mode</label>
            <select
              className="input"
              value={settings.authorMode ? 'on' : 'off'}
              onChange={(event) => update({ authorMode: event.target.value === 'on' })}
            >
              <option value="off">Off</option>
              <option value="on">On</option>
            </select>
          </div>
          <div>
            <label className="label">Anonymous ID</label>
            <input className="input" value={anonymousId} readOnly />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Stored locally to keep your progress on this device.</p>
          </div>
        </div>
      </Panel>

      <Panel>
        <h3 className="card-title">Data export / import</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Export your progress, settings, and authored questions.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleExport}>
            Export data
          </Button>
        </div>
        {exportPayload && (
          <textarea className="input mt-4 h-40" value={exportPayload} readOnly />
        )}
        <div className="mt-6">
          <label className="label">Import JSON</label>
          <textarea className="input mt-2 h-40" value={importPayload} onChange={(event) => setImportPayload(event.target.value)} />
          <div className="mt-3">
            <Button variant="primary" onClick={handleImport}>
              Import data
            </Button>
          </div>
        </div>
      </Panel>

      <Panel>
        <h3 className="card-title">Reset local data</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Clears progress, settings, and authored questions on this device.</p>
        <Button
          className="mt-4"
          variant="ghost"
          onClick={() => {
            const confirmed = window.confirm('Reset all local data? This cannot be undone.');
            if (!confirmed) return;
            localStorage.clear();
            window.location.reload();
          }}
        >
          Reset local data
        </Button>
      </Panel>
    </div>
  );
};

export default SettingsPage;
