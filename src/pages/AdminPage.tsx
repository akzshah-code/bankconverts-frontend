// src/pages/AdminPage.tsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Define types for our data
interface AdminStats {
  total_users: number;
  total_conversions: number;
}

interface User {
  id: number;
  email: string;
  active: boolean;
  roles: string[];
}

function AdminPage(): React.JSX.Element {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      const token = localStorage.getItem('authToken');
      try {
        // Fetch dashboard stats
        const statsResponse = await fetch('http://127.0.0.1:5000/admin/dashboard', {
          headers: { 'Authentication-Token': token || '' },
        });
        if (!statsResponse.ok) throw new Error('Failed to fetch admin stats.');
        const statsData = await statsResponse.json();
        setStats(statsData);

        // Fetch user list
        const usersResponse = await fetch('http://127.0.0.1:5000/admin/users', {
          headers: { 'Authentication-Token': token || '' },
        });
        if (!usersResponse.ok) throw new Error('Failed to fetch users.');
        const usersData = await usersResponse.json();
        setUsers(usersData);

      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError('An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, navigate]);

  if (loading) return <p>Loading admin dashboard...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div className="admin-dashboard-container">
      <header>
        <h2>Admin Dashboard</h2>
      </header>

      <section className="stats-cards">
        <div className="card">
          <h4>Total Users</h4>
          <p>{stats?.total_users}</p>
        </div>
        <div className="card">
          <h4>Total Conversions</h4>
          <p>{stats?.total_conversions}</p>
        </div>
      </section>

      <section>
        <h3>All Registered Users</h3>
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Status</th>
              <th>Roles</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>{user.active ? 'Active' : 'Inactive'}</td>
                <td>{user.roles.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default AdminPage;
