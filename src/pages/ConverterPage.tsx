// src/pages/ConverterPage.tsx

import React, { useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';

const ConverterPage: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    // CORRECT: Only need 'isAuthenticated' from the new context
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const apiUrl = import.meta.env.VITE_API_URL || 'https://bankconverts-backend-499324155791.asia-south1.run.app';

    const handleFileSelect = (selectedFile: File | null) => {
        if (selectedFile) {
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
            if (allowedTypes.includes(selectedFile.type)) {
                setFile(selectedFile);
                setError('');
            } else {
                setError('Invalid file type. Please upload a PDF, JPG, or PNG.');
            }
        }
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (isAuthenticated) setIsDragOver(true);
    };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
    };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        if (isAuthenticated && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    const onBrowseFileClick = () => {
        if (isAuthenticated) fileInputRef.current?.click();
    };

    const handleReset = () => {
        setFile(null);
        setPassword('');
        setMessage('');
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleConvert = useCallback(async () => {
        if (!file) return;
        if (!isAuthenticated) {
            setError('Please log in to use the converter.');
            return;
        }

        setIsLoading(true);
        setError('');
        setMessage('');

        const formData = new FormData();
        formData.append('file', file);
        if (password) formData.append('password', password);

        try {
            // CORRECT: No 'Authorization' header needed
            const response = await fetch(`${apiUrl}/api/extract`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Conversion failed.');
            
            setMessage('Conversion successful! Download will begin shortly.');
            
            if (data.downloadUrl) {
                // CORRECT: No 'Authorization' header needed
                const downloadResponse = await fetch(`${apiUrl}${data.downloadUrl}`);
                if (!downloadResponse.ok) throw new Error('Failed to download file.');
                
                const blob = await downloadResponse.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', data.downloadUrl.split('/').pop() || 'converted-file.xlsx');
                document.body.appendChild(link);
                link.click();
                link.parentNode?.removeChild(link);
                handleReset(); 
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [file, password, isAuthenticated, apiUrl]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-2xl p-6 md:p-8 space-y-6 bg-white rounded-2xl shadow-xl">
                <h1 className="text-3xl font-bold text-center text-gray-800">Convert Your Bank Statement</h1>
                <p className="text-center text-gray-500">AI-powered, fast, and secure. Upload a PDF or image to get a clean Excel file.</p>

                <div className="relative">
                    {!isAuthenticated && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg z-10">
                            <p className="text-gray-700 font-semibold mb-4">Please log in to use the converter.</p>
                            <button onClick={() => navigate('/login')} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700">Sign In</button>
                        </div>
                    )}
                    
                    {!file ? (
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={onBrowseFileClick}
                            className={`flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-lg transition-colors ${!isAuthenticated ? 'cursor-not-allowed bg-gray-100' : 'cursor-pointer'} ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadCloud className={`w-10 h-10 mb-4 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
                                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-gray-500">PDF, PNG, JPG (MAX. 10MB)</p>
                            </div>
                            <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => handleFileSelect(e.target.files?.[0] || null)} accept=".pdf,.png,.jpg,.jpeg" disabled={!isAuthenticated} />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center w-full h-56 border-2 border-solid border-green-500 bg-green-50 rounded-lg p-4">
                            <FileIcon className="w-10 h-10 mb-3 text-green-600" />
                            <p className="font-semibold text-gray-700 truncate max-w-full px-2" title={file.name}>{file.name}</p>
                            <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                            <button onClick={handleReset} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                    )}
                </div>

                {file && (
                    <div className="space-y-4 pt-4">
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="PDF Password (if any)" className="w-full px-4 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <div className="flex items-center gap-4">
                            <button onClick={handleReset} className="w-1/3 px-4 py-2 font-bold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">Start Over</button>
                            <button onClick={handleConvert} disabled={isLoading} className="w-2/3 px-4 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                                {isLoading ? 'Converting...' : 'Convert to Excel'}
                            </button>
                        </div>
                    </div>
                )}
                
                {message && <p className="text-center text-green-600 mt-4">{message}</p>}
                {error && <p className="text-center text-red-600 mt-4">{error}</p>}
            </div>
        </div>
    );
};

export default ConverterPage;
