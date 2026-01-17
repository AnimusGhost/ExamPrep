import { Routes, Route } from 'react-router-dom';
import AppLayout from './app/AppLayout';
import Dashboard from './app/Dashboard';
import ExamSimulator from './features/exam/ExamSimulator';
import Practice from './features/exam/Practice';
import Flashcards from './features/flashcards/Flashcards';
import ProgressPage from './features/progress/ProgressPage';
import QuestionBankPage from './features/bank/QuestionBankPage';
import SettingsPage from './features/settings/SettingsPage';
import AuthPage from './features/auth/AuthPage';
import AccountPage from './features/account/AccountPage';
import InstructorDashboard from './features/instructor/InstructorDashboard';
import AdminDashboard from './features/admin/AdminDashboard';

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
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/instructor" element={<InstructorDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </AppLayout>
  );
};

export default App;
