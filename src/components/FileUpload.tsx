import { useState, useRef, ChangeEvent, DragEvent, useEffect } from 'react';
import { AuthUser, FileState, ConversionHistoryItem, BatchResultSummary } from '../lib/types';
import { extractTransactionsFromPdf } from '../services/clientPdfProcessor';
import { FileUploadIcon, LockIcon, XIcon } from './Icon.tsx';
import { PasswordModal } from './PasswordModal.tsx';
import { checkUsageLimit } from '../lib/usage';
import LimitReachedView from './LimitReachedView.tsx';
import { downloadTransactions } from '../lib/download';

const generateId = () => `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const StatusBadge = ({ status }: { status: FileState['status'] }) => {
    const statusMap = {
        queued: { text: 'Queued', className: 'bg-gray-200 text-gray-800' },
        locked: { text: 'Password Required', className: 'bg-yellow-200 text-yellow-800' },
        processing: { text: 'Processing', className: 'bg-blue-200 text-blue-800' },
        success: { text: 'Success', className: 'bg-green-200 text-green-800' },
        error: { text: 'Error', className: 'bg-red-200 text-red-800' },
    };
    const { text, className } = statusMap[status] || { text: 'Unknown', className: '' };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${className}`}>{text}</span>;
};

export const FileUpload = ({ user, onConversionComplete }: { user: AuthUser | null, onConversionComplete: (items: ConversionHistoryItem[]) => void }) => {
    const [files, setFiles] = useState<FileState[]>([]);
    const [isProcessingBatch, setIsProcessingBatch] = useState(false);
    const [batchResult, setBatchResult] = useState<BatchResultSummary | null>(null);
    const [globalError, setGlobalError] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [limitMessage, setLimitMessage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const { limitReached, message } = checkUsageLimit(user);
        if (limitReached) setLimitMessage(message); else setLimitMessage(null);
    }, [user]);

    const resetState = () => {
        setFiles([]);
        setIsProcessingBatch(false);
        setBatchResult(null);
        setGlobalError(null);
        setIsPasswordModalOpen(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const updateFileState = (id: string, updates: Partial<FileState>) => {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (limitMessage) return;
        const selectedFiles = e.target.files;
        if (!selectedFiles) return;

        setGlobalError(null);
        if(!isProcessingBatch) setBatchResult(null);

        const newFilesPromises = Array.from(selectedFiles).map(async (file: File): Promise<FileState> => {
            const fileInfo: FileState = {
                id: generateId(), file, status: 'queued', progress: 0, transactions: [],
                error: null, pages: 0, password: null,
            };
            return fileInfo;
        });

        const newFiles = await Promise.all(newFilesPromises);
        setFiles(prev => [...prev, ...newFiles]);
        if (newFiles.some(f => f.status === 'locked')) setIsPasswordModalOpen(true);
    };

    const handleUnlockSuccess = (fileId: string, password: string) => {
        updateFileState(fileId, { status: 'queued', password: password, error: null });
        const stillLocked = files.filter(f => f.id !== fileId && f.status === 'locked');
        if (stillLocked.length === 0) setIsPasswordModalOpen(false);
    };

    const handleRemoveFile = (idToRemove: string) => {
        setFiles(files.filter(f => f.id !== idToRemove));
    };

    const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation(); setIsDragOver(false);
        if (limitMessage) return;
        if (e.dataTransfer.files?.[0]) {
            await handleFileChange({ target: { files: e.dataTransfer.files } } as any);
        }
    };
    
    const handleDragEvents = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation();
        if (limitMessage) return;
        if (e.type === 'dragenter' || e.type === 'dragover') setIsDragOver(true);
        else if (e.type === 'dragleave') setIsDragOver(false);
    };

    const processFile = async (id: string) => {
        const fileToProcess = files.find(f => f.id === id);
        if (!fileToProcess) return { pages: 0, transactions: 0 };

        updateFileState(id, { status: 'processing', progress: 0, error: null });

        try {
            updateFileState(id, { progress: 30 });
            const parsedData = await extractTransactionsFromPdf(fileToProcess.file, fileToProcess.password || undefined);
            updateFileState(id, { progress: 90 });
            
            const pagesProcessed = 1;
            updateFileState(id, { status: 'success', progress: 100, transactions: parsedData, pages: pagesProcessed });
            return { pages: pagesProcessed, transactions: parsedData.length };
        } catch (e: any) {
            const errorMessage = e.message || 'An unknown error occurred.';
            let status: FileState['status'] = 'error';
            if (errorMessage.includes('Incorrect password')) status = 'locked';
            
            updateFileState(id, { status, error: errorMessage, progress: 100, password: status === 'locked' ? null : fileToProcess.password });
            return { pages: 0, transactions: 0 };
        }
    };
    
    const handleConvertAll = async () => {
        const { limitReached, message } = checkUsageLimit(user);
        if (limitReached) { setLimitMessage(message); return; }
        if (files.some(f => f.status === 'locked')) { setIsPasswordModalOpen(true); return; }

        setIsProcessingBatch(true);
        setGlobalError(null);
        setBatchResult(null);
        const filesToProcess = files.filter(f => f.status === 'queued');

        const results = await Promise.all(filesToProcess.map(f => processFile(f.id)));

        let totalPages = 0;
        let totalTransactions = 0;
        let successfulFiles = 0;
        const historyItems: ConversionHistoryItem[] = [];

        files.forEach((f) => { // Removed unused 'index'
            const correspondingResult = results.shift();
            if (f.status === 'success' && correspondingResult) {
                totalPages += correspondingResult.pages;
                totalTransactions += correspondingResult.transactions;
                successfulFiles++;
                historyItems.push({
                    id: `conv_${f.id}`, fileName: f.file.name, date: new Date().toISOString(),
                    pagesUsed: correspondingResult.pages, transactionCount: correspondingResult.transactions, transactions: f.transactions,
                });
            }
        });
        
        if (user && historyItems.length > 0) onConversionComplete(historyItems);

        setBatchResult({ transactions: totalTransactions, pages: totalPages, fileCount: files.length, successfulFiles });
        setIsProcessingBatch(false);
    };

    const handleDownloadCombined = async (format: 'xlsx' | 'csv' | 'json' | 'qbo') => {
        const allTransactions = files.flatMap(f => f.status === 'success' ? f.transactions : []);
        await downloadTransactions(allTransactions, format, 'Bankconverts_Combined_Export');
    };
    
    const hasQueue = files.length > 0;
    const lockedFiles = files.filter(f => f.status === 'locked');
    const hasLockedFiles = lockedFiles.length > 0;
    const queuedFilesCount = files.filter(f => f.status === 'queued').length;
    const canConvert = hasQueue && !hasLockedFiles && queuedFilesCount > 0 && !isProcessingBatch;

    return (
        <div className="w-full max-w-4xl mx-auto">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" accept=".pdf" />

            {isPasswordModalOpen && <PasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} filesToUnlock={lockedFiles} onUnlockSuccess={handleUnlockSuccess} />}

            {limitMessage ? <LimitReachedView message={limitMessage} user={user} /> : (
                <>
                    {batchResult ? (
                        <div className="text-center p-8 border rounded-lg">
                            <h3 className="text-2xl font-bold">Conversion Complete!</h3>
                            <p>{batchResult.successfulFiles} of {batchResult.fileCount} files processed.</p>
                            <p>Extracted {batchResult.transactions} transactions.</p>
                            <div className="flex justify-center gap-4 mt-4">
                                <button onClick={() => handleDownloadCombined('xlsx')} className="bg-green-600 text-white px-4 py-2 rounded">Download XLSX</button>
                                <button onClick={() => handleDownloadCombined('csv')} className="bg-blue-600 text-white px-4 py-2 rounded">Download CSV</button>
                                <button onClick={() => handleDownloadCombined('json')} className="bg-purple-600 text-white px-4 py-2 rounded">Download JSON</button>
                                <button onClick={() => handleDownloadCombined('qbo')} className="bg-orange-600 text-white px-4 py-2 rounded">Download QBO</button>
                            </div>
                            <button onClick={resetState} className="mt-4 text-gray-600">Start New Batch</button>
                        </div>
                    ) : (
                        <>
                            {!hasQueue ? (
                                <div onClick={() => fileInputRef.current?.click()} onDragEnter={handleDragEvents} onDragOver={handleDragEvents} onDragLeave={handleDragEvents} onDrop={handleDrop} className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                                    <FileUploadIcon />
                                    <h3 className="mt-4 text-xl">Upload Bank Statements</h3>
                                    <p className="text-gray-500">Drag & drop or click to select files</p>
                                </div>
                            ) : (
                                <div className="p-4 border rounded-lg">
                                    <div className="space-y-3">
                                        {files.map(f => (
                                            <div key={f.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    {f.status === 'locked' ? <LockIcon /> : <span>📄</span>}
                                                    <span>{f.file.name}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <StatusBadge status={f.status} />
                                                    {f.error && <span className="text-sm text-red-500">{f.error}</span>}
                                                    <button onClick={() => handleRemoveFile(f.id)} disabled={isProcessingBatch}><XIcon /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 flex justify-between items-center">
                                        <button onClick={() => fileInputRef.current?.click()} disabled={isProcessingBatch}>Add More Files</button>
                                        <button onClick={handleConvertAll} disabled={!canConvert} className="bg-blue-600 text-white px-6 py-2 rounded disabled:bg-gray-400">
                                            {isProcessingBatch ? `Processing...` : (hasLockedFiles ? `Unlock Files (${lockedFiles.length})` : `Convert All (${queuedFilesCount})`)}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
            {globalError && !limitMessage && <p className="mt-4 text-red-500">{globalError}</p>}
        </div>
    );
};
