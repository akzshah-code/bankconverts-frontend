import ExcelJS from 'exceljs';
import { ExtractedTransaction } from './types';

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

export const downloadTransactions = async (
  transactions: ExtractedTransaction[],
  format: 'xlsx' | 'csv' | 'json',
  fileNamePrefix: string
) => {
    if (transactions.length === 0) {
        alert("No transactions to download.");
        return;
    }

    const safeFileName = `${fileNamePrefix.replace(/[^a-z0-9_.-]/gi, '_')}`;

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

    if (format === 'json') {
      const jsonStr = JSON.stringify(transactions, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      downloadFile(blob, `${safeFileName}.json`);
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
