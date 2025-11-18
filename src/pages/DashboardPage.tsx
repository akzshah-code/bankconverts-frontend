// src/pages/DashboardPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout';

interface Conversion {
  id: number;
  original_filename: string;
  converted_filename: string | null;
  status: 'completed' | 'processing' | 'failed';
  date: string;
}

const DashboardPage: React.FC = () => {
  const [history, setHistory] = useState<Conversion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const apiUrl =
    import.meta.env.VITE_API_URL || 'https://api.bankconverts.com';

  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await fetch(`${apiUrl}/api/history`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch conversion history.');
      }
      const data: Conversion[] = await response.json();
      setHistory(
        data.sort(
          (a, b) =>
            new Date(b.date).getTime() -
            new Date(a.date).getTime(),
        ),
      );
    } catch (err: any) {
      setError(
        err?.message || 'Failed to load history.',
      );
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

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-screen bg-gray-50">
          Loading dashboard...
        </div>
      </PageLayout>
    );
  }

  const displayName = user?.email || 'there';
  const currentPlan = 'Starter';
  const monthlyUsedPages = 0;
  const monthlyPageLimit = 500;
  const usagePercent =
    monthlyPageLimit > 0
      ? Math.round(
          (monthlyUsedPages / monthlyPageLimit) * 100,
        )
      : 0;
  const renewalText = 'Renews 1 month from now';

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Welcome, {displayName.toUpperCase()}!
              </h1>
              <p className="text-sm text-gray-500">
                Here&apos;s a summary of your account and recent
                activity.
              </p>
            </div>
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
                <p className="mt-1 text-sm text-gray-500">
                  {renewalText}
                </p>
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
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
                <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-700">
                    {usagePercent}%
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Conversion history summary */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
              Conversion History
            </h2>
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-3 text-gray-400 text-3xl">
                  📄
                </div>
                <p className="font-medium text-gray-800">
                  No Conversion History
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Your past file conversions will appear here.
                </p>
                {error && (
                  <p className="text-xs text-red-400 mt-2">
                    Note: history could not be loaded ({error}).
                  </p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto mt-4">
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-sm">
                    {history.map((conv) => (
                      <tr
                        key={conv.id}
                        className="hover:bg-gray-50"
                      >
                        <td
                          className="py-3 px-4 whitespace-nowrap text-gray-800 truncate"
                          title={conv.original_filename}
                        >
                          {conv.original_filename}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-gray-500">
                          {new Date(
                            conv.date,
                          ).toLocaleDateString()}
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
                <p className="font-semibold text-blue-700">
                  Bulk Convert
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Process multiple files at once.
                </p>
              </Link>
              <Link
                to="/pricing"
                className="block rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 px-4 py-3 text-center"
              >
                <p className="font-semibold text-blue-700">
                  Upgrade Plan
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Get more pages and features.
                </p>
              </Link>
              <Link
                to="/faq"
                className="block rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 px-4 py-3 text-center"
              >
                <p className="font-semibold text-blue-700">
                  View FAQ
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Find answers to common questions.
                </p>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
};

export default DashboardPage;
