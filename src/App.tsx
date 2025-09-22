// src/App.tsx

import React, { useState } from 'react';
import './App.css'; 

// You can remove the FileUploader import if you are not using it yet
// import FileUploader from './components/FileUploader';

function App() {
  // --- State variables MUST be inside the component ---
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [password, setPassword] = useState('');

  // --- Event handler for file input change ---
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  // --- Upload logic function, also inside the component ---
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert("Please select files to upload.");
      return;
    }
  
    const formData = new FormData();
    selectedFiles.forEach((file: File) => {
      formData.append('files', file);
    });
    formData.append('password', password);
  
    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });
  
      // --- THIS IS THE KEY FIX ---
      // If the response is NOT okay, then it's an error with a JSON body.
      if (!response.ok) {
        const errorData = await response.json(); // Only call .json() on errors.
        throw new Error(errorData.error || 'File conversion failed.');
      }
  
      // If the response IS okay, it's the zip file. Process it as a blob.
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted_statements.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      
    } catch (error: any) {
      // This will now catch both network errors and the specific JSON error from the backend.
      alert(`Error: ${error.message}`);
    }
  };


  // --- JSX to render the UI ---
  return (
    <div className="App">
      <h1>Welcome to BankConverts.com</h1>
      <p>Your reliable bank statement conversion tool.</p>

      {/* The input now correctly calls handleFileChange */}
      <input type="file" multiple onChange={handleFileChange} />

      {selectedFiles.length > 0 && (
        <p>{selectedFiles.length} file(s) selected</p>
      )}

      <input 
        type="password" 
        placeholder="PDF Password (if any)" 
        value={password}
        onChange={(e) => setPassword(e.target.value)} 
      />
      
      {/* The button now correctly calls handleUpload */}
      <button onClick={handleUpload}>Upload and Convert</button>
    </div>
  );
}

export default App;
