import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { ToastProvider } from './lib/toast';
import { SettingsProvider } from './lib/settings';
import { ProgressProvider } from './lib/progress';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <SettingsProvider>
        <ProgressProvider>
          <HashRouter>
            <App />
          </HashRouter>
        </ProgressProvider>
      </SettingsProvider>
    </ToastProvider>
  </React.StrictMode>
);
