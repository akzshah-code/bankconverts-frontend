import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UploadCloud, File as FileIcon, X, Eye, EyeOff } from 'lucide-react';
import { apiFetch } from '../api/api';

const ConverterPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const { isAuthenticated, login } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const apiUrl = import.meta.env.VITE_API_URL || 'https://api.bankconverts.com';

  useEffect(() => {
    const checkAuthStatus = async () => {
      if (isAuthenticated) return;
      try {
        const r = await apiFetch(`${apiUrl}/api/status`, {}, 'optional');
        if (r.ok) {
          const data = await r.json().catch(() => ({}));
          if (data?.logged_in) login();
        }
      } catch { /* silent for anonymous */ }
    };
    checkAuthStatus();
  }, [isAuthenticated, login, apiUrl]);

  const handleFileSelect = (selectedFile: File | null) => {
    if (selectedFile) {
      const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (allowed.includes(selectedFile.type)) {
        setFile(selectedFile); setError('');
      } else {
        setError('Invalid file type. Please upload a PDF, JPG, or PNG.');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleReset = () => {
    setFile(null); setPassword(''); setMessage(''); setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getIdFromExtract = (data: any): string | number | undefined =>
    data?.file_id ?? data?.id ?? data?.result_id ?? data?.fileId ?? data?.upload_id;

  const getSignedFromDownload = (data: any): string | undefined =>
    data?.signed_url ?? data?.signedUrl;

  const normalizeUrl = (u: string) => u.startsWith('http') ? u : `${apiUrl}${u.startsWith('/') ? '' : '/'}${u}`;

  const pollDownloadById = async (id: string | number) => {
    const maxAttempts = 12;
    let attempt = 0, delay = 1500;
    while (attempt < maxAttempts) {
      try {
        const resp = await apiFetch(`${apiUrl}/api/download/${id}`, {}, 'optional');
        const data = await resp.json().catch(() => ({}));
        const url = getSignedFromDownload(data);
        if (resp.ok && url) return url;
      } catch { /* ignore and retry */ }
      attempt += 1;
      await new Promise(res => setTimeout(res, delay));
      delay = Math.min(10000, Math.floor(delay * 1.6));
    }
    throw new Error('Could not generate download link. Please try again in a moment.');
  };

  const fetchSignedFromDownloadUrl = async (downloadUrl: string) => {
    const target = normalizeUrl(downloadUrl);
    // small retry loop even with direct URL
    const maxAttempts = 8;
    let attempt = 0, delay = 1200;
    while (attempt < maxAttempts) {
      try {
        const resp = await apiFetch(target, {}, 'optional');
        const data = await resp.json().catch(() => ({}));
        const url = getSignedFromDownload(data);
        if (resp.ok && url) return url;
      } catch { /* ignore and retry */ }
      attempt += 1;
      await new Promise(res => setTimeout(res, delay));
      delay = Math.min(8000, Math.floor(delay * 1.6));
    }
    throw new Error('Download link not ready yet. Please retry.');
  };

  const handleConvert = useCallback(async () => {
    if (!file) return;
    setIsLoading(true); setError(''); setMessage('');

    const formData = new FormData();
    formData.append('file', file);
    if (password) formData.append('password', password);

    try {
      const extractResp = await apiFetch(`${apiUrl}/api/extract`, { method: 'POST', body: formData }, 'optional');
      const extractData = await extractResp.json().catch(() => ({}));
      if (!extractResp.ok) throw new Error(extractData?.error || 'Conversion failed.');

      // Prefer direct download URL if backend provides it
      const directDownload = extractData?.downloadUrl ?? extractData?.download_url;
      const id = getIdFromExtract(extractData);

      if (!directDownload && !id) {
        throw new Error('No file identifier returned from server. Please try again.');
      }

      setMessage('Conversion successful! Preparing download...');

      let signedUrl: string;
      if (directDownload) signedUrl = await fetchSignedFromDownloadUrl(directDownload);
      else signedUrl = await pollDownloadById(id!);

      window.location.href = signedUrl;
      handleReset();
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }, [file, password, apiUrl]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl p-6 md:p-8 space-y-6 bg-white rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-center text-gray-800">Convert Your Bank Statement</h1>
        <p className="text-center text-gray-500">AI-powered, fast, and secure. Upload a PDF or image to get a clean Excel file.</p>

        <div className="relative">
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className={`w-10 h-10 mb-4 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-gray-500">PDF, PNG, JPG (MAX. 10MB)</p>
              </div>
              <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => handleFileSelect(e.target.files?.[0] || null)} accept=".pdf,.png,.jpg,.jpeg" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-56 border-2 border-solid border-green-500 bg-green-50 rounded-lg p-4">
              <FileIcon className="w-10 h-10 mb-3 text-green-600" />
              <p className="font-semibold text-gray-700 truncate max-w-full px-2" title={file.name}>{file.name}</p>
              <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
              <button onClick={handleReset} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
          )}
        </div>

        {file && (
          <div className="space-y-4 pt-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="PDF Password (if any)"
                className="w-full px-4 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={handleReset} className="w-1/3 px-4 py-2 font-bold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">Start Over</button>
              <button onClick={handleConvert} disabled={isLoading} className="w-2/3 px-4 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                {isLoading ? 'Converting...' : 'Convert to Excel'}
              </button>
            </div>
          </div>
        )}

        {message && <p className="text-center text-green-600 mt-4">{message}</p>}
        {error && <p className="text-center text-red-600 mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default ConverterPage;
