// src/pages/DashboardPage.tsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Define types for our data
interface Conversion {
  filename: string;
  converted_at: string;
}

interface Profile {
  email: string;
  history: Conversion[];
  roles: string[];
}

function DashboardPage(): React.JSX.Element {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://127.0.0.1:5000/profile', {
          headers: { 'Authentication-Token': token || '' },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile data.');
        }

        const data: Profile = await response.json();
        setProfile(data);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError('An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div className="dashboard-container">
      <header>
        <h2>User Dashboard</h2>
        <p>Welcome, {profile?.email}</p>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <section>
        <h3>Your Conversion History</h3>
        {profile && profile.history.length > 0 ? (
          <table className="history-table">
            <thead>
              <tr>
                <th>Filename</th>
                <th>Date of Conversion</th>
              </tr>
            </thead>
            <tbody>
              {profile.history.map((item) => (
                <tr key={item.converted_at}>
                  <td>{item.filename}</td>
                  <td>{new Date(item.converted_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>You have no conversion history yet.</p>
        )}
      </section>
    </div>
  );
}

export default DashboardPage;
