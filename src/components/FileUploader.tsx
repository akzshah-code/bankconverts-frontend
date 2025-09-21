// src/components/FileUploader.tsx

import React, { useState } from 'react';

function FileUploader(): React.JSX.Element {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Type the event for the file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  // Type the event for the password input change
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
    if (password) {
      formData.append('password', password);
    }

    try {
      // Step 1: Call the /extract endpoint
      const extractResponse = await fetch('http://127.0.0.1:5000/extract', {
        method: 'POST',
        body: formData,
      });

      const extractedData = await extractResponse.json();

      if (!extractResponse.ok) {
        throw new Error(extractedData.error || 'Failed to extract data.');
      }
      
      // Step 2: Call the /convert endpoint
      const convertResponse = await fetch('http://127.0.0.1:5000/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format: 'xlsx', // You can make this selectable
          data: extractedData,
        }),
      });

      if (!convertResponse.ok) {
        throw new Error('Failed to convert data.');
      }

      // Step 3: Handle the file download
      const blob = await convertResponse.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `transactions.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

    } catch (err) {
      // Type assertion for the error object
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
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
        {isProcessing ? 'Processing...' : 'Upload and Convert'}
      </button>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </div>
  );
}

export default FileUploader;
