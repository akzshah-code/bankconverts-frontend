// src/pages/DashboardPage.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Interface for a single conversion history item from the backend
interface Conversion {
  id: number;
  original_filename: string;
  converted_filename: string | null;
  status: 'completed' | 'processing' | 'failed';
  date: string; // This will be an ISO date string
  target_format: string;
}

const DashboardPage: React.FC = () => {
    const [history, setHistory] = useState<Conversion[]>([]);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [isConverting, setIsConverting] = useState<boolean>(false);
    
    // Get user, token, and authentication status from the context
    const { isAuthenticated, user, token, logout } = useAuth();
    const navigate = useNavigate();

    // Refs for direct access to file and password inputs
    const fileInputRef = useRef<HTMLInputElement>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);

    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    // Function to fetch the user's conversion history
    const fetchHistory = useCallback(async () => {
        if (!token) return;
        try {
            const response = await fetch(`${apiUrl}/api/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch conversion history.');
            const data: Conversion[] = await response.json();
            setHistory(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } catch (err: any) {
            setError(err.message);
        }
    }, [token, apiUrl]);

    // Initial load effect
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setLoading(true);
        fetchHistory().finally(() => setLoading(false));
    }, [isAuthenticated, navigate, fetchHistory]);

    // Handler for the file conversion submission
    const handleConvert = async () => {
        const file = fileInputRef.current?.files?.[0];
        if (!file) {
            setError('Please select a file to convert.');
            return;
        }

        if (!token) {
            setError('Authentication error. Please log in again.');
            return;
        }

        const password = passwordInputRef.current?.value || '';
        const formData = new FormData();
        formData.append('file', file);
        formData.append('password', password);

        setIsConverting(true);
        setError('');

        try {
            const response = await fetch(`${apiUrl}/api/extract`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });
            
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Conversion failed.');
            
            alert(result.message || 'Conversion successful!');
            await fetchHistory(); // Refresh the history to show the new item

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsConverting(false);
            // Clear the file input after conversion
            if (fileInputRef.current) fileInputRef.current.value = "";
            if (passwordInputRef.current) passwordInputRef.current.value = "";
        }
    };
    
    // Handler for securely downloading a converted file
    const handleDownload = async (filename: string) => {
        if (!token) {
            setError("Cannot download file, please log in again.");
            return;
        }
        try {
            const response = await fetch(`${apiUrl}/api/download/${filename}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Download failed.');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (loading) {
        return <div className="text-center mt-10">Loading dashboard...</div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold">
                    Welcome, {user?.username || 'User'}!
                </h1>
                <button 
                    onClick={logout} 
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded w-full md:w-auto"
                >
                    Logout
                </button>
            </div>

            {/* --- Conversion Form --- */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                <h2 className="text-xl md:text-2xl font-semibold mb-4">New Conversion</h2>
                <div className="space-y-4">
                    <input type="file" ref={fileInputRef} accept=".pdf,.jpg,.jpeg,.png" className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none" />
                    <input type="password" ref={passwordInputRef} placeholder="PDF Password (if any)" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" />
                    <button onClick={handleConvert} disabled={isConverting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400">
                        {isConverting ? 'Converting...' : 'Convert to Excel'}
                    </button>
                    {error && <p className="text-red-500 text-center mt-2">{error}</p>}
                </div>
            </div>

            {/* --- Conversion History --- */}
            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl md:text-2xl font-semibold mb-4">Conversion History</h2>
                <div className="overflow-x-auto">
                    {history.length > 0 ? (
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="py-3 px-4 text-left">File</th>
                                    <th className="py-3 px-4 text-left">Date</th>
                                    <th className="py-3 px-4 text-left">Status</th>
                                    <th className="py-3 px-4 text-left">Download</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((conv) => (
                                    <tr key={conv.id} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4 truncate">{conv.original_filename}</td>
                                        <td className="py-3 px-4">{new Date(conv.date).toLocaleDateString()}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                conv.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                conv.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {conv.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            {conv.status === 'completed' && conv.converted_filename ? (
                                                <button onClick={() => handleDownload(conv.converted_filename!)} className="text-blue-600 hover:underline">
                                                    Download
                                                </button>
                                            ) : 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>You have no conversion history yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
