import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/api';

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
        // Require auth for admin; apiFetch will redirect on 401 without noisy alerts.
        const response = await apiFetch(`${apiUrl}/api/admin/users`, {}, 'required');

        if (response.status === 403) {
          throw new Error('Access Denied: You do not have permission to view this page.');
        }
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data?.error || 'Failed to fetch user data.');
        }

        const data: User[] = await response.json();
        setUsers(data);
      } catch (err) {
        // If apiFetch redirected due to 401, this component will unmount; keep generic guard.
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        // Optionally, navigate to login for any non-OK conditions not caught above.
        if ((err as Error)?.message?.toLowerCase().includes('unauthorized')) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate, apiUrl]);

  if (loading) return <div className="text-center p-8">Loading admin dashboard...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </header>

      <main className="p-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 shadow rounded">Total Users: {users.length}</div>
            <div className="bg-white p-4 shadow rounded">Active Subscriptions: N/A</div>
            <div className="bg-white p-4 shadow rounded">Total Revenue (MRR): N/A</div>
            <div className="bg-white p-4 shadow rounded">Total Pages Used: N/A</div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">All Users</h2>
          <div className="bg-white shadow rounded overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-6 text-left">User</th>
                  <th className="py-3 px-6 text-left">Subscription Plan</th>
                  <th className="py-3 px-6 text-left">Usage</th>
                  <th className="py-3 px-6 text-left">Plan Renews</th>
                  <th className="py-3 px-6 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">{user.email}</td>
                    <td className="py-4 px-6">{user.subscription_plan}</td>
                    <td className="py-4 px-6">{user.usage}</td>
                    <td className="py-4 px-6">{user.plan_renews}</td>
                    <td className="py-4 px-6">
                      <button className="text-blue-500 hover:underline">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminPage;
