// src/components/Header.tsx

import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoUrl from '../assets/logo.svg';
import { useAuth } from '../context/AuthContext';

type BackendStatus = 'checking' | 'ok' | 'error';

interface NavLink {
  to: string;
  label: string;
  isHighlighted?: boolean;
}

const ConnectionStatusIndicator: React.FC<{ status: BackendStatus }> = ({
  status,
}) => {
  const statusMap: Record<
    BackendStatus,
    { color: string; title: string }
  > = {
    checking: {
      color: 'bg-gray-400 animate-pulse',
      title: 'Checking backend connection...',
    },
    ok: {
      color: 'bg-green-500',
      title: 'Backend connection established',
    },
    error: {
      color: 'bg-red-500 animate-pulse',
      title:
        'Could not connect to the backend service. Check environment variables.',
    },
  };

  const currentStatus = statusMap[status];

  return (
    <div
      className="flex items-center"
      title={currentStatus.title}
      aria-label={currentStatus.title}
    >
      <div className={`h-3 w-3 rounded-full ${currentStatus.color}`} />
    </div>
  );
};

const Header: React.FC = () => {
  const { isAuthenticated, user, role, logout } = useAuth();
  const location = useLocation();
  const [backendStatus, setBackendStatus] =
    useState<BackendStatus>('checking');

  const apiUrl = import.meta.env.VITE_API_URL || 'https://api.bankconverts.com';

  // Simple backend connectivity check
  useEffect(() => {
    let cancelled = false;
    const checkStatus = async () => {
      try {
        const resp = await fetch(`${apiUrl}/api/status`, {
          credentials: 'include',
        });
        if (!cancelled) {
          setBackendStatus(resp.ok ? 'ok' : 'error');
        }
      } catch {
        if (!cancelled) setBackendStatus('error');
      }
    };
    checkStatus();
    return () => {
      cancelled = true;
    };
  }, [apiUrl]);

  const isActive = (to: string) => location.pathname === to;

  const guestLinks: NavLink[] = [
  { to: '/app', label: 'Convert' },
  { to: '/pricing', label: 'Pricing' },
  ];

  const userLinks: NavLink[] = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/blog', label: 'Blog' },
    { to: '/app', label: 'Convert' },
    { to: '/bulk-convert', label: 'Bulk Convert' },
  ];

  const adminLinks: NavLink[] = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/blog', label: 'Blog' },
    { to: '/app', label: 'Convert' },
    { to: '/bulk-convert', label: 'Bulk Convert' },
    { to: '/admin', label: 'Admin', isHighlighted: true },
  ];

  const navLinks: NavLink[] = !isAuthenticated
    ? guestLinks
    : role === 'admin'
    ? adminLinks
    : userLinks;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img src={logoUrl} alt="BankConverts Logo" className="h-8" />
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gray-800">
              BankConverts
            </span>
            <p className="text-xs text-gray-500">
              Transform Statements. Unlock Data.
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={[
                'text-sm font-medium',
                link.isHighlighted
                  ? 'text-red-600'
                  : isActive(link.to)
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-blue-600',
              ].join(' ')}
            >
              {link.label}
              {link.isHighlighted && (
                <span className="ml-1 inline-block h-2 w-2 rounded-full bg-red-500" />
              )}
            </Link>
          ))}
        </div>

        {/* Right-side actions */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Backend connection dot */}
          <ConnectionStatusIndicator status={backendStatus} />

          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="text-gray-600 hover:text-blue-600 text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-semibold text-sm"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              {user && (
                <span className="text-xs text-gray-500 max-w-[180px] truncate">
                  {user.email}
                </span>
              )}
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-semibold text-sm"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
