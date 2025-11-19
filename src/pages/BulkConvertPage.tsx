// src/pages/BulkConvertPage.tsx

import React from 'react';
import FileUploader from '../components/FileUploader';

const BulkConvertPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-brand-dark">
            Bulk Statement Converter
          </h1>
          <p className="mt-2 text-lg text-brand-gray max-w-2xl mx-auto">
            Batch‑process multiple statements at once (up to 20&nbsp;MB total per batch).
            We&apos;ll process them together and give you a single combined download.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <FileUploader />
        </div>
      </main>
    </div>
  );
};

export default BulkConvertPage;