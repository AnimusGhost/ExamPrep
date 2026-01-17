import { useState } from 'react';
import Panel from '../../components/Panel';
import Button from '../../components/Button';
import { useAuth } from '../../lib/firebase/auth';
import { cloudStatus } from '../../config/env';

const AuthPage = () => {
  const { signIn, signUp, googleSignIn, resetPassword } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const cloud = cloudStatus();

  const handleSubmit = async () => {
    setMessage('');
    try {
      if (tab === 'signin') {
        await signIn(email, password);
        setMessage('Signed in successfully.');
      }
      if (tab === 'signup') {
        await signUp(email, password);
        setMessage('Account created.');
      }
      if (tab === 'reset') {
        await resetPassword(email);
        setMessage('Reset email sent.');
      }
    } catch (error) {
      setMessage('Unable to complete request.');
      console.error(error);
    }
  };

  return (
    <Panel>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Authentication</p>
          <h2 className="text-2xl font-semibold text-ink-900">Sign in to sync progress</h2>
        </div>
      </div>
      {!cloud.available && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Cloud features are unavailable. Add Firebase keys to enable accounts.
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant={tab === 'signin' ? 'primary' : 'secondary'} onClick={() => setTab('signin')}>
          Sign In
        </Button>
        <Button variant={tab === 'signup' ? 'primary' : 'secondary'} onClick={() => setTab('signup')}>
          Create Account
        </Button>
        <Button variant={tab === 'reset' ? 'primary' : 'secondary'} onClick={() => setTab('reset')}>
          Reset Password
        </Button>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        {tab !== 'reset' && (
          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="primary" onClick={handleSubmit}>
          {tab === 'signin' ? 'Sign In' : tab === 'signup' ? 'Create Account' : 'Send Reset'}
        </Button>
        <Button variant="secondary" onClick={() => googleSignIn()}>
          Sign in with Google
        </Button>
      </div>
      {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
    </Panel>
  );
};

export default AuthPage;
