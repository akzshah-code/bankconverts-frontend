// src/App.tsx

import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ConverterPage from './pages/ConverterPage';
import PricingPage from './pages/PricingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TermsPage from './pages/TermsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import AdminPage from './pages/AdminPage';
import BulkConvertPage from './pages/BulkConvertPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public pages (each page handles its own PageLayout) */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />

        {/* Convert pages – accessible to guests, users, and admins */}
        <Route path="/app" element={<ConverterPage />} />
        <Route path="/bulk-convert" element={<BulkConvertPage />} />

        {/* Protected user dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Protected admin dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* (Optional) catch‑all route */}
        {/* <Route path="*" element={<LandingPage />} /> */}
      </Routes>
    </AuthProvider>
  );
}

export default App;
