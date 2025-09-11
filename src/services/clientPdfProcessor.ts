import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import { ExtractedTransaction } from '../lib/types';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const transactionRegex = /(\d{2}\/\d{2}\/\d{4})\s+(.*?)\s+([\d,]+\.\d{2})(-)?/g;

export async function extractTransactionsFromPdf(
  file: File,
  password?: string
): Promise<ExtractedTransaction[]> {
  const arrayBuffer = await file.arrayBuffer();
  let pdfBytes: Uint8Array;

  try {
    const pdfDoc = await PDFDocument.load(arrayBuffer, {
        ...(password && { password: password }),
        ignoreEncryption: !password
    });
    pdfBytes = await pdfDoc.save();
  } catch (e: any) {
    // Catch password errors by checking the message string
    if (e.message?.toLowerCase().includes('password')) {
        throw new Error('Incorrect password provided.');
    }
    throw new Error('Failed to load or decrypt PDF. It may be corrupted.');
  }
  
  const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
  const pdf = await loadingTask.promise;

  const transactions: ExtractedTransaction[] = [];
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join('\n');
    
    let match;
    while ((match = transactionRegex.exec(pageText)) !== null) {
      const amount = parseFloat(match[3].replace(/,/g, ''));
      const isDebit = match[4] === '-';

      transactions.push({
        date: match[1], // Added required 'date' property
        valueDate: match[1],
        description: match[2].trim(),
        category: 'Uncategorized', // Added required 'category' property
        reference: `ref_${Date.now()}_${Math.random()}`,
        debit: isDebit ? amount : 0,
        credit: !isDebit ? amount : 0,
        balance: 0,
      });
    }
  }

  if (transactions.length === 0) {
    throw new Error("No transactions found. The document format may not be supported.");
  }

  return transactions;
}
