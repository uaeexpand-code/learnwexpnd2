import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import Layout from './components/Layout';
import TutorialList from './components/TutorialList';
import HomeRedirect from './components/HomeRedirect';
import TutorialDetail from './components/TutorialDetail';
import AdminDashboard from './components/AdminDashboard';
import TutorialForm from './components/TutorialForm';
import Login from './components/Login';
import ErrorBoundary from './components/ErrorBoundary';

function AppRoutes() {
  const { user, loading: authLoading } = useAuth();
  const { loading: settingsLoading } = useSettings();

  if (authLoading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/tutorial/:id" element={<TutorialDetail />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/ex-admin" element={user ? <AdminDashboard /> : <Navigate to="/login" replace />} />
        <Route path="/ex-admin/new" element={user ? <TutorialForm /> : <Navigate to="/login" replace />} />
        <Route path="/ex-admin/edit/:id" element={user ? <TutorialForm /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SettingsProvider>
          <Router>
            <AppRoutes />
          </Router>
        </SettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
