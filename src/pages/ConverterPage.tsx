// src/pages/ConverterPage.tsx

import FileUploader from '../components/FileUploader';
import Seo from '../components/Seo'; // 1. Import the Seo component

{/* 2. Add the Seo component with page-specific content */}
      <Seo 
        title="Convert Bank Statements – Fast, Secure, and Reliable" 
        description="Upload and convert your bank statements with BankConvert’s AI-powered engine. Get structured outputs with fallback diagnostics and error handling."
        keywords="convert bank statement, pdf to excel, bank statement AI converter, CA tools"
        canonicalUrl="https://www.bankconverts.com/converterpage"
      />

const ConverterPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 py-12">
      {/* 
        Since your FileUploader component handles everything internally 
        (file selection, preview, and conversion), we can use it directly.
        This simplifies the code and fixes the error.
      */}
      <FileUploader />
    </div>
  );
};

export default ConverterPage;
