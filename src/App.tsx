// src/App.tsx

// Remove `BrowserRouter as Router` from this import
import { Routes, Route } from 'react-router-dom'; 
import LandingPage from './pages/LandingPage';
import Converter from './components/Converter';

function App() {
  return (
    // The <Router> wrapper should be removed from here
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<Converter />} />
    </Routes>
    // End of removed wrapper
  );
}

export default App;
