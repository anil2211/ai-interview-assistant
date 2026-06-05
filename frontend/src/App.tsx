import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import InterviewPage from '@/pages/InterviewPage';
import NewInterviewPage from '@/pages/NewInterviewPage';
import QuestionsPage from '@/pages/QuestionsPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import StudyPlanPage from '@/pages/StudyPlanPage';
import HistoryPage from '@/pages/HistoryPage';
import SettingsPage from '@/pages/SettingsPage';
import NotFoundPage from '@/pages/NotFoundPage';

const App: React.FC = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { fetchProfile } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, fetchProfile]);

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="interview/new" element={<NewInterviewPage />} />
        <Route path="interview/:id" element={<InterviewPage />} />
        <Route path="questions" element={<QuestionsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="study-plan" element={<StudyPlanPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
