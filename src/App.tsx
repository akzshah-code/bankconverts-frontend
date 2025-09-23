// src/App.tsx

// Remove `BrowserRouter as Router` from this import
import { Routes, Route } from 'react-router-dom'; 
import PageLayout from './components/PageLayout'; // 1. Import the new layout
import LandingPage from './pages/LandingPage';
import Converter from './components/Converter';
import PricingPage from './pages/PricingPage'; // 1. Import the new page
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <Routes>
      {/* Routes WITH Header and Footer */}
      <Route element={<PageLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Routes WITHOUT Header and Footer (or with a different layout) */}
      {/* For example, the main converter app might have a different sidebar navigation */}
      <Route path="/app" element={<Converter />} />
      
    </Routes>
  );
}

export default App;