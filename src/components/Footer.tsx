// src/components/Footer.tsx
import { Link } from 'react-router-dom'; // 1. Import the Link component

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <p>&copy; {new Date().getFullYear()} BankConverts. All rights reserved.</p>
          <div className="flex space-x-6">
            {/* 2. Use Link for internal pages */}
            <Link to="/terms" className="hover:text-gray-300">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-gray-300">Privacy Policy</Link>
            
            {/* 3. Keep standard <a> tag for external mailto link */}
            <a href="mailto:support@bankconverts.com" className="hover:text-gray-300">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
