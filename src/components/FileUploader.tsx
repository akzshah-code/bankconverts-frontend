// src/components/FileUploader.tsx

import React, { useState } from 'react';
import DataPreviewTable from './DataPreviewTable'; // Import the new component

// Define a type for the transaction data
interface Transaction {
  [key: string]: any;
}

function FileUploader(): React.JSX.Element {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // --- NEW STATE for managing the preview table ---
  const [extractedData, setExtractedData] = useState<Transaction[] | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
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
      // Step 1: Call the /extract endpoint
      const extractResponse = await fetch('http://127.0.0.1:5000/extract', {
        method: 'POST',
        body: formData,
      });
      const data = await extractResponse.json();
      if (!extractResponse.ok) {
        throw new Error(data.error || 'Failed to extract data.');
      }
      
      // --- MODIFICATION: Set data for preview instead of converting immediately ---
      setExtractedData(data);
      setShowPreview(true);

    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('An unknown error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  // --- NEW FUNCTION: Called when user confirms the edited data ---
  const handleConfirmConvert = async (editedData: Transaction[]) => {
    setIsProcessing(true);
    setError('');
    try {
      const convertResponse = await fetch('http://127.0.0.1:5000/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'xlsx',
          data: editedData,
        }),
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
      
      // Reset to the initial view
      setShowPreview(false);
      setExtractedData(null);

    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('An unknown error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  // --- NEW FUNCTION: Called when user cancels the preview ---
  const handleCancelPreview = () => {
    setShowPreview(false);
    setExtractedData(null);
    setError('');
  };

  return (
    <div>
      {showPreview && extractedData ? (
        // --- If showPreview is true, render the editable table ---
        <DataPreviewTable
          initialData={extractedData}
          onConvert={handleConfirmConvert}
          onCancel={handleCancelPreview}
        />
      ) : (
        // --- Otherwise, render the initial upload form ---
        <div>
          <h2>Bank Statement Converter</h2>
          <input type="file" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg" />
          <br />
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="PDF Password (if any)"
          />
          <br />
          <button onClick={handleUpload} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Upload and Extract'}
          </button>
          {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        </div>
      )}
    </div>
  );
}

export default FileUploader;
