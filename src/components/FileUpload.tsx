import { useState, useRef, ChangeEvent, DragEvent, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { AuthUser, FileState, ConversionHistoryItem } from '../lib/types';
import { extractTransactionsFromApi } from '../services/apiService';
import { FileUploadIcon, CloudUploadIcon, LockIcon, XIcon, CogsIcon } from './Icon.tsx';
import { PasswordModal } from './PasswordModal.tsx';
import { AnalysisView } from './AnalysisView.tsx';
import CliCommandView from './CliCommandView.tsx';
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
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${className}`}>{text}</span>;
};

interface BatchResultSummary {
    transactions: number;
    pages: number;
    fileCount: number;
    successfulFiles: number;
}

export const FileUpload = ({ user, onConversionComplete }: { user: AuthUser | null, onConversionComplete: (items: ConversionHistoryItem[]) => void }) => {
    const [files, setFiles] = useState<FileState[]>([]);
    const [isProcessingBatch, setIsProcessingBatch] = useState(false);
    const [processingFileIndex, setProcessingFileIndex] = useState(0);
    const [batchResult, setBatchResult] = useState<BatchResultSummary | null>(null);
    const [globalError, setGlobalError] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [limitMessage, setLimitMessage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [cliVisibility, setCliVisibility] = useState<{ [key: string]: boolean }>({});
    const [copiedCommandId, setCopiedCommandId] = useState<string | null>(null);

    useEffect(() => {
        const { limitReached, message } = checkUsageLimit(user);
        if (limitReached) {
            setLimitMessage(message);
        } else {
            setLimitMessage(null);
        }
    }, [user]);

    const toggleCliVisibility = (id: string) => {
        setCliVisibility(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleCopyCommand = (command: string, id: string) => {
        navigator.clipboard.writeText(command).then(() => {
            setCopiedCommandId(id);
            setTimeout(() => setCopiedCommandId(null), 2000);
        }).catch(err => {
            console.error('Failed to copy command: ', err);
        });
    };

    const resetState = () => {
        setFiles([]);
        setIsProcessingBatch(false);
        setProcessingFileIndex(0);
        setBatchResult(null);
        setGlobalError(null);
        setIsPasswordModalOpen(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const updateFileState = (id: string, updates: Partial<FileState>) => {
        setFiles(prevFiles => prevFiles.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (limitMessage) return;
        const selectedFiles = e.target.files;
        if (!selectedFiles) return;

        setGlobalError(null);
        if(!isProcessingBatch) setBatchResult(null);

        // FIX: Explicitly type `file` as `File` to resolve type inference issues where it was
        // being treated as `unknown`, causing errors when accessing properties like `size` and `type`.
        const newFilesPromises = Array.from(selectedFiles).map(async (file: File): Promise<FileState> => {
            const fileInfo: FileState = {
                id: generateId(),
                file, status: 'queued', progress: 0, transactions: [],
                error: null, pages: 0, password: null,
            };

            if (file.size > 10 * 1024 * 1024) {
                fileInfo.status = 'error';
                fileInfo.error = 'File size exceeds 10MB.';
                return fileInfo;
            }

            if (file.type === 'application/pdf') {
                try {
                    const arrayBuffer = await file.arrayBuffer();
                    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
                    if (pdfDoc.isEncrypted) {
                        fileInfo.status = 'locked';
                    }
                } catch (err) {
                    fileInfo.status = 'error';
                    fileInfo.error = 'Invalid or corrupted PDF. Please provide a valid file.';
                }
            }
            return fileInfo;
        });

        const newFiles = await Promise.all(newFilesPromises);
        setFiles(prev => [...prev, ...newFiles]);

        if (newFiles.some(f => f.status === 'locked')) {
            setIsPasswordModalOpen(true);
        }
    };
    
    const handleUnlockSuccess = (fileId: string, password: string) => {
        updateFileState(fileId, { status: 'queued', password: password, error: null });
        const stillLocked = files.filter(f => f.id !== fileId && f.status === 'locked');
        if (stillLocked.length === 0) {
            setIsPasswordModalOpen(false);
        }
    };

    const handleRemoveFile = (idToRemove: string) => {
        setFiles(files.filter(f => f.id !== idToRemove));
    };
    
    // FIX: Replaced `React.DragEvent` with `DragEvent` after adding it to the component import.
    const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation(); setIsDragOver(false);
        if (limitMessage) return;
        if (e.dataTransfer.files?.[0]) {
            const syntheticEvent = { target: { files: e.dataTransfer.files } } as unknown as ChangeEvent<HTMLInputElement>;
            await handleFileChange(syntheticEvent);
        }
    };
    
    // FIX: Replaced `React.DragEvent` with `DragEvent` after adding it to the component import.
    const handleDragEvents = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation();
        if (limitMessage) return;
        if (e.type === 'dragenter' || e.type === 'dragover') setIsDragOver(true);
        else if (e.type === 'dragleave') setIsDragOver(false);
    };

    const processFile = async (id: string) => {
        const fileToProcess = files.find(f => f.id === id);
        if (!fileToProcess) return;

        updateFileState(id, { status: 'processing', progress: 0, error: null });
        
        try {
            updateFileState(id, { progress: 30 });
            const parsedData = await extractTransactionsFromApi(fileToProcess.file, fileToProcess.password);
            
            updateFileState(id, { progress: 90 });
            if (!Array.isArray(parsedData)) throw new Error("AI returned invalid data structure.");

            const pagesProcessed = Math.ceil(parsedData.length / 25) || 1;
            updateFileState(id, { status: 'success', progress: 100, transactions: parsedData, pages: pagesProcessed });
            return { pages: pagesProcessed, transactions: parsedData.length };
        } catch (e: any) {
            const errorMessage = e.message || 'An unknown error occurred.';
            let status: FileState['status'] = 'error';

            if (errorMessage.includes('Unsupported encryption')) status = 'error';
            else if (errorMessage.includes('Incorrect password')) status = 'locked';
            else if (errorMessage.includes('PDF is encrypted')) status = 'locked';

            updateFileState(id, { status, error: errorMessage, progress: 100, password: status === 'locked' ? null : fileToProcess.password });
            return { pages: 0, transactions: 0 };
        }
    };
    
    const handleConvertAll = async () => {
        const { limitReached, message } = checkUsageLimit(user);
        if (limitReached) {
            setLimitMessage(message);
            return;
        }

        if (files.some(f => f.status === 'locked')) {
            setIsPasswordModalOpen(true);
            return;
        }
        
        setIsProcessingBatch(true);
        setGlobalError(null);
        setBatchResult(null);

        const filesToProcess = files.filter(f => f.status === 'queued');

        for (let i = 0; i < filesToProcess.length; i++) {
            setProcessingFileIndex(i + 1);
            await processFile(filesToProcess[i].id);
        }

        // After all processing is done, aggregate results
        const finalFilesState = files; // Use the latest state
        let totalPages = 0;
        let totalTransactions = 0;
        let successfulFiles = 0;

        const historyItems: ConversionHistoryItem[] = [];

        finalFilesState.forEach(f => {
            if (f.status === 'success') {
                totalPages += f.pages;
                totalTransactions += f.transactions.length;
                successfulFiles++;
                historyItems.push({
                    id: `conv_${f.id}`,
                    fileName: f.file.name,
                    date: new Date().toISOString(),
                    pagesUsed: f.pages,
                    transactionCount: f.transactions.length,
                    transactions: f.transactions,
                });
            }
        });

        if (user && historyItems.length > 0) {
            onConversionComplete(historyItems);
        }

        const summary: BatchResultSummary = {
            transactions: totalTransactions,
            pages: totalPages,
            fileCount: files.length,
            successfulFiles,
        };

        setBatchResult(summary);
        setIsProcessingBatch(false);
        setProcessingFileIndex(0);
    };

    const handleDownloadCombined = async (format: 'xlsx' | 'csv' | 'json') => {
        const allTransactions = files.flatMap(f => f.status === 'success' ? f.transactions : []);
        downloadTransactions(allTransactions, format, 'Bankconverts_Combined_Export');
    };
    
    const hasQueue = files.length > 0;
    const lockedFiles = files.filter(f => f.status === 'locked');
    const hasLockedFiles = lockedFiles.length > 0;
    const queuedFilesCount = files.filter(f => f.status === 'queued').length;
    const canConvert = hasQueue && !hasLockedFiles && queuedFilesCount > 0 && !isProcessingBatch;

    return (
        <section id="convert" className="w-full">
            <PasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                filesToUnlock={lockedFiles}
                onUnlockSuccess={handleUnlockSuccess}
            />
            <div 
                className={`bg-white rounded-lg shadow-2xl p-8 w-full transition-all duration-300 ${isDragOver ? 'border-2 border-dashed border-brand-blue bg-brand-blue-light' : 'border-2 border-transparent'}`}
                onDragEnter={handleDragEvents} onDragOver={handleDragEvents} onDragLeave={handleDragEvents} onDrop={handleDrop}
            >
                {limitMessage ? (
                    <LimitReachedView message={limitMessage} user={user} />
                ) : (
                    <>
                        {batchResult && (
                            <AnalysisView batchResult={batchResult} onDownload={handleDownloadCombined} />
                        )}

                        {!hasQueue && !batchResult && (
                            <div className="text-center flex flex-col items-center justify-center space-y-4 h-64 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="bg-brand-blue-light rounded-full p-4">
                                    <FileUploadIcon/>
                                </div>
                                <h2 className="text-2xl font-bold text-brand-dark">Upload Bank Statements</h2>
                                <p className="text-brand-gray">Drag & drop or click to select files for bulk conversion.</p>
                                <button className="bg-brand-blue text-white px-4 py-2 rounded-md font-semibold hover:bg-brand-blue-hover transition-colors duration-200 flex items-center">
                                    <CloudUploadIcon/> Choose Files
                                </button>
                            </div>
                        )}
                        
                        {hasQueue && (
                            <div className="w-full">
                                <div className="space-y-3 max-h-96 overflow-y-auto p-2 border-t border-b my-4">
                                    {files.map(f => (
                                        <div key={f.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md border">
                                            <div className="flex-grow truncate mr-4">
                                                <div className="font-medium text-brand-dark flex items-center truncate">
                                                    {f.status === 'locked' ? <LockIcon className="text-yellow-500 mr-2 flex-shrink-0"/> : <span className="mr-2 flex-shrink-0">📄</span>} 
                                                    <span className="truncate" title={f.file.name}>{f.file.name}</span>
                                                </div>
                                                {f.status === 'processing' && <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2"><div className="bg-brand-blue h-1.5 rounded-full" style={{ width: `100%` }}></div></div>}
                                                {f.error && (
                                                    <div className="text-red-600 text-xs mt-1 text-left">
                                                        <div dangerouslySetInnerHTML={{ __html: f.error }} />
                                                        {f.error.includes('Unsupported encryption') &&
                                                            <div>
                                                                <button className="text-blue-600 hover:underline text-xs" onClick={() => toggleCliVisibility(f.id)}>
                                                                    {cliVisibility[f.id] ? 'Hide' : 'Show'} CLI Alternative
                                                                </button>
                                                                <CliCommandView 
                                                                    file={f}
                                                                    isVisible={cliVisibility[f.id]}
                                                                    onCopy={handleCopyCommand}
                                                                    copiedCommandId={copiedCommandId}
                                                                />
                                                            </div>
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <StatusBadge status={f.status} />
                                                <button onClick={() => handleRemoveFile(f.id)} className="text-gray-400 hover:text-red-500" title="Remove file" disabled={isProcessingBatch}><XIcon /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {hasLockedFiles && !isProcessingBatch && (
                                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded-md text-sm mt-4">
                                        You have {lockedFiles.length} locked file(s). <button className="font-semibold underline" onClick={() => setIsPasswordModalOpen(true)}>Unlock them</button> to continue.
                                    </div>
                                )}

                                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                                     {batchResult ? (
                                        <button className="w-full bg-brand-primary text-white px-4 py-3 rounded-md font-semibold hover:bg-brand-primary-hover transition-colors duration-200" onClick={resetState}>
                                            Start New Batch
                                        </button>
                                     ) : (
                                        <>
                                            <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-semibold hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50" onClick={() => fileInputRef.current?.click()} disabled={isProcessingBatch}>
                                                Add More Files
                                            </button>
                                            <button className="bg-brand-blue text-white px-6 py-3 rounded-md font-semibold hover:bg-brand-blue-hover transition-colors duration-200 disabled:bg-brand-blue/60 disabled:cursor-not-allowed flex items-center justify-center min-w-[200px]" onClick={handleConvertAll} disabled={!canConvert && !hasLockedFiles}>
                                                {isProcessingBatch ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                        {`Processing ${processingFileIndex} of ${queuedFilesCount}...`}
                                                    </>
                                                ) : (
                                                    hasLockedFiles ? <><LockIcon /> Unlock Files ({lockedFiles.length})</> : <><CogsIcon /> Convert All ({queuedFilesCount})</>
                                                )}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png,.csv,.txt" hidden multiple disabled={isProcessingBatch || !!limitMessage} />
                    </>
                )}
                {globalError && !limitMessage && <div className="bg-red-100 text-red-700 p-3 rounded-md mt-4 text-sm">{globalError}</div>}
            </div>
        </section>
    );
};