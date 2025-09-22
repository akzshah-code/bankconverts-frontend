

const Header = () => {
  return (
    <header className="absolute top-0 left-0 w-full z-10 py-4 px-8">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {/* Replace with your actual logo */}
          <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-2xl font-bold text-gray-800">BankConverts</span>
        </div>
        <nav className="hidden md:flex items-center space-x-8 text-lg">
          <a href="#features" className="text-gray-600 hover:text-blue-600">Features</a>
          <a href="#pricing" className="text-gray-600 hover:text-blue-600">Pricing</a>
          <a href="/app" className="font-semibold text-white bg-blue-600 px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Go to App
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
