// src/pages/RegisterPage.tsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const apiUrl =
    import.meta.env.VITE_API_URL || 'https://api.bankconverts.com';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!apiUrl) {
      setErrorMessage(
        'API URL is not configured. Please contact support.',
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords don't match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        // Backend currently uses email + password; fullName is for UI only.
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Registration successful! Please log in.');
        navigate('/login');
      } else {
        setErrorMessage(data.message || 'Registration failed.');
      }
    } catch (error) {
      setErrorMessage(
        'An error occurred during registration. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-md px-8 py-10">
          <h1 className="text-2xl font-bold text-center text-gray-900">
            Create an Account
          </h1>
          <p className="mt-2 text-sm text-center text-gray-500">
            You&apos;re signing up for the{' '}
            <span className="font-semibold text-emerald-600">
              Free
            </span>{' '}
            plan.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="full-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name
              </label>
              <input
                id="full-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-600 focus:ring-emerald-600 outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="email-address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email-address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-600 focus:ring-emerald-600 outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((prev) => !prev)
                  }
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label={
                    showConfirmPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {errorMessage && (
              <p className="text-xs text-center text-red-500">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 inline-flex w-full justify-center rounded-md bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:bg-emerald-300 transition-colors"
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-emerald-600 hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
