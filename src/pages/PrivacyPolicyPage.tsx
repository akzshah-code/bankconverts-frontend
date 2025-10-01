// src/pages/PrivacyPolicyPage.tsx
import React from 'react';

function PrivacyPolicyPage(): React.JSX.Element {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Information We Collect</h2>
        <p>
          We collect information you provide directly to us, such as your email address when you register. We also temporarily process the files you upload for conversion.
          {/* Add the rest of your Privacy Policy content here */}
        </p>

        <h2 className="text-xl font-semibold">How We Use Information</h2>
        <p>
          We use the information we collect to operate, maintain, and provide the features and functionality of the service. We do not store your financial data after the conversion is complete and the retention period has passed.
        </p>

        {/* ... more sections ... */}
      </div>
    </div>
  );
}

export default PrivacyPolicyPage;
