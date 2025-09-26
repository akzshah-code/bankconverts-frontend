// src/components/Converter.tsx

import { useState } from 'react';
import { UploadCloud, FileText, Download, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import axios from 'axios';

const Converter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setError(null);
      setDownloadUrl(null); // Reset on new file selection
    }
  };

  const handleConvert = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setDownloadUrl(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);

    try {
      // 1. POST to /api/convert and expect a JSON response
      const response = await axios.post('/api/convert', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // 2. Check for the downloadUrl in the response
      if (response.data?.downloadUrl) {
        setDownloadUrl(response.data.downloadUrl);
      } else {
        // Handle cases where the backend returns an error message in a 200 OK response
        setError(response.data.error || 'An unexpected error occurred.');
      }
    } catch (err: any) {
      console.error('Conversion API failed:', err);
      // Display the specific error from the backend if available
      const errorMessage = err.response?.data?.error || 'File conversion failed. Please try again.';
      setError(errorMessage);
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
              <p className="text-xs text-gray-500 mt-1">Supported formats: PDF, JPG, PNG</p>
            </div>
          </label>
        </div>

        {file && !downloadUrl && (
          <div className="mt-6 flex items-center justify-center bg-gray-100 p-3 rounded-lg">
            <FileText className="w-5 h-5 text-gray-600" />
            <span className="ml-3 text-gray-800 font-medium">{file.name}</span>
          </div>
        )}

        {error && <p className="mt-4 text-center text-red-600 font-medium">{error}</p>}

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
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Action Button: Changes from Convert to Download */}
        <div className="mt-8">
          {!downloadUrl ? (
            <button
              onClick={handleConvert}
              disabled={!file || isLoading}
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center"
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
          ) : (
            <a
              href={downloadUrl}
              download
              className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Your File
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default Converter;

