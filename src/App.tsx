// src/App.tsx

import React from 'react';
import FileUploader from './components/FileUploader'; // Import from the .tsx file
import './App.css';

function App(): React.JSX.Element {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to BankConverts.com</h1>
        <p>Your reliable bank statement conversion tool.</p>
      </header>
      <main>
        <FileUploader />
      </main>
    </div>
  );
}

export default App;
