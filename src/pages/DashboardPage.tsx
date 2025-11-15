// src/pages/DashboardPage.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

interface Conversion {
  id: number;
  original_filename: string;
  converted_filename: string | null;
  status: 'completed' | 'processing' | 'failed';
  date: string;
}

const DashboardPage: React.FC = () => {
  const [history, setHistory] = useState<Conversion[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isConverting, setIsConverting] = useState<boolean>(false);

  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'https://api.bankconverts.com';

  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await fetch(`${apiUrl}/api/history`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch conversion history.');
      const data: Conversion[] = await response.json();
      setHistory(
        data.sort(
          (a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
      );
    } catch (err: any) {
      setError(err.message);
    }
  }, [isAuthenticated, apiUrl]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setLoading(true);
    fetchHistory().finally(() => setLoading(false));
  }, [isAuthenticated, navigate, fetchHistory]);

  const handleConvert = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError('Please select a file to convert.');
      return;
    }
    if (!isAuthenticated) {
      setError('Authentication error. Please log in again.');
      navigate('/login');
      return;
    }

    const password = passwordInputRef.current?.value || '';
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);

    setIsConverting(true);
    setError('');

    try {
      const extractResponse = await fetch(`${apiUrl}/api/extract`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const extractData = await extractResponse.json();
      if (!extractResponse.ok)
        throw new Error(extractData.error || 'Conversion failed.');

      alert('Conversion successful! Preparing download...');

      if (extractData.downloadUrl) {
        const signedUrlResponse = await fetch(
          `${apiUrl}${extractData.downloadUrl}`,
          { credentials: 'include' },
        );
        const signedUrlData = await signedUrlResponse.json();

        if (!signedUrlResponse.ok)
          throw new Error(
            signedUrlData.error || 'Failed to get download link.',
          );
        window.location.href = signedUrlData.signedUrl;
      }

      await fetchHistory();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsConverting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (passwordInputRef.current) passwordInputRef.current.value = '';
    }
  };

  const handleDownload = async (conversionId: number) => {
    if (!isAuthenticated) {
      setError('Authentication error. Please log in again.');
      return;
    }
    try {
      const response = await fetch(
        `${apiUrl}/api/download/${conversionId}`,
        { credentials: 'include' },
      );
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Download failed.');

      if (data.signedUrl) {
        window.location.href = data.signedUrl;
      } else {
        throw new Error('Download link could not be generated.');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        Loading dashboard...
      </div>
    );
  }

  // Placeholder plan/usage data until backend exposes real values
  const displayName = user?.email || 'there';
  const currentPlan = 'Starter';
  const monthlyUsedPages = 0;
  const monthlyPageLimit = 500;
  const usagePercent =
    monthlyPageLimit > 0
      ? Math.round((monthlyUsedPages / monthlyPageLimit) * 100)
      : 0;
  const renewalText = 'Renews 1 month from now';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Welcome, {displayName}!
            </h1>
            <p className="text-sm text-gray-500">
              Here&apos;s a summary of your account and recent activity.
            </p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="self-start md:self-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md"
          >
            Logout
          </button>
        </header>

        {/* Summary cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-medium text-gray-500">
                Current Plan
              </h2>
              <p className="mt-2 text-xl font-semibold text-gray-900">
                {currentPlan}
              </p>
              <p className="mt-1 text-sm text-gray-500">{renewalText}</p>
            </div>
            <div className="mt-4">
              <Link
                to="/pricing"
                className="inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Upgrade Plan
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-gray-500">
                Monthly Page Usage
              </h2>
              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {usagePercent}%{' '}
                <span className="text-sm font-normal text-gray-500">
                  ({monthlyUsedPages} / {monthlyPageLimit})
                </span>
              </p>
            </div>
            {/* Simple usage ring */}
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
              <div
                className="absolute inset-0 rounded-full border-4 border-blue-600"
                style={{
                  clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 0 100%, 0 0)',
                  opacity: usagePercent > 0 ? 1 : 0,
                }}
              />
              <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                <span className="text-xs font-semibold text-gray-700">
                  {usagePercent}%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* New Conversion */}
        <section className="bg-white shadow-sm rounded-xl p-6 space-y-4">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">
            New Conversion
          </h2>
          <p className="text-sm text-gray-500">
            Upload a bank statement (PDF or image) and download a clean Excel
            file.
          </p>
          <div className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.jpg,.jpeg,.png"
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <input
              type="password"
              ref={passwordInputRef}
              placeholder="PDF Password (if any)"
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handleConvert}
              disabled={isConverting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-gray-400 transition-colors"
            >
              {isConverting ? 'Processing...' : 'Convert to Excel'}
            </button>
            {error && (
              <p className="text-red-500 text-center text-sm mt-2">
                {error}
              </p>
            )}
          </div>
        </section>

        {/* Conversion history */}
        <section className="bg-white shadow-sm rounded-xl p-6 space-y-4">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">
            Conversion History
          </h2>
          <div className="overflow-x-auto">
            {history.length > 0 ? (
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {history.map((conv) => (
                    <tr
                      key={conv.id}
                      className="hover:bg-gray-50 text-sm"
                    >
                      <td
                        className="py-3 px-4 whitespace-nowrap text-gray-800 truncate"
                        title={conv.original_filename}
                      >
                        {conv.original_filename}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-gray-500">
                        {new Date(conv.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            conv.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : conv.status === 'processing'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {conv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-sm font-medium">
                        {conv.status === 'completed' &&
                        conv.converted_filename ? (
                          <button
                            onClick={() => handleDownload(conv.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Download
                          </button>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center text-gray-500 py-4">
                You have no conversion history yet.
              </p>
            )}
          </div>
        </section>

        {/* Quick actions */}
        <section className="bg-white shadow-sm rounded-xl p-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/app"
              className="block rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 px-4 py-3 text-center"
            >
              <p className="font-semibold text-blue-700">Bulk Convert</p>
              <p className="text-xs text-gray-500 mt-1">
                Process multiple files at once.
              </p>
            </Link>
            <Link
              to="/pricing"
              className="block rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 px-4 py-3 text-center"
            >
              <p className="font-semibold text-blue-700">Upgrade Plan</p>
              <p className="text-xs text-gray-500 mt-1">
                Get more pages and features.
              </p>
            </Link>
            <Link
              to="/faq"
              className="block rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 px-4 py-3 text-center"
            >
              <p className="font-semibold text-blue-700">View FAQ</p>
              <p className="text-xs text-gray-500 mt-1">
                Find answers to common questions.
              </p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
