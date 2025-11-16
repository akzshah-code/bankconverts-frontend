// src/pages/LoginPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, isAuthenticated, role, nextUrl } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) return;

    const target =
      nextUrl || (role === 'admin' ? '/admin' : '/dashboard');

    navigate(target, { replace: true });
  }, [isAuthenticated, role, nextUrl, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);

    setLoading(false);

    if (!result.ok) {
      setError(result.message || 'Login failed.');
      return;
    }

    const targetFromApi = result.nextUrl;
    const targetFromState =
      (location.state as any)?.from?.pathname || undefined;

    const target =
      targetFromApi ||
      targetFromState ||
      (role === 'admin' ? '/admin' : '/dashboard');

    navigate(target, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-md px-8 py-10">
          <h1 className="text-2xl font-bold text-center text-gray-900">
            Welcome Back!
          </h1>
          <p className="mt-2 text-sm text-center text-gray-500">
            Login to access your account.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-600 focus:ring-emerald-600 outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-600 focus:ring-emerald-600 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-center text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full justify-center rounded-md bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:bg-emerald-300 transition-colors"
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-600">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-emerald-600 hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
