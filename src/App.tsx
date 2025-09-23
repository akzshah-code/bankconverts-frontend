// src/App.tsx

// Remove `BrowserRouter as Router` from this import
import { Routes, Route } from 'react-router-dom'; 
import LandingPage from './pages/LandingPage';
import Converter from './components/Converter';
import PricingPage from './pages/PricingPage'; // 1. Import the new page
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    // The <Router> wrapper should be removed from here
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<Converter />} />
      <Route path="/pricing" element={<PricingPage />} /> {/* 2. Add the route */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
    // End of removed wrapper
  );
}

export default App;
