// src/pages/ConverterPage.tsx

import { useState } from 'react';
import Converter from '../components/Converter';
import Seo from '../components/Seo'; // 1. Import the Seo component

{/* 2. Add the Seo component with page-specific content */}
      <Seo 
        title="Convert Bank Statements – Fast, Secure, and Reliable" 
        description="Upload and convert your bank statements with BankConvert’s AI-powered engine. Get structured outputs with fallback diagnostics and error handling."
        keywords="convert bank statement, pdf to excel, bank statement AI converter, CA tools"
        canonicalUrl="https://www.bankconverts.com/converterpage"
      />

const ConverterPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfPassword, setPdfPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
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
  );
};

export default ConverterPage;
