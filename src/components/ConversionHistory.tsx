import { useState } from 'react';
import { ConversionHistoryItem } from '../lib/types';
import { downloadTransactions } from '../lib/download';

const ConversionHistory = ({ history }: { history: ConversionHistoryItem[] }) => {
    const [downloading, setDownloading] = useState<string | null>(null);

    if (!history || history.length === 0) {
        return (
            <div className="text-center py-10 px-4 bg-gray-50 rounded-lg border">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <h3 className="mt-2 text-lg font-medium text-brand-dark">No Conversion History</h3>
                <p className="mt-1 text-sm text-brand-gray">Your past file conversions will appear here.</p>
            </div>
        );
    }
    
    const handleDownload = async (item: ConversionHistoryItem) => {
        setDownloading(item.id);
        // Default to xlsx for simplicity in this UI
        await downloadTransactions(item.transactions, 'xlsx', item.fileName);
        setDownloading(null);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-brand-dark mb-4">Conversion History</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm whitespace-nowrap">
                    <thead className="border-b font-medium bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">File Name</th>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Pages</th>
                            <th scope="col" className="px-6 py-3">Transactions</th>
                            <th scope="col" className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.slice().reverse().map(item => ( // Show newest first
                            <tr key={item.id} className="border-b hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-brand-dark truncate max-w-xs" title={item.fileName}>{item.fileName}</td>
                                <td className="px-6 py-4 text-brand-gray">{new Date(item.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-brand-gray">{item.pagesUsed}</td>
                                <td className="px-6 py-4 text-brand-gray">{item.transactionCount}</td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => handleDownload(item)} 
                                        disabled={downloading === item.id}
                                        className="font-medium text-brand-blue hover:text-brand-blue/80 disabled:opacity-50 disabled:cursor-wait"
                                    >
                                        {downloading === item.id ? 'Downloading...' : 'Download'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ConversionHistory;
