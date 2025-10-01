// src/pages/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Updated interface to match backend data
interface Conversion {
  id: number;
  original_filename: string;
  converted_filename: string | null;
  status: string;
  date: string; // ISO string from backend
  target_format: string;
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
  const { isAuthenticated, logout, token } = useAuth(); // Assuming token is available from your AuthContext
  const navigate = useNavigate();

  useEffect(() => {
    // If not authenticated, redirect to login page
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch conversion history from your Flask backend
        const response = await fetch('/api/dashboard/history', {
          headers: {
            'Authorization': `Bearer ${token}` // Send the JWT token
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data. Please try again.');
        }

        const historyData: Conversion[] = await response.json();
        
        // You might have another endpoint for user details, or get it from the auth context
        // For now, we'll construct the profile object here
        setProfile({
            email: 'user@example.com', // Replace with actual user email from AuthContext or another API call
            roles: ['user'], // Replace with actual roles
            history: historyData
        });

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, navigate, token]);

  if (loading) {
    return <div className="text-center mt-10">Loading your dashboard...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <button 
          onClick={logout} 
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>

      <div className="bg-white shadow-md rounded p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Conversion History</h2>
        {profile && profile.history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left">Original File</th>
                  <th className="py-2 px-4 text-left">Date</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Converted To</th>
                  <th className="py-2 px-4 text-left">Download</th>
                </tr>
              </thead>
              <tbody>
                {profile.history.map((conv) => (
                  <tr key={conv.id} className="border-b">
                    <td className="py-2 px-4">{conv.original_filename}</td>
                    <td className="py-2 px-4">{new Date(conv.date).toLocaleDateString()}</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        conv.status === 'completed' ? 'bg-green-200 text-green-800' : 
                        conv.status === 'processing' ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-800'
                      }`}>
                        {conv.status}
                      </span>
                    </td>
                    <td className="py-2 px-4">{conv.target_format.toUpperCase()}</td>
                    <td className="py-2 px-4">
                      {conv.status === 'completed' && conv.converted_filename ? (
                        <a 
                          href={`/api/download/${conv.converted_filename}`} // Assuming a download endpoint
                          download
                          className="text-blue-500 hover:underline"
                        >
                          Download
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>You have no conversion history yet.</p>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
