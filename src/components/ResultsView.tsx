
import { useEffect } from 'react';
import { ExtractedTransaction, ConversionResult } from '../lib/types';
import ExcelJS from 'exceljs';

interface ResultsViewProps {
  transactions: ExtractedTransaction[];
  onReset: () => void;
  onConversionComplete: (result: ConversionResult) => void;
}

const ResultsView = ({ transactions, onReset, onConversionComplete }: ResultsViewProps) => {
  const pagesUsed = Math.ceil(transactions.length / 25) || 1;

  // When the component mounts with results, report the page usage.
  useEffect(() => {
    const result: ConversionResult = {
      transactions: transactions.length,
      pages: pagesUsed,
      fileCount: 1,
      successfulFiles: 1,
      processingTime: 0, // Not tracked for single conversions, but required by type.
    };
    onConversionComplete(result);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const debits = transactions.filter(t => t.debit != null && t.debit > 0);
  const credits = transactions.filter(t => t.credit != null && t.credit > 0);

  const totalDebits = debits.reduce((sum, t) => sum + (t.debit || 0), 0);
  const totalCredits = credits.reduce((sum, t) => sum + (t.credit || 0), 0);
  const netBalance = totalCredits - totalDebits;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
  };
  
  const handleDownload = async (format: 'xlsx' | 'csv' | 'json') => {
    // Re-order and rename columns for export
    const dataForExport = transactions.map(t => ({
      'Transaction Date': t.date,
      'Description': t.description,
      'Reference': t.reference,
      'Value Date': t.valueDate,
      'Debit': t.debit,
      'Credit': t.credit,
      'Balance': t.balance,
      'Category': t.category,
    }));
    
    const safeFileName = `Bankconverts ${new Date().toISOString().slice(0, 10)}`;

    if (format === 'json') {
      const jsonStr = JSON.stringify(transactions, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${safeFileName}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Transactions");

    worksheet.columns = [
      { header: 'Transaction Date', key: 'Transaction Date', width: 15 },
      { header: 'Description', key: 'Description', width: 50 },
      { header: 'Reference', key: 'Reference', width: 20 },
      { header: 'Value Date', key: 'Value Date', width: 15 },
      { header: 'Debit', key: 'Debit', width: 15, style: { numFmt: '#,##0.00' } },
      { header: 'Credit', key: 'Credit', width: 15, style: { numFmt: '#,##0.00' } },
      { header: 'Balance', key: 'Balance', width: 15, style: { numFmt: '#,##0.00' } },
      { header: 'Category', key: 'Category', width: 20 },
    ];

    worksheet.addRows(dataForExport);
    
    const downloadFile = (blob: Blob, fileName: string) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (format === 'xlsx') {
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        downloadFile(blob, `${safeFileName}.xlsx`);
    } else if (format === 'csv') {
        const buffer = await workbook.csv.writeBuffer();
        const blob = new Blob([buffer], { type: 'text/csv;charset=utf-8;' });
        downloadFile(blob, `${safeFileName}.csv`);
    }
  };
  
  return (
    <div className="text-center animate-fade-in">
      <h2 className="text-3xl font-bold text-brand-dark mb-6">Conversion Complete!</h2>
      
      {/* Top Level Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white p-4 rounded-lg shadow-md border">
            <p className="text-sm text-brand-gray">Files Processed</p>
            <p className="text-2xl font-bold text-brand-dark">1</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border">
            <p className="text-sm text-brand-gray">Successful</p>
            <p className="text-2xl font-bold text-brand-dark">1</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border">
            <p className="text-sm text-brand-gray">Transactions</p>
            <p className="text-2xl font-bold text-brand-dark">{transactions.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border">
            <p className="text-sm text-brand-gray">Pages Used</p>
            <p className="text-2xl font-bold text-brand-dark">{pagesUsed}</p>
        </div>
      </div>
      
      {/* Detailed Financial Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 rounded-lg border text-center">
        <div>
            <p className="text-sm text-brand-gray">Transactions</p>
            <p className="text-xl font-semibold text-brand-dark">{transactions.length}</p>
        </div>
        <div className="relative">
            <p className="text-sm text-brand-gray">Debits</p>
            <p className="text-xl font-semibold text-red-600">{formatCurrency(totalDebits)}</p>
            <span className="absolute top-0 right-0 -mt-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{debits.length}</span>
        </div>
        <div className="relative">
            <p className="text-sm text-brand-gray">Credits</p>
            <p className="text-xl font-semibold text-green-600">{formatCurrency(totalCredits)}</p>
            <span className="absolute top-0 right-0 -mt-1 bg-green-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{credits.length}</span>
        </div>
        <div>
            <p className="text-sm text-brand-gray">Net Balance</p>
            <p className={`text-xl font-semibold flex items-center justify-center ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netBalance)}
                {netBalance >= 0 ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75L12 3m0 0l3.75 3.75M12 3v18" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25L12 21m0 0l-3.75-3.75M12 21V3" />
                    </svg>
                )}
            </p>
        </div>
      </div>


      {/* Table Section */}
      <div className="border rounded-lg overflow-hidden mb-6">
        <div className="overflow-y-auto max-h-96">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-4 py-2 font-medium">Date</th>
                <th scope="col" className="px-4 py-2 font-medium">Description</th>
                <th scope="col" className="px-4 py-2 font-medium text-right">Amount</th>
                <th scope="col" className="px-4 py-2 font-medium">Currency</th>
                <th scope="col" className="px-4 py-2 font-medium">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map((transaction, index) => {
                  const isCredit = transaction.credit != null && transaction.credit > 0;
                  const amount = isCredit ? transaction.credit : (transaction.debit != null ? -transaction.debit : 0);
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">{transaction.date}</td>
                      <td className="px-4 py-3">{transaction.description}</td>
                      <td className={`px-4 py-3 font-medium text-right whitespace-nowrap ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                        {amount ? formatCurrency(amount) : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-brand-gray">INR</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          isCredit 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {isCredit ? 'Credit' : 'Debit'}
                        </span>
                      </td>
                    </tr>
                  );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Download Section */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-brand-dark mb-4">Download Your Data</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <button onClick={() => handleDownload('xlsx')} className="flex items-center justify-center w-full bg-brand-blue text-white px-4 py-3 rounded-md font-semibold hover:bg-brand-blue-hover transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm3 2v2h10V5H5zm0 4v2h4v-2H5zm0 4v2h4v-2H5zm6 0v2h4v-2h-4z" />
                </svg>
                Excel (.xlsx)
            </button>
            <button onClick={() => handleDownload('csv')} className="flex items-center justify-center w-full bg-brand-blue text-white px-4 py-3 rounded-md font-semibold hover:bg-brand-blue-hover transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7zm-1 4a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                CSV (.csv)
            </button>
            <button onClick={() => handleDownload('json')} className="flex items-center justify-center w-full bg-brand-blue text-white px-4 py-3 rounded-md font-semibold hover:bg-brand-blue-hover transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                JSON (.json)
            </button>
        </div>
        <button 
          onClick={onReset}
          className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-semibold hover:bg-gray-300 transition-colors duration-200"
        >
          Convert Another File
        </button>
      </div>
    </div>
  );
};

export default ResultsView;
