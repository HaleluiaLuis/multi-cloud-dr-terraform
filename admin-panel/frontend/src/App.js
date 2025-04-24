import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from './contexts/AuthContext';

// Layouts
import DashboardLayout from './components/layouts/DashboardLayout';
import AuthLayout from './components/layouts/AuthLayout';

// Páginas públicas
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Páginas protegidas
import Dashboard from './pages/dashboard/Dashboard';
import ClientList from './pages/clients/ClientList';
import ClientDetails from './pages/clients/ClientDetails';
import ClientCreate from './pages/clients/ClientCreate';
import BackupJobs from './pages/jobs/BackupJobs';
import JobDetails from './pages/jobs/JobDetails';
import Reports from './pages/reports/Reports';
import Monitoring from './pages/monitoring/Monitoring';
import Settings from './pages/settings/Settings';
import Profile from './pages/profile/Profile';
import NotFound from './pages/NotFound';

// Rota protegida que verifica autenticação
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Enquanto verifica a autenticação, exibe nada ou um loading
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Carregando...</Box>;
  }

  // Se não estiver autenticado, redireciona para login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Se estiver autenticado, renderiza o conteúdo protegido
  return children;
};

function App() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Route>

      {/* Rotas Protegidas */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clients" element={<ClientList />} />
        <Route path="/clients/new" element={<ClientCreate />} />
        <Route path="/clients/:id" element={<ClientDetails />} />
        <Route path="/jobs" element={<BackupJobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/monitoring" element={<Monitoring />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Página 404 para rotas não encontradas */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;

