import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import UploadPage from './pages/UploadPage';
import BudgetsPage from './pages/BudgetsPage';
import InsightsPage from './pages/InsightsPage';
import ChatPage from './pages/ChatPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
