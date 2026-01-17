import { Routes, Route } from 'react-router-dom';
import AppLayout from './app/AppLayout';
import Dashboard from './app/Dashboard';
import ExamSimulator from './features/exam/ExamSimulator';
import Practice from './features/exam/Practice';
import Flashcards from './features/flashcards/Flashcards';
import ProgressPage from './features/progress/ProgressPage';
import QuestionBankPage from './features/bank/QuestionBankPage';
import SettingsPage from './features/settings/SettingsPage';

const App = () => {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/exam" element={<ExamSimulator />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/bank" element={<QuestionBankPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </AppLayout>
  );
};

export default App;
