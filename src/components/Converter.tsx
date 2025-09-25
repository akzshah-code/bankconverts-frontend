// src/components/Converter.tsx

import { useState } from 'react';
import { UploadCloud, FileText, Download, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import axios from 'axios';
import './Converter.css';

const Converter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setError(null); // Clear previous errors on new file selection
    }
  };

  const handleConvert = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Use FormData to send the file and password
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);

    try {
      // Make the API request to your Flask backend
      const response = await axios.post('/api/upload-statement', formData, {
        responseType: 'blob', // Important: we expect a file back
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Create a temporary URL for the blob data
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a hidden link to trigger the download
      const link = document.createElement('a');
      link.href = url;
      const downloadName = file.name.replace(/\.[^/.]+$/, '.xlsx');
      link.setAttribute('download', downloadName);
      document.body.appendChild(link);
      link.click();

      // Clean up by revoking the object URL and removing the link
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Conversion failed:', err);
      setError('File conversion failed. Please check the file and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Convert Your Bank Statement
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Upload a PDF or image file to get a clean Excel spreadsheet in seconds.
        </p>

        {/* File Upload Area */}
        <div className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors ${error ? 'border-red-500' : 'border-gray-300'}`}>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            disabled={isLoading}
          />
          <label htmlFor="file-upload" className={isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}>
            <div className="flex flex-col items-center">
              <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-700 font-semibold">
                Drag & drop your file here, or click to select a file
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: PDF, JPG, PNG
              </p>
            </div>
          </label>
        </div>

        {file && (
          <div className="mt-6 flex items-center justify-center bg-gray-100 p-3 rounded-lg">
            <FileText className="w-5 h-5 text-gray-600" />
            <span className="ml-3 text-gray-800 font-medium">{file.name}</span>
          </div>
        )}

        {error && (
            <p className="mt-4 text-center text-red-600 font-medium">{error}</p>
        )}

        {/* Password Input */}
        <div className="mt-6 relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter PDF Password (if any)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed"
            disabled={isLoading}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Convert Button */}
        <div className="mt-8">
          <button
            onClick={handleConvert}
            disabled={!file || isLoading}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <LoaderCircle className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Convert to Excel
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Converter;