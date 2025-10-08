// src/components/Converter.tsx

import React from 'react';
import { UpgradeButton } from './UpgradeButton';

const API_URL = import.meta.env.VITE_API_URL;

interface ConverterProps {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  pdfPassword: string;
  setPdfPassword: (password: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const Converter: React.FC<ConverterProps> = ({
  selectedFile,
  setSelectedFile,
  pdfPassword,
  setPdfPassword,
  isLoading,
  setIsLoading,
  error,
  setError,
}) => {
  const handleConvert = async () => {
    if (!selectedFile) {
      setError('Please select a file first.');
      return;
    }
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('password', pdfPassword);

    try {
      const token = localStorage.getItem('access_token');
      const convertUrl = `${API_URL}/convert`;
      
      const convertResponse = await fetch(convertUrl, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
        signal: AbortSignal.timeout(300000),
      });

      if (!convertResponse.ok) {
        if (convertResponse.status === 401) {
          localStorage.removeItem('access_token');
          throw new Error('Your session has expired. Please log in again or try converting as an anonymous user.');
        }
        const errorData = await convertResponse.json();
        throw new Error(errorData.error || errorData.msg || 'An unknown error occurred.');
      }

      const convertData = await convertResponse.json();
      const downloadUrl = `${API_URL}${convertData.downloadUrl}`;

      const downloadResponse = await fetch(downloadUrl, {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!downloadResponse.ok) {
        throw new Error('Failed to download the converted file.');
      }
      
      const blob = await downloadResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadUrl.split('/').pop() || 'converted-file.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('The request timed out. The server is taking too long to respond.');
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg p-6 sm:p-8 space-y-6 bg-white rounded-lg shadow-xl">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Upload a PDF or Image File
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Get a clean Excel spreadsheet in seconds.
        </p>
      </div>
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
      />
      <div className="relative">
        <input
          type="password"
          value={pdfPassword}
          onChange={e => setPdfPassword(e.target.value)}
          placeholder="Enter PDF Password (if any)"
          className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        onClick={handleConvert}
        disabled={isLoading || !selectedFile}
        className="w-full py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors font-semibold"
      >
        {isLoading ? 'Converting...' : 'Convert to Excel'}
      </button>
      
      {error && (
        <div className="mt-4 text-center">
          <p className="text-sm text-red-500">{error}</p>
          {(error.toLowerCase().includes('expired') || error.toLowerCase().includes('upgrade')) && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-semibold mb-2">Choose a Plan to Continue</h4>
              <div className="space-y-2">
                <UpgradeButton 
                  planId="plan_RPmoQl9lVpHzjt"
                  buttonText="Starter Monthly - ₹975/mo"
                />
                <UpgradeButton 
                  planId="plan_RPmvqA3nPDcVgN"
                  buttonText="Starter Yearly - ₹9,750/yr (Save 16%)"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Converter;
