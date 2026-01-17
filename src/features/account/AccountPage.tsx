import { useEffect, useState } from 'react';
import Panel from '../../components/Panel';
import Button from '../../components/Button';
import { useAuth } from '../../lib/firebase/auth';
import { fetchUserProfile } from '../../lib/firebase/firestore';
import { exportStorage } from '../../lib/storage';
import { deleteUserData } from '../../lib/firebase/firestore';

const AccountPage = () => {
  const { state, logout } = useAuth();
  const [profile, setProfile] = useState<{ displayName?: string; email?: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!state.user) return;
      const data = await fetchUserProfile(state.user.uid);
      setProfile(data);
    };
    load();
  }, [state.user]);

  return (
    <Panel>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Account</p>
        <h2 className="text-2xl font-semibold text-ink-900">Profile & Sync</h2>
      </div>
      {state.user ? (
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <p>
            <strong>Email:</strong> {state.user.email}
          </p>
          <p>
            <strong>Name:</strong> {profile?.displayName || 'Not set'}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => navigator.clipboard.writeText(exportStorage())}>
              Copy export JSON
            </Button>
            <Button
              variant="ghost"
              onClick={async () => {
                if (!state.user) return;
                await deleteUserData(state.user.uid);
                localStorage.clear();
                window.location.reload();
              }}
            >
              Delete my data
            </Button>
            <Button variant="ghost" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-600">Sign in to manage your profile and cloud sync.</p>
      )}
    </Panel>
  );
};

export default AccountPage;
