
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

type Status = 'idle' | 'uploading' | 'success' | 'error';

const Hero: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setStatus('idle');
      setMessage('');
      setDownloadUrl('');
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleConvert = async () => {
    if (!selectedFile) {
      setStatus('error');
      setMessage('Please select a file first.');
      return;
    }
    setStatus('uploading');
    setMessage('Uploading and processing...');
    setDownloadUrl('');
    try {
      // Step 1: Request signed URL from backend using environment variable
      const backendUrl = import.meta.env.VITE_API_URL || '';
      if (!backendUrl) {
        throw new Error('Backend API URL is not defined');
      }
      const response = await fetch(`${backendUrl}/api/generate-upload-url`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          filename: selectedFile.name,
          contentType: selectedFile.type
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to get signed URL');
      }
      // const { signedUrl, blobName } = result;
       const { signedUrl } = result;

      // Step 2: Upload to Google Cloud Storage signed URL
      await fetch(signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': selectedFile.type,
        },
        body: selectedFile,
      });

      setStatus('success');
      setMessage('File uploaded successfully. Processing shortly.');
      // The processing result URL should come via some notification mechanism
      // Here you can update downloadUrl accordingly if applicable
      setDownloadUrl(''); // clear previous

    } catch (error: any) {
      setStatus('error');
      setMessage(`Error: ${error.message || 'Upload failed'}`);
    }
  };

  return (
    <div className="bg-white">
      <div className="container mx-auto px-6 pt-8 pb-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          Convert <span className="text-blue-600">Bank Statements</span> to <span className="text-green-500">Excel</span> in Seconds
        </h1>
        <p className="mt-4 text-base text-gray-600 max-w-4xl mx-auto">
          Upload your PDF or scanned image and get a clean, ready-to-use Excel or CSV file instantly.
        </p>
        <div className="mt-8 max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all duration-300 ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'
            } cursor-pointer`}
          >
            <input {...getInputProps()} />
            {/* SVG icon */}
            <svg
              className="w-16 h-16 text-blue-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {selectedFile ? (
              <p className="text-lg font-semibold text-gray-700">{selectedFile.name}</p>
            ) : (
              <>
                <p className="text-lg font-semibold text-gray-700">Drag & Drop Your Files Here</p>
                <p className="mt-1 text-sm text-gray-500">or <span className="text-blue-600 font-medium">click to browse</span></p>
              </>
            )}
          </div>
          <div className="mt-4">
            <input
              type="password"
              placeholder="Enter PDF Password (if any)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <p className="text-xs text-gray-400 mt-4 text-center">
            Supported formats: PDF, JPG, PNG, TXT, CSV
          </p>
          {/* Convert button */}
          <button
            onClick={handleConvert}
            disabled={status === 'uploading'}
            className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl text-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-gray-400"
          >
            {status === 'uploading' ? 'Uploading...' : 'Convert'}
          </button>

          {/* Status message */}
          {message && (
            <p
              className={`mt-4 text-sm font-semibold ${
                status === 'error' ? 'text-red-500' : 'text-gray-700'
              }`}
            >
              {message}
            </p>
          )}

          {/* Download button */}
          {status === 'success' && downloadUrl && (
            <a
              href={downloadUrl}
              download
              className="w-full mt-4 inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-4 rounded-xl text-lg transition-colors"
            >
              Download Converted File
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hero;
