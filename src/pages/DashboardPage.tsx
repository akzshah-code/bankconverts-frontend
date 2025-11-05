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
    
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);

    const apiUrl = import.meta.env.VITE_API_URL || 'https://bankconverts-backend-499324155791.asia-south1.run.app';

    const fetchHistory = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const response = await fetch(`${apiUrl}/api/history`);
            if (!response.ok) throw new Error('Failed to fetch conversion history.');
            const data: Conversion[] = await response.json();
            setHistory(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
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

    // Handler for the file conversion submission
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
            const response = await fetch(`${apiUrl}/api/extract`, {
                method: 'POST',
                body: formData,
            });
            
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Conversion failed.');
            }
            
            // --- THIS IS THE FINAL FIX ---
            alert(result.message || 'Conversion successful! Download will begin shortly.');
            
            // Construct the full, absolute URL for the download
            if (result.downloadUrl) {
                const downloadUrl = `${apiUrl}${result.downloadUrl}`;
                // Trigger the download by creating a temporary link
                const link = document.createElement('a');
                link.href = downloadUrl;
                // The backend should send the correct filename, but we can set it here too
                link.setAttribute('download', result.downloadUrl.split('/').pop() || 'download.xlsx');
                document.body.appendChild(link);
                link.click();
                link.parentNode?.removeChild(link);
            }
            // ---------------------------

            await fetchHistory(); // Refresh the history table

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsConverting(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
            if (passwordInputRef.current) passwordInputRef.current.value = "";
        }
    };
    
    // ... (handleDownload function and the rest of the component are unchanged) ...
    const handleDownload = async (filename: string) => {
        if (!isAuthenticated) {
            setError("Authentication error. Please log in again.");
            return;
        }
        try {
            // CORRECT: No 'Authorization' header needed
            const response = await fetch(`${apiUrl}/api/download/${filename}`);


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
        return <div className="flex items-center justify-center h-screen">Loading dashboard...</div>;
    }


    return (
        <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
            <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                    {/* CORRECT: Use 'user.email' from the new context */}
                    {user ? `Welcome, ${user.email}!` : 'Dashboard'}
                </h1>
                <button 
                    onClick={() => { logout(); navigate('/login'); }} 
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg w-full md:w-auto"
                >
                    Logout
                </button>
            </header>


            <main>
                <section className="bg-white shadow-lg rounded-lg p-6 mb-8">
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-4">New Conversion</h2>
                    <div className="space-y-4">
                        <input type="file" ref={fileInputRef} accept=".pdf,.jpg,.jpeg,.png" className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        <input type="password" ref={passwordInputRef} placeholder="PDF Password (if any)" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                        <button onClick={handleConvert} disabled={isConverting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 transition-colors">
                            {isConverting ? 'Processing...' : 'Convert to Excel'}
                        </button>
                        {error && <p className="text-red-500 text-center text-sm mt-2">{error}</p>}
                    </div>
                </section>


                <section className="bg-white shadow-lg rounded-lg p-6">
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-4">Conversion History</h2>
                    <div className="overflow-x-auto">
                        {history.length > 0 ? (
                            <table className="min-w-full bg-white">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {history.map((conv) => (
                                        <tr key={conv.id} className="hover:bg-gray-50">
                                            <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-800 truncate" title={conv.original_filename}>{conv.original_filename}</td>
                                            <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{new Date(conv.date).toLocaleDateString()}</td>
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    conv.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    conv.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {conv.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 whitespace-nowrap text-sm font-medium">
                                                {conv.status === 'completed' && conv.converted_filename ? (
                                                    <button onClick={() => handleDownload(conv.converted_filename!)} className="text-blue-600 hover:text-blue-900">
                                                        Download
                                                    </button>
                                                ) : <span className="text-gray-400">N/A</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-center text-gray-500 py-4">You have no conversion history yet.</p>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};


export default DashboardPage;
