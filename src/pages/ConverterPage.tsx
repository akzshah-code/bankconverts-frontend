// src/pages/ConverterPage.tsx

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import {
  UploadCloud,
  File as FileIcon,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';
import { apiFetch } from '../api/api';
import { useAuth } from '../context/AuthContext';
import DataPreviewTable from '../components/DataPreviewTable';

interface Transaction {
  [key: string]: any;
}

const CSV_SEPARATOR = ',';
const BASE_HEADERS = [
  'Date',
  'Narration',
  'Cheque/Reference#',
  'Debit',
  'Credit',
  'Balance',
];

const ConverterPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const [transactionsData, setTransactionsData] = useState<
    Transaction[]
  >([]);
  const [pagesUsed, setPagesUsed] = useState<number>(0);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const {
    isAuthenticated,
    isLoading: authLoading,
    refreshStatus,
  } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const apiUrl =
    import.meta.env.VITE_API_URL || 'https://api.bankconverts.com';

  useEffect(() => {
    const checkAuthStatus = async () => {
      if (isAuthenticated || authLoading) return;
      try {
        const r = await apiFetch(
          `${apiUrl}/api/status`,
          {},
          'optional',
        );
        if (r.ok) {
          await refreshStatus();
        }
      } catch {
        // guest allowed
      }
    };
    checkAuthStatus();
  }, [isAuthenticated, authLoading, refreshStatus, apiUrl]);

  const handleFileSelect = (selectedFile: File | null) => {
    if (selectedFile) {
      const allowed = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/jpg',
      ];
      if (allowed.includes(selectedFile.type)) {
        setFile(selectedFile);
        setError('');
        setTransactionsData([]);
        setPagesUsed(0);
        setShowPreview(false);
        setMessage('');
      } else {
        setError('Invalid file type. Please upload a PDF, JPG, or PNG.');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleReset = () => {
    setFile(null);
    setPassword('');
    setMessage('');
    setError('');
    setTransactionsData([]);
    setPagesUsed(0);
    setShowPreview(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConvert = useCallback(async () => {
    if (!file) return;

    setIsLoading(true);
    setError('');
    setMessage('');
    setTransactionsData([]);
    setPagesUsed(0);
    setShowPreview(false);

    const formData = new FormData();
    formData.append('file', file);
    if (password) formData.append('password', password);

    try {
      const extractResp = await apiFetch(
        `${apiUrl}/api/extract`,
        { method: 'POST', body: formData },
        'optional',
      );

      const data: any = await extractResp.json().catch(() => ({}));
      if (!extractResp.ok) {
        throw new Error(
          data?.error || 'Conversion failed. Please try again.',
        );
      }

      let tx: Transaction[] = [];

      if (Array.isArray(data)) {
        tx = data;
      } else if (Array.isArray(data.transactions)) {
        tx = data.transactions;
      } else if (Array.isArray(data.data)) {
        tx = data.data;
      }

      if (!tx || tx.length === 0) {
        throw new Error(
          'No readable transaction data was found in the document.',
        );
      }

      const rawPages =
        data.pages_used ??
        data.pagesUsed ??
        data.page_count ??
        data.pageCount ??
        data.pages ??
        0;

      setTransactionsData(tx);
      setPagesUsed(
        typeof rawPages === 'number' && !Number.isNaN(rawPages)
          ? rawPages
          : 0,
      );
      setMessage(
        'Conversion successful! Review your data below and download in your preferred format.',
      );
      setShowPreview(true);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }, [file, password, apiUrl]);

  const handleDownload = (
    data: Transaction[],
    format: 'xlsx' | 'csv' | 'json',
  ) => {
    if (!data || data.length === 0) {
      setError('There is no data to download yet.');
      return;
    }

    try {
      if (format === 'json') {
        const blob = new Blob(
          [JSON.stringify(data, null, 2)],
          { type: 'application/json' },
        );
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = 'transactions.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
        return;
      }

      const firstRow = data[0] || {};
      const orderedHeaders = BASE_HEADERS.filter(
        (h) => h in firstRow,
      );
      const extraHeaders = Object.keys(firstRow).filter(
        (h) => !orderedHeaders.includes(h),
      );
      const headers = [...orderedHeaders, ...extraHeaders];

      const csvRows: string[] = [];

      // Excel hint so it uses comma as separator
      csvRows.push('sep=,');

      // Header row
      csvRows.push(headers.join(CSV_SEPARATOR));

      for (const row of data) {
        const values = headers.map((key) => {
          const raw = row[key];
          if (raw === null || raw === undefined) return '';
          const str = String(raw);
          if (
            str.includes('"') ||
            str.includes(CSV_SEPARATOR) ||
            str.includes('\n')
          ) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        });
        csvRows.push(values.join(CSV_SEPARATOR));
      }

      const csvContent = csvRows.join('\n');

      const mimeType =
        format === 'csv'
          ? 'text/csv;charset=utf-8;'
          : 'application/vnd.ms-excel';
      const blob = new Blob([csvContent], { type: mimeType });

      const ext = format === 'csv' ? 'csv' : 'xlsx';
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `transactions.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unknown error occurred while preparing the download.',
      );
    }
  };

  const handleCancelPreview = () => {
    setShowPreview(false);
  };

  const hasData = transactionsData.length > 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl p-6 md:p-8 space-y-6 bg-white rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Convert Your Bank Statement
        </h1>
        <p className="text-center text-gray-500">
          AI-powered, fast, and secure. Upload a PDF or image to get a clean
          Excel/CSV/JSON file.
        </p>

        {/* Upload area */}
        <div className="relative">
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud
                  className={`w-10 h-10 mb-4 ${
                    isDragOver ? 'text-blue-500' : 'text-gray-400'
                  }`}
                />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500">
                  PDF, PNG, JPG (MAX. 10MB)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) =>
                  handleFileSelect(e.target.files?.[0] || null)
                }
                accept=".pdf,.png,.jpg,.jpeg"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-56 border-2 border-solid border-green-500 bg-green-50 rounded-lg p-4 relative">
              <FileIcon className="w-10 h-10 mb-3 text-green-600" />
              <p
                className="font-semibold text-gray-700 truncate max-w-full px-2"
                title={file.name}
              >
                {file.name}
              </p>
              <p className="text-sm text-gray-500">
                {(file.size / 1024).toFixed(2)} KB
              </p>
              <button
                onClick={handleReset}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Password + actions */}
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
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleReset}
                className="w-1/3 px-4 py-2 font-bold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Start Over
              </button>
              <button
                onClick={handleConvert}
                disabled={isLoading}
                className="w-2/3 px-4 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isLoading ? 'Converting...' : 'Extract & Preview'}
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        {message && (
          <p className="text-center text-green-600 mt-2">{message}</p>
        )}
        {error && (
          <p className="text-center text-red-600 mt-2">{error}</p>
        )}

        {/* Stats + download options + preview */}
        {showPreview && hasData && (
          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-xs font-medium text-gray-500">
                  Transactions
                </p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {transactionsData.length}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-xs font-medium text-gray-500">
                  Pages Used
                </p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {pagesUsed}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-xs font-medium text-gray-500">
                  File
                </p>
                <p className="mt-2 text-sm font-semibold text-gray-900 truncate">
                  {file?.name}
                </p>
              </div>
            </div>

            {/* Download buttons */}
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Download Your Data
              </h3>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  disabled={!hasData}
                  onClick={() =>
                    handleDownload(transactionsData, 'xlsx')
                  }
                  className="px-5 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 disabled:bg-blue-300"
                >
                  Excel (.xlsx)
                </button>
                <button
                  type="button"
                  disabled={!hasData}
                  onClick={() =>
                    handleDownload(transactionsData, 'csv')
                  }
                  className="px-5 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 disabled:bg-blue-300"
                >
                  CSV (.csv)
                </button>
                <button
                  type="button"
                  disabled={!hasData}
                  onClick={() =>
                    handleDownload(transactionsData, 'json')
                  }
                  className="px-5 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 disabled:bg-blue-300"
                >
                  JSON (.json)
                </button>
              </div>
            </div>

            {/* Review and Edit table */}
            <div className="mt-6">
              <DataPreviewTable
                initialData={transactionsData}
                onConvert={(edited) =>
                  handleDownload(edited, 'xlsx')
                }
                onCancel={handleCancelPreview}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConverterPage;