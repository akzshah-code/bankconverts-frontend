// src/pages/AdminPage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/api';
import PageLayout from '../components/PageLayout';

interface User {
  id: number;
  email: string;
  subscription_plan: string;
  usage: string;
  plan_renews: string;
}

function AdminPage(): React.JSX.Element {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const { logout } = useAuth();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || 'https://api.bankconverts.com';

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiFetch(
          `${apiUrl}/api/admin/users`,
          {},
          'required',
        );

        if (response.status === 401) {
          navigate('/login');
          return;
        }

        if (response.status === 403) {
          throw new Error(
            'Access denied: you do not have permission to view this page.',
          );
        }

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data?.error || 'Failed to fetch user data.');
        }

        const data: User[] = await response.json();
        setUsers(data);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'An unknown error occurred.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate, apiUrl]);

  const metrics = useMemo(() => {
    const totalUsers = users.length;

    const activeSubscriptions = users.filter(
      (u) =>
        u.subscription_plan &&
        u.subscription_plan.toLowerCase() !== 'free',
    ).length;

    let totalPagesUsed = 0;
    users.forEach((u) => {
      const parts = u.usage.split('/');
      if (parts.length >= 1) {
        const used = parseInt(parts[0].trim(), 10);
        if (!Number.isNaN(used)) totalPagesUsed += used;
      }
    });

    const planCounts: Record<string, number> = {};
    users.forEach((u) => {
      const plan = u.subscription_plan || 'Unknown';
      planCounts[plan] = (planCounts[plan] || 0) + 1;
    });

    return {
      totalUsers,
      activeSubscriptions,
      totalPagesUsed,
      monthlyRecurringRevenue: 0,
      planCounts,
    };
  }, [users]);

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-screen bg-gray-50">
          Loading admin dashboard...
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-sm max-w-md text-center">
            <h1 className="text-lg font-semibold text-red-600 mb-2">
              Admin dashboard error
            </h1>
            <p className="text-sm text-gray-700 mb-4">{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold"
            >
              Go to dashboard
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const planEntries = Object.entries(metrics.planCounts);

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-500">
                Application overview and user management.
              </p>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
          {/* Key Metrics */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Key Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <p className="text-xs font-medium text-gray-500">
                  Total Users
                </p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {metrics.totalUsers}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4">
                <p className="text-xs font-medium text-gray-500">
                  Active Subscriptions
                </p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {metrics.activeSubscriptions}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4">
                <p className="text-xs font-medium text-gray-500">
                  Total Revenue (MRR)
                </p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  ₹{metrics.monthlyRecurringRevenue}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4">
                <p className="text-xs font-medium text-gray-500">
                  Total Pages Used
                </p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {metrics.totalPagesUsed}
                </p>
              </div>
            </div>
          </section>

          {/* Plan distribution */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              User Analytics by Plan
            </h2>
            {planEntries.length === 0 ? (
              <p className="text-sm text-gray-500">
                No users found yet.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {planEntries.map(([plan, count]) => (
                  <div
                    key={plan}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-700">{plan}</span>
                    <div className="flex-1 mx-4 h-2 rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{
                          width: `${
                            metrics.totalUsers > 0
                              ? (count / metrics.totalUsers) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-gray-700 font-medium">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* All Users table */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              All Users
            </h2>
            <div className="bg-white shadow-sm rounded-xl overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subscription Plan
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan Renews
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6">{u.email}</td>
                      <td className="py-4 px-6">{u.subscription_plan}</td>
                      <td className="py-4 px-6">{u.usage}</td>
                      <td className="py-4 px-6">{u.plan_renews}</td>
                      <td className="py-4 px-6">
                        <button className="text-blue-600 hover:text-blue-800">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-4 px-6 text-center text-gray-500"
                      >
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </PageLayout>
  );
}

export default AdminPage;
