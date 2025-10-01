// src/App.tsx

import { Routes, Route } from 'react-router-dom';
import PageLayout from './components/PageLayout';
import LandingPage from './pages/LandingPage';
import Converter from './components/Converter';
import PricingPage from './pages/PricingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TermsPage from './pages/TermsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import AdminPage from './pages/AdminPage'; // Import the AdminPage component
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
        <Routes>
          {/* Routes WITH Header and Footer */}
          <Route element={<PageLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
        
          {/* --- ADD THESE NEW ROUTES HERE --- */}
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          {/* <Route path="/about" element={<AboutPage />} /> */}
          {/* <Route path="/faq" element={<FAQPage />} /> */}
          </Route>

          {/* Routes WITHOUT Header and Footer */}
          <Route path="/app" element={<Converter />} />

          {/* Protected Dashboard Route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Route */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
  );
}

export default App;