// src/components/Header.tsx


const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
            {/* Replace this with your actual logo SVG for best quality */}
            <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <div>
                <h1 className="text-xl font-bold text-gray-800">BankConverts</h1>
                <p className="text-sm text-gray-500 hidden sm:block">Transform Statements. Unlock Data.</p>
            </div>
        </div>
        <div className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-gray-600 font-medium hover:text-blue-600 transition-colors">Convert</a>
            <a href="#" className="text-gray-600 font-medium hover:text-blue-600 transition-colors">Pricing</a>
            <a href="#" className="text-gray-600 font-medium hover:text-blue-600 transition-colors">Blog</a>
            <a href="#" className="text-gray-600 font-medium hover:text-blue-600 transition-colors">Login</a>
            <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-5 rounded-lg transition-colors">
                Register
            </button>
        </div>
        {/* Mobile menu button */}
        <div className="md:hidden">
            <button className="text-gray-800 focus:outline-none">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
