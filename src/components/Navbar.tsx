// src/components/Navbar.tsx

import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-gray-800">
          BankConverts
        </Link>
        <div className="flex space-x-4">
          <Link to="/convert" className="text-gray-800">Convert</Link>
          <Link to="/pricing" className="text-gray-800">Pricing</Link>
          <Link to="/blog" className="text-gray-800">Blog</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
