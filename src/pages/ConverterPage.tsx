// src/pages/ConverterPage.tsx

import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ConverterPage: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Destructure token and user from our corrected AuthContext
    const { token, user } = useAuth();
    const navigate = useNavigate();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleConvert = useCallback(async () => {
        if (!file) {
            setError('Please select a file to convert.');
            return;
        }

        // Check for token before making the request
        if (!token) {
            setError('Authentication error. Please log in again.');
            navigate('/login');
            return;
        }

        setIsLoading(true);
        setError('');
        setMessage('');

        const formData = new FormData();
        formData.append('file', file);
        if (password) {
            formData.append('password', password);
        }

        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://bankconverts-backend-499324155791.asia-south1.run.app';

        try {
            // --- CORE FIX: Using FETCH with the correct Authorization Header ---
            const response = await fetch(`${apiUrl}/api/extract`, {
                method: 'POST',
                headers: {
                    // This line is CRITICAL for authentication
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                // Throw an error to be caught by the catch block
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }
            
            setMessage(data.message);
            
            // --- Automatic Download Logic ---
            if (data.downloadUrl) {
                const downloadResponse = await fetch(`${apiUrl}${data.downloadUrl}`, {
                    headers: {
                        'Authorization': `Bearer ${token}` // Auth needed for download too
                    }
                });

                if (!downloadResponse.ok) {
                    throw new Error('Failed to download the converted file.');
                }
                
                const blob = await downloadResponse.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                
                const filename = data.downloadUrl.split('/').pop();
                link.setAttribute('download', filename || 'converted-file.xlsx');
                
                document.body.appendChild(link);
                link.click();
                link.parentNode?.removeChild(link);
            }
            
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred during conversion.');
            console.error('Extraction failed:', err);
        } finally {
            setIsLoading(false);
        }
    }, [file, password, token, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-800">Convert Your Bank Statement</h2>
                <p className="text-center text-gray-600">
                    {user ? `Welcome, ${user.username}!` : "Upload a PDF or image file to get a clean Excel spreadsheet in seconds."}
                </p>
                
                {token ? (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="file-upload" className="sr-only">Choose file</label>
                            <input
                                id="file-upload"
                                type="file"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                accept=".pdf,.jpg,.jpeg,.png"
                            />
                        </div>
                        <div>
                            <label htmlFor="pdf-password" className="sr-only">PDF Password</label>
                            <input
                                id="pdf-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="PDF Password (if any)"
                                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            onClick={handleConvert}
                            disabled={isLoading || !file}
                            className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-400"
                        >
                            {isLoading ? 'Converting...' : 'Convert to Excel'}
                        </button>
                    </div>
                ) : (
                    <p className="text-center text-red-500">Please log in to use the converter.</p>
                )}

                {message && <p className="text-center text-green-600">{message}</p>}
                {error && <p className="text-center text-red-600">{error}</p>}

                <p className="text-xs text-center text-gray-500">Supported formats: PDF, JPG, PNG</p>
            </div>
        </div>
    );
};

export default ConverterPage;
