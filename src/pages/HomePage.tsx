// src/pages/HomePage.tsx

import { useState } from 'react'; // 1. Import useState
import Seo from '../components/Seo';
import Converter from '../components/Converter';
import Features from '../components/Features';
// Assuming you have a Testimonials component
// import Testimonials from '../components/Testimonials';

      {/* 2. Add the Seo component with page-specific content */}
      <Seo 
        title="Instant Bank Statement to Excel Converter" 
        description="Convert Indian bank statements to structured formats with BankConvert. Trusted by CAs and business owners for secure, accurate, and user-friendly financial tools."
        keywords="bank statement converter, bank statement to excel, pdf to excel, convert bank statement"
        canonicalUrl="https://www.bankconverts.com"
      />

const HomePage = () => {
  // 2. Define the state needed by the Converter component
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfPassword, setPdfPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <div className="text-center py-16 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Transform Statements. Unlock Data.
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          The fastest and most accurate way to convert bank statements to Excel.
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        {/* 3. Pass the state and setters as props to the Converter component */}
        <Converter 
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          pdfPassword={pdfPassword}
          setPdfPassword={setPdfPassword}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          error={error}
          setError={setError}
        />
      </div>
      
      {/* You can now include other sections of your landing page */}
      <Features />
      {/* <Testimonials /> */}
    </>
  );
};

export default HomePage;
