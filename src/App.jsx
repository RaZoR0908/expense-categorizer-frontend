import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppLayout from './layouts/AppLayout';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const BudgetsPage = lazy(() => import('./pages/BudgetsPage'));
const InsightsPage = lazy(() => import('./pages/InsightsPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading…</div>}>
          <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            element={(
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            )}
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/budgets" element={<BudgetsPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/chat" element={<ChatPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0f172a',
              color: '#e2e8f0',
              border: '1px solid rgba(148, 163, 184, 0.15)',
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
