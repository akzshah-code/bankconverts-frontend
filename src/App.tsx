import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ConverterPage from './components/Converter'; // Your existing converter tool component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<ConverterPage />} />
      </Routes>
    </Router>
  );
}

export default App;
