// src/pages/DashboardPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authorizedFetch } from '../api/api'; // Import your authorizedFetch wrapper

// Interface for conversion history items
interface Conversion {
  id: number;
  original_filename: string;
  converted_filename: string | null;
  status: string;
  date: string; // ISO string from backend
  target_format: string;
}

// Interface for the user's profile and history
interface Profile {
  email: string; 
  history: Conversion[];
  roles: string[];
}

function DashboardPage(): React.JSX.Element {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const { isAuthenticated, logout } = useAuth(); // Corrected: Removed 'user' which does not exist on the context type
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Function to fetch or refresh dashboard data
  const fetchDashboardData = async () => {
    try {
      const response = await authorizedFetch('/api/dashboard/history');
      
      // **FIX:** Check if the response is defined before using it.
      if (!response) {
        // authorizedFetch already handled the redirect, so we can just stop execution.
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data.');
      }
      
      const historyData: Conversion[] = await response.json();
      
      setProfile({
          email: 'user@example.com', // Placeholder, as 'user' object is not available
          roles: ['user'], // Placeholder
          history: historyData
      });
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoading(true);
    fetchDashboardData().finally(() => setLoading(false));
  }, [isAuthenticated, navigate]);

  // Handler for the File Conversion
  const handleConvert = async () => {
    if (!fileInputRef.current?.files?.length) {
      setError('Please select a file to convert.');
      return;
    }

    const file = fileInputRef.current.files[0];
    const password = passwordInputRef.current?.value || '';
    
    const formData = new FormData();
    formData.append('file', file);
    if (password) {
      formData.append('password', password);
    }

    setIsConverting(true);
    setError(''); // Clear previous errors

    try {
      const response = await authorizedFetch('/api/extract', {
        method: 'POST',
        body: formData,
      });
      
      // **FIX:** Check if the response is defined before using it.
      if (!response) {
        return; 
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred during conversion.' }));
        throw new Error(errorData.message || 'Failed to extract data.');
      }

      const result = await response.json();
      alert(result.message || 'Conversion successful!');
      
      // Refresh the dashboard data to show the new item
      fetchDashboardData();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsConverting(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading your dashboard...</div>;
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

      {/* Conversion Section */}
      <div className="bg-white shadow-md rounded p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Convert Your Bank Statement</h2>
        <div className="space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            accept=".pdf,.jpg,.jpeg,.png"
          />
          <input
            type="password"
            ref={passwordInputRef}
            placeholder="PDF Password (if any)"
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleConvert}
            disabled={isConverting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
          >
            {isConverting ? 'Converting...' : 'Convert to Excel'}
          </button>
          {error && <p className="text-red-500 text-center mt-2">{error}</p>}
        </div>
      </div>

      {/* Conversion History Section */}
      <div className="bg-white shadow-md rounded p-6">
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
                          href={`/api/download/${conv.converted_filename}`}
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
