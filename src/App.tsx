// Example: src/App.tsx

import React, { useState } from 'react';

function App() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [password, setPassword] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      // Store all selected files in an array
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert("Please select files to upload.");
      return;
    }

    const formData = new FormData();
    // Append each file to the FormData object
    selectedFiles.forEach(file => {
      formData.append('files', file); // Use 'files' as the key
    });

    // You can also append other data, like passwords
    formData.append('password', password);

    // Send the request to your backend
    const response = await fetch('/api/convert', { // Your backend API endpoint
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      // Handle the successful response, e.g., trigger a download
      alert('Files converted successfully!');
    } else {
      alert('File conversion failed.');
    }
  };

  return (
    <div>
      <h1>Welcome to BankConverts.com</h1>
      <p>Your reliable bank statement conversion tool.</p>
      
      {/* Add 'multiple' to the input element */}
      <input type="file" multiple onChange={handleFileChange} />

      {/* Optional: Display the number of selected files */}
      {selectedFiles.length > 0 && (
        <p>{selectedFiles.length} file(s) selected</p>
      )}

      <input 
        type="password" 
        placeholder="PDF Password (if any)" 
        value={password}
        onChange={(e) => setPassword(e.target.value)} 
      />
      
      <button onClick={handleUpload}>Upload and Convert</button>
    </div>
  );
}

export default App;
