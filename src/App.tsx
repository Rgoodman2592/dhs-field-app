import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { AppShell } from './components/layout/AppShell';
import { LoginPage } from './pages/LoginPage';
import { JobsPage } from './pages/JobsPage';
import { SurveyPage } from './pages/SurveyPage';
import { EstimatePage } from './pages/EstimatePage';
import { SearchPage } from './pages/SearchPage';

export default function App() {
  const { user, login, logout, isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell user={user!} onLogout={logout} />}>
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/survey" element={<SurveyPage />} />
          <Route path="/estimate" element={<EstimatePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="*" element={<Navigate to="/jobs" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
