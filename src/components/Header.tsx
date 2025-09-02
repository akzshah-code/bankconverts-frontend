import { useState } from 'react';
import { User } from '../lib/types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

interface NavLink {
  href: string;
  label: string;
  isHighlighted?: boolean;
}

const Header = ({ user, onLogout }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const guestLinks: NavLink[] = [
    { href: '#/', label: 'Convert' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#blog', label: 'Blog' },
    { href: '#login', label: 'Login' },
  ];
  
  const userLinks: NavLink[] = [
    { href: '#dashboard', label: 'Dashboard' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#blog', label: 'Blog' },
    { href: '#bulk-convert', label: 'Bulk Convert' },
  ];

  const adminLinks: NavLink[] = [
    ...userLinks,
    { href: '#admin', label: 'Admin', isHighlighted: true },
  ];

  const navLinks = user ? (user.role === 'admin' ? adminLinks : userLinks) : guestLinks;

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/#" className="flex items-center space-x-2">
              {/* Custom SVG Logo */}
              <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C5.37258 0 0 5.37258 0 12V52C0 58.6274 5.37258 64 12 64H52C58.6274 64 64 58.6274 64 52V20L44 0H12Z" fill="#2563EB"/>
                  <path d="M64 20H44V0L64 20Z" fill="#60A5FA"/>
                  <g>
                      <rect x="8" y="38" width="22" height="20" rx="2" fill="#EFEFEF"/>
                      <path d="M19 41C15.134 41 12 44.134 12 48C12 51.866 15.134 55 19 55C22.866 55 26 51.866 26 48C26 44.134 22.866 41 19 41ZM19 52C16.7909 52 15 50.2091 15 48C15 45.7909 16.7909 44 19 44C21.1929 44 23 45.7909 23 48C23 50.2091 21.1929 52 19 52Z" fill="#DC2626"/>
                  </g>
                  <g>
                      <rect x="34" y="38" width="22" height="20" rx="2" fill="#10B981"/>
                      <path d="M40 44L50 52M50 44L40 52" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </g>
                  <path d="M38.8 13.2H24.4V16H27.5C31.5 16 31.5 20.4 27.5 20.4H24.4V23.2H27.9C31.9 23.2 31.9 27.6 27.9 27.6H25.2V30.4H21.2V9.6H38.8V13.2Z" fill="white"/>
              </svg>
              <div className="flex flex-col justify-center">
                 <span className="font-bold text-xl leading-none">
                    <span className="text-brand-blue">Bank</span><span className="text-brand-green">Converts</span>
                 </span>
                 <span className="hidden md:block text-xs text-brand-gray leading-tight mt-0.5">Transform Statements. Unlock Data.</span>
              </div>
            </a>
          </div>

          {/* Right side container */}
          <div className="flex items-center space-x-4">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <a 
                  key={link.label} 
                  href={link.href} 
                  className={`transition-colors duration-200 ${link.isHighlighted ? 'text-brand-blue font-semibold' : 'text-brand-dark hover:text-brand-blue'}`}
                >
                  {link.label}
                </a>
              ))}
            </nav>
            
            {/* Primary Action Button */}
            <div>
              {user ? (
                 <button onClick={onLogout} className="bg-brand-dark text-white px-4 py-2 rounded-md font-semibold hover:bg-brand-dark/90 transition-colors duration-200">
                  Logout
                </button>
              ) : (
                <a href="#register" className="bg-brand-primary text-white px-4 py-2 rounded-md font-semibold hover:bg-brand-primary-hover transition-colors duration-200">
                  Register
                </a>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} className="block px-3 py-2 rounded-md text-base font-medium text-brand-dark hover:text-brand-blue hover:bg-brand-blue-light">{link.label}</a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;