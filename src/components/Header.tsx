// src/components/Header.tsx
// src/components/Header.tsx
import { Link } from 'react-router-dom';
// Revert to the default URL import
import logoUrl from '../assets/logo.svg';

const Header = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          {/* Use a standard img tag instead of a component */}
          <img src={logoUrl} alt="BankConverts Logo" className="h-8" />
          <span className="text-xl font-bold text-gray-800">BankConverts</span>
          <p className="text-sm text-gray-500">Transform Statements. Unlock Data.</p>
        </Link>
        
        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/app" className="text-gray-600 hover:text-blue-600 font-medium">Convert</Link>
          <Link to="/pricing" className="text-gray-600 hover:text-blue-600 font-medium">Pricing</Link>
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium">Login</Link>
          <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-semibold">
            Register
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
