import Panel from '../../components/Panel';
import Button from '../../components/Button';
import { useAuth } from '../../lib/firebase/auth';
import { useEffect, useState } from 'react';
import { fetchUserProfile } from '../../lib/firebase/firestore';

const AdminDashboard = () => {
  const { state } = useAuth();
  const [allowed, setAllowed] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      if (!state.user) return;
      const profile = await fetchUserProfile(state.user.uid);
      setAllowed(Boolean(profile?.roles?.admin));
    };
    load();
  }, [state.user]);

  if (!state.user) {
    return <Panel>Sign in to access admin tools.</Panel>;
  }
  if (!allowed) {
    return <Panel>Access restricted to admins.</Panel>;
  }

  return (
    <div className="flex flex-col gap-6">
      <Panel>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Admin</p>
        <h2 className="text-2xl font-semibold text-ink-900">Bank versions & system metrics</h2>
        <p className="mt-2 text-sm text-slate-600">
          Manage published question banks, review version history, and monitor system-level stats.
        </p>
      </Panel>
      <Panel>
        <h3 className="card-title">Bank management</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary">Publish new bank</Button>
          <Button variant="ghost">View versions</Button>
        </div>
      </Panel>
    </div>
  );
};

export default AdminDashboard;
