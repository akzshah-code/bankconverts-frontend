// src/components/FileUploader.tsx

import React, { useState } from 'react';
import DataPreviewTable from './DataPreviewTable';
import { UpgradeButton } from './UpgradeButton';

interface Transaction {
  [key: string]: any;
}

interface FileStatus {
  name: string;
  status: 'pending' | 'success' | 'failed';
}

const MAX_BATCH_BYTES = 20 * 1024 * 1024; // 20 MB

function FileUploader(): React.JSX.Element {
  const [files, setFiles] = useState<File[]>([]);
  const [fileStatuses, setFileStatuses] = useState<FileStatus[]>([]);
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [combinedData, setCombinedData] = useState<Transaction[]>([]);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [batchComplete, setBatchComplete] = useState<boolean>(false);

  const [filesProcessed, setFilesProcessed] = useState<number>(0);
  const [successfulFiles, setSuccessfulFiles] = useState<number>(0);
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  const [pagesUsed] = useState<number>(0); // backend can wire this later

  const apiUrl =
    import.meta.env.VITE_API_URL || 'https://api.bankconverts.com';

  const resetBatchState = () => {
    setCombinedData([]);
    setShowPreview(false);
    setBatchComplete(false);
    setFilesProcessed(0);
    setSuccessfulFiles(0);
    setTotalTransactions(0);
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const list = event.target.files;
    if (!list || list.length === 0) {
      setFiles([]);
      setFileStatuses([]);
      resetBatchState();
      return;
    }

    const selected = Array.from(list);

    const totalBytes = selected.reduce(
      (sum, file) => sum + file.size,
      0,
    );
    if (totalBytes > MAX_BATCH_BYTES) {
      setError('Total batch size must be 20 MB or less.');
      setFiles([]);
      setFileStatuses([]);
      resetBatchState();
      return;
    }

    setError('');
    setFiles(selected);
    setFileStatuses(
      selected.map((file) => ({
        name: file.name,
        status: 'pending',
      })),
    );
    resetBatchState();
  };

  const handlePasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setPassword(event.target.value);
  };

  /**
   * Sequentially upload each selected file to /api/extract,
   * merge all returned transactions into a single combined array,
   * and update batch statistics.
   */
  const handleStartBatch = async () => {
    if (files.length === 0) {
      setError('Please select at least one file first.');
      return;
    }

    setIsProcessing(true);
    setError('');
    setCombinedData([]);
    setShowPreview(false);
    setBatchComplete(false);

    const allData: Transaction[] = [];
    const updatedStatuses = [...fileStatuses];
    let successful = 0;
    let transactionsCount = 0;
    let firstError: string | null = null;

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      if (password) {
        formData.append('password', password);
      }

      try {
        const extractResponse = await fetch(`${apiUrl}/api/extract`, {
          method: 'POST',
          body: formData,
        });

        // Safely handle non‑JSON responses (e.g. HTML error pages or redirects)
        const contentType =
          extractResponse.headers.get('content-type') || '';

        if (!contentType.includes('application/json')) {
          const text = await extractResponse.text();

          // Common case: backend returns an HTML error page ("<!doctype html>")
          if (text && text.trim().toLowerCase().startsWith('<!doctype')) {
            throw new Error(
              'The server returned an HTML error page instead of JSON. Please confirm the API URL and that you are allowed to access /api/extract.',
            );
          }

          throw new Error(
            text ||
              'Unexpected non‑JSON response from the server while extracting data.',
          );
        }

        const data = await extractResponse.json();

        if (!extractResponse.ok) {
          throw new Error(
            (data && (data.error || data.detail)) ||
              'Failed to extract data.',
          );
        }

        if (Array.isArray(data)) {
          allData.push(...data);
          transactionsCount += data.length;
        }

        successful += 1;
        updatedStatuses[i] = {
          ...updatedStatuses[i],
          status: 'success',
        };
      } catch (err) {
        updatedStatuses[i] = {
          ...updatedStatuses[i],
          status: 'failed',
        };
        if (!firstError) {
          firstError =
            err instanceof Error
              ? err.message
              : 'An unknown error occurred.';
        }
      }
    }

    setFileStatuses(updatedStatuses);
    setCombinedData(allData);
    setFilesProcessed(files.length);
    setSuccessfulFiles(successful);
    setTotalTransactions(transactionsCount);

    if (firstError) {
      setError(firstError);
    }

    setBatchComplete(true);
    setIsProcessing(false);

    // For advanced users we still allow tabular preview/editing
    if (allData.length > 0) {
      setShowPreview(true);
    }
  };

  const handleConfirmConvert = async (
    editedData: Transaction[],
    format: 'xlsx' | 'csv' | 'json' = 'xlsx',
  ) => {
    // Local JSON download (no backend) if requested
    if (format === 'json') {
      const blob = new Blob(
        [JSON.stringify(editedData, null, 2)],
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

    setIsProcessing(true);
    setError('');

    try {
      const convertResponse = await fetch(`${apiUrl}/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format,
          data: editedData,
        }),
      });

      if (!convertResponse.ok) {
        const text = await convertResponse.text();
        throw new Error(text || 'Failed to convert data.');
      }

      const blob = await convertResponse.blob();
      const ext = format === 'csv' ? 'csv' : 'xlsx';
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `transactions.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setShowPreview(false);
      setCombinedData([]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unknown error occurred.',
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelPreview = () => {
    setShowPreview(false);
    setError('');
  };

  const handleStartNewBatch = () => {
    setFiles([]);
    setFileStatuses([]);
    setPassword('');
    setError('');
    setIsProcessing(false);
    setCombinedData([]);
    setShowPreview(false);
    setBatchComplete(false);
    setFilesProcessed(0);
    setSuccessfulFiles(0);
    setTotalTransactions(0);
  };

  const hasData = combinedData.length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-xl p-6">
        {/* Heading / instructions */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Upload Bank Statements (Batch)
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Select one or more PDF or image files. Total batch
            size up to 20 MB. We&apos;ll combine all valid
            transactions into a single download.
          </p>
        </div>

        {/* File selection and password */}
        <div className="space-y-4">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            accept=".pdf,.png,.jpg,.jpeg"
            className="block w-full border border-gray-300 rounded-md p-3"
          />
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="PDF password (if any, applied to all files)"
            className="block w-full border border-gray-300 rounded-md p-3"
          />
          <div className="text-xs text-gray-400">
            Supported formats: PDF, JPG, PNG. Total size max
            20&nbsp;MB.
          </div>

          <button
            type="button"
            onClick={handleStartBatch}
            disabled={isProcessing || files.length === 0}
            className="w-full py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300 font-semibold text-lg"
          >
            {isProcessing
              ? 'Processing batch...'
              : 'Start Batch'}
          </button>
        </div>

        {/* Error / upgrade message */}
        {error && (
          <div className="mt-4 text-center">
            <p className="text-sm text-red-500">{error}</p>
            {(error.toLowerCase().includes('expired') ||
              error.toLowerCase().includes('upgrade')) && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <h4 className="font-semibold mb-2">
                  Choose a Plan to Continue
                </h4>
                <div className="space-y-2">
                  <UpgradeButton
                    planId="plan_RPmoQl9lVpHzjt"
                    buttonText="Starter Monthly - ₹975/mo"
                  />
                  <UpgradeButton
                    planId="plan_RPmvqA3nPDcVgN"
                    buttonText="Starter Yearly - ₹9,750/yr (Save 16%)"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Batch summary & downloads */}
        {batchComplete && (
          <div className="mt-8 space-y-6">
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-xs font-medium text-gray-500">
                  Files Processed
                </p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {filesProcessed}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-xs font-medium text-gray-500">
                  Successful
                </p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {successfulFiles}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-xs font-medium text-gray-500">
                  Transactions
                </p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {totalTransactions}
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
            </div>

            {/* Download buttons */}
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Download Combined Data
              </h3>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  disabled={!hasData || isProcessing}
                  onClick={() =>
                    handleConfirmConvert(
                      combinedData,
                      'xlsx',
                    )
                  }
                  className="px-5 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 disabled:bg-blue-300"
                >
                  Excel (.xlsx)
                </button>
                <button
                  type="button"
                  disabled={!hasData || isProcessing}
                  onClick={() =>
                    handleConfirmConvert(
                      combinedData,
                      'csv',
                    )
                  }
                  className="px-5 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 disabled:bg-blue-300"
                >
                  CSV (.csv)
                </button>
                <button
                  type="button"
                  disabled={!hasData || isProcessing}
                  onClick={() =>
                    handleConfirmConvert(
                      combinedData,
                      'json',
                    )
                  }
                  className="px-5 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 disabled:bg-blue-300"
                >
                  JSON (.json)
                </button>
              </div>
            </div>

            {/* File list */}
            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
              {fileStatuses.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No files in this batch.
                </p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {fileStatuses.map((f) => (
                    <li
                      key={f.name}
                      className="flex items-center justify-between"
                    >
                      <span className="truncate">
                        {f.name}
                      </span>
                      <span
                        className={`ml-2 text-xs font-medium ${
                          f.status === 'success'
                            ? 'text-green-600'
                            : f.status === 'failed'
                            ? 'text-red-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {f.status === 'success'
                          ? 'Success'
                          : f.status === 'failed'
                          ? 'Failed'
                          : 'Pending'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* New batch button */}
            <button
              type="button"
              onClick={handleStartNewBatch}
              className="w-full py-3 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700"
            >
              Start New Batch
            </button>
          </div>
        )}

        {/* Optional table preview / editing for advanced users */}
        {showPreview && combinedData.length > 0 && (
          <div className="mt-8">
            <DataPreviewTable
              initialData={combinedData}
              onConvert={(edited) =>
                handleConfirmConvert(edited, 'xlsx')
              }
              onCancel={handleCancelPreview}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default FileUploader;