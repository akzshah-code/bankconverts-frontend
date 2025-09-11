import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import { ExtractedTransaction } from '../lib/types';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// --- Define Parser Configurations for Indian Banks ---

interface ParserConfig {
  bankName: string;
  regex: RegExp;
  // A function to map regex matches to a transaction object
  mapper: (match: RegExpExecArray) => ExtractedTransaction;
}

const parsers: ParserConfig[] = [
  {
    bankName: 'HDFC_Type1',
    // Matches: 01/01/24 SOME UPI/REF/TEXT 1,234.56 5,000.00 Cr
    regex: /^(\d{2}\/\d{2}\/\d{2})\s+(.*?)\s+([\d,]+\.\d{2})\s+[\d,.]+\s+(Cr|Dr)/gm,
    mapper: (match) => {
      const amount = parseFloat(match[3].replace(/,/g, ''));
      const isCredit = match[4] === 'Cr';
      return {
        date: match[1],
        valueDate: match[1],
        description: match[2].trim(),
        category: 'Uncategorized',
        reference: match[2].split('/').pop()?.trim() || 'N/A',
        debit: !isCredit ? amount : 0,
        credit: isCredit ? amount : 0,
        balance: 0,
      };
    },
  },
  {
    bankName: 'ICICI_Type1',
    // Matches: 10/01/2024 Some description text 1,000.00 0.00
    regex: /^(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})/gm,
    mapper: (match) => {
      const withdrawal = parseFloat(match[3].replace(/,/g, ''));
      const deposit = parseFloat(match[4].replace(/,/g, ''));
      const amount = withdrawal > 0 ? withdrawal : deposit;
      const isDebit = withdrawal > 0;
      return {
        date: match[1],
        valueDate: match[1],
        description: match[2].trim(),
        category: 'Uncategorized',
        reference: 'N/A',
        debit: isDebit ? amount : 0,
        credit: !isDebit ? amount : 0,
        balance: 0,
      };
    },
  },
  // Add more parsers for Axis, YES Bank, etc. here
];

// --- The Main Extraction Function ---

export async function extractTransactionsFromPdf(
  file: File,
  password?: string
): Promise<ExtractedTransaction[]> {
  const arrayBuffer = await file.arrayBuffer();
  let pdfBytes: Uint8Array;

  try {
    const pdfDoc = await PDFDocument.load(arrayBuffer, {
        ...(password && { password }),
        ignoreEncryption: !password
    });
    pdfBytes = await pdfDoc.save();
  } catch (e: any) {
    if (e.message?.toLowerCase().includes('password')) {
        throw new Error('Incorrect password provided.');
    }
    throw new Error('Failed to load or decrypt PDF. It may be corrupted.');
  }
  
  const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  let fullText = '';

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join('\n');
    fullText += pageText + '\n';
  }

  // --- Try each parser until one finds transactions ---
  for (const parser of parsers) {
    const transactions: ExtractedTransaction[] = [];
    let match;
    while ((match = parser.regex.exec(fullText)) !== null) {
      try {
        const transaction = parser.mapper(match);
        transactions.push(transaction);
      } catch (e) {
        console.error(`Error mapping transaction for ${parser.bankName}`, match);
      }
    }

    if (transactions.length > 0) {
      console.log(`Successfully parsed with ${parser.bankName} parser.`);
      return transactions;
    }
  }

  throw new Error("No transactions found. This bank statement format is not yet supported.");
}
