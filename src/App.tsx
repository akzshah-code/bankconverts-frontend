// bankconverts-frontend/src/App.tsx

import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setMessage('');
      setError('');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setIsUploading(true);
    setError('');
    setMessage('Initializing upload...');

    try {
      // Step 1: Request a signed URL from your backend
      console.log("Requesting signed URL for:", file.name);
      const backendResponse = await axios.post(`${import.meta.env.VITE_API_URL}/api/generate-upload-url`, {
        filename: file.name,
        contentType: file.type
      });

      const { signedUrl, blobName } = backendResponse.data;
      console.log("Received signed URL. Uploading file directly to storage...");
      setMessage('Uploading file...');

      // Step 2: Upload the file directly to Google Cloud Storage using the signed URL
      await axios.put(signedUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
      });
      
      console.log("File uploaded successfully! Blob name:", blobName);
      
      setMessage(`File '${file.name}' uploaded successfully. Processing will begin shortly.`);
      setFile(null); // Clear the file input after successful upload

    } catch (err) {
      console.error("An error occurred during the upload process:", err);
      setError('An error occurred during conversion. Please try again.');
      setMessage('');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Transfer Statements. Unlock Data.</h1>
        <p>The fastest and most accurate way to convert bank statements to Excel.</p>
      </header>

      <main>
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="file-input-wrapper">
            <input 
              type="file" 
              id="file" 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
            />
            <label htmlFor="file" className="file-input-label">
              {file ? `Selected file: ${file.name}` : 'Click to select a file'}
            </label>
          </div>

          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Enter PDF Password (if any)"
            className="password-input"
          />

          <button type="submit" className="convert-button" disabled={!file || isUploading}>
            {isUploading ? 'Uploading...' : 'Convert to Excel'}
          </button>

          {message && <p className="message success">{message}</p>}
          {error && <p className="message error">{error}</p>}
        </form>
      </main>

      <section className="features">
        <h2>Why Choose BankConverts?</h2>
        {/* You can add feature descriptions or other content here */}
      </section>
    </div>
  );
}

export default App;
