// src/components/Converter.tsx
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Eye, EyeOff } from 'lucide-react'; // Using lucide-react for icons

type Status = 'idle' | 'uploading' | 'success' | 'error';

const Converter: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setStatus('idle');
      setMessage('');
      setDownloadUrl('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleConvert = async () => {
    if (!selectedFile) {
      setStatus('error');
      setMessage('Please select a file first.');
      return;
    }
    
    setStatus('uploading');
    setMessage('Uploading and processing... This may take a moment.');
    setDownloadUrl('');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('password', password);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/convert', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const result = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(result.message);
        setDownloadUrl(result.downloadUrl);
      } else {
        setStatus('error');
        setMessage(`Error: ${result.error || 'An unknown error occurred.'}`);
      }
    } catch (error: any) {
      setStatus('error');
      if (error.name === 'AbortError') {
        setMessage('The request timed out. The file might be too large or complex.');
      } else {
        setMessage('Failed to connect to the backend server. Is it running?');
      }
    }
  };

  return (
    <div className="bg-white">
      <div className="container mx-auto px-6 pt-8 pb-20 text-center">
        <h2 className="text-5xl font-bold text-center text-gray-900 mb-2">
          Convert Your Bank Statement
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Upload a PDF or image file to get a clean Excel spreadsheet in seconds.
        </p>
        <div className="mt-8 max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'}`}>
            <input {...getInputProps()} />
            <svg className="w-16 h-26 text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
            {selectedFile ? <p className="text-lg font-semibold text-gray-700">{selectedFile.name}</p> : <><p className="text-lg font-semibold text-gray-700">Drag & Drop Your Files Here</p><p className="mt-1 text-sm text-gray-500">or <span className="text-blue-600 font-medium">click to browse</span></p></>}
          </div>
          
          {/* --- Updated Password Input --- */}
          <div className="mt-4 relative">
            <input 
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter PDF Password (if any)" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-600 hover:text-blue-500"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-4 text-center">Supported formats: PDF, JPG, PNG, CSV</p>
          
          <button onClick={handleConvert} disabled={status === 'uploading'} className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl text-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-gray-400 disabled:cursor-not-allowed">
            {status === 'uploading' ? 'Processing...' : 'Convert to Excel'}
          </button>
          
          {message && <p className={`mt-4 text-sm font-semibold ${status === 'error' ? 'text-red-500' : 'text-gray-700'}`}>{message}</p>}
          
          {status === 'success' && downloadUrl && (
            <a href={`http://127.0.0.1:5000${downloadUrl}`} download className="w-full mt-4 inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-4 rounded-xl text-lg transition-colors">
              Download Converted File
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default Converter;

