import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { ToastProvider } from './lib/toast';
import { SettingsProvider } from './lib/settings';
import { ProgressProvider } from './lib/progress';
import { AuthProvider } from './lib/firebase/auth';
import { SyncProvider } from './lib/sync/syncManager';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <SettingsProvider>
        <AuthProvider>
          <ProgressProvider>
            <SyncProvider>
              <HashRouter>
                <App />
              </HashRouter>
            </SyncProvider>
          </ProgressProvider>
        </AuthProvider>
      </SettingsProvider>
    </ToastProvider>
  </React.StrictMode>
);
