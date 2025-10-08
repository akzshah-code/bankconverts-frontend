// src/components/FileUploader.tsx
import React, { useState } from 'react';
import DataPreviewTable from './DataPreviewTable';
import { UpgradeButton } from './UpgradeButton';

interface Transaction {
  [key: string]: any;
}

function FileUploader(): React.JSX.Element {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<Transaction[] | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) setSelectedFile(event.target.files[0]);
  };
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first.');
      return;
    }
    setIsProcessing(true);
    setError('');
    const formData = new FormData();
    formData.append('file', selectedFile);
    if (password) formData.append('password', password);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const extractResponse = await fetch(`${apiUrl}/extract`, {
        method: 'POST',
        body: formData,
      });
      const data = await extractResponse.json();
      if (!extractResponse.ok) throw new Error(data.error || 'Failed to extract data.');
      setExtractedData(data);
      setShowPreview(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmConvert = async (editedData: Transaction[]) => {
    setIsProcessing(true);
    setError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const convertResponse = await fetch(`${apiUrl}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'xlsx', data: editedData }),
      });
      if (!convertResponse.ok) throw new Error('Failed to convert data.');
      const blob = await convertResponse.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `transactions.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      setShowPreview(false);
      setExtractedData(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelPreview = () => {
    setShowPreview(false);
    setExtractedData(null);
    setError('');
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto p-6 bg-white rounded-xl shadow-xl">
      {/* Main header and subheader */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Convert Your Bank Statement</h2>
        <p className="mt-2 text-base text-gray-600">
          Upload a PDF or image file to get a clean Excel spreadsheet in seconds.
        </p>
      </div>
      {showPreview && extractedData ? (
        <DataPreviewTable
          initialData={extractedData}
          onConvert={handleConfirmConvert}
          onCancel={handleCancelPreview}
        />
      ) : (
        <div className="w-full space-y-4">
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.png,.jpg,.jpeg"
            className="block w-full border border-gray-300 rounded-md p-3"
          />
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="PDF Password (if any)"
            className="block w-full border border-gray-300 rounded-md p-3"
          />
          <div className="text-xs text-gray-400 mb-2">Supported formats: PDF, JPG, PNG </div>
          <button
            onClick={handleUpload}
            disabled={isProcessing || !selectedFile}
            className="w-full py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300 font-semibold text-lg"
          >
            {isProcessing ? 'Processing...' : 'Convert to Excel'}
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
      )}
    </div>
  );
}

export default FileUploader;
