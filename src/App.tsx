// src/App.tsx

import { BrowserRouter as Routes, Route } from 'react-router-dom';
import PageLayout from './components/PageLayout';
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import TermsPage from './pages/TermsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Routes WITH HEADER and Footer */}
        <Route element={<PageLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* --- ADD THESE NEW ROUTES HERE --- */}
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        {/*<Route path="/about" element={<AboutPage />} />*/}
      </Routes>
    </AuthProvider>
  );
}

export default App;