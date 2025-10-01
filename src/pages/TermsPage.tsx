// src/pages/TermsPage.tsx
import React from 'react';

function TermsPage(): React.JSX.Element {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">1. Introduction</h2>
        <p>
          Welcome to BankConverts. By using our service, you agree to be bound by these Terms of Service. Please read them carefully.
          {/* Add the rest of your Terms of Service content here */}
        </p>

        <h2 className="text-xl font-semibold">2. Use of Service</h2>
        <p>
          Our service allows you to convert bank statements into different formats. You are responsible for the data you upload and must have the legal right to use it.
        </p>
        
        {/* ... more sections ... */}
      </div>
    </div>
  );
}

export default TermsPage;
