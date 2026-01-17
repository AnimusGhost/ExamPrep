import Panel from '../../components/Panel';
import Button from '../../components/Button';
import { useAuth } from '../../lib/firebase/auth';
import { useEffect, useState } from 'react';
import { fetchUserProfile } from '../../lib/firebase/firestore';

const InstructorDashboard = () => {
  const { state } = useAuth();
  const [allowed, setAllowed] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      if (!state.user) return;
      const profile = await fetchUserProfile(state.user.uid);
      setAllowed(Boolean(profile?.roles?.instructor || profile?.roles?.admin));
    };
    load();
  }, [state.user]);

  if (!state.user) {
    return <Panel>Sign in to access instructor tools.</Panel>;
  }
  if (!allowed) {
    return <Panel>Access restricted to instructors.</Panel>;
  }

  return (
    <div className="flex flex-col gap-6">
      <Panel>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Instructor</p>
        <h2 className="text-2xl font-semibold text-ink-900">Cohorts & Assignments</h2>
        <p className="mt-2 text-sm text-slate-600">
          Create cohorts, publish assignments, and export submissions. Role-based access required.
        </p>
      </Panel>
      <Panel>
        <h3 className="card-title">Quick actions</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary">Create cohort</Button>
          <Button variant="secondary">New assignment</Button>
          <Button variant="ghost">Export results CSV</Button>
        </div>
      </Panel>
    </div>
  );
};

export default InstructorDashboard;
