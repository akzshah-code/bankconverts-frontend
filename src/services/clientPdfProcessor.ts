import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import { ExtractedTransaction } from '../lib/types';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface ParserConfig {
  bankName: string;
  regex: RegExp;
  mapper: (match: RegExpExecArray) => ExtractedTransaction;
}

const parsers: ParserConfig[] = [
  // --- HDFC Bank Parsers ---
  {
    bankName: 'HDFC_Type1',
    // Matches: 01/01/24 NARRATION 1,234.56 5,000.00 Cr
    regex: /^(\d{2}\/\d{2}\/\d{2})\s+(.*?)\s+([\d,]+\.\d{2})\s+[\d,.]+\s+(Cr|Dr)/gm,
    mapper: (match) => {
      const amount = parseFloat(match[3].replace(/,/g, ''));
      const isCredit = match[4] === 'Cr';
      return {
        date: match[1], valueDate: match[1], description: match[2].trim(),
        category: 'Uncategorized', reference: match[2].split('/').pop()?.trim() || 'N/A',
        debit: !isCredit ? amount : 0, credit: isCredit ? amount : 0, balance: 0,
      };
    },
  },
  
  // --- ICICI Bank Parsers ---
  {
    bankName: 'ICICI_Type1',
    // Matches: 10/01/2024 NARRATION WITHDRAWAL_AMT DEPOSIT_AMT
    regex: /^(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})/gm,
    mapper: (match) => {
      const withdrawal = parseFloat(match[3].replace(/,/g, ''));
      const deposit = parseFloat(match[4].replace(/,/g, ''));
      const isDebit = withdrawal > 0;
      return {
        date: match[1], valueDate: match[1], description: match[2].trim(),
        category: 'Uncategorized', reference: 'N/A',
        debit: isDebit ? withdrawal : 0, credit: !isDebit ? deposit : 0, balance: 0,
      };
    },
  },

  // --- SBI (State Bank of India) Parsers ---
  {
      bankName: 'SBI_Type1',
      // Matches: 05 Jan 23 NARRATION 1,000.00 0.00 50,000.00
      regex: /^(\d{2}\s[A-Za-z]{3}\s\d{2})\s+(.*?)\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})\s+[\d,.]+/gm,
      mapper: (match) => {
          const withdrawal = parseFloat(match[3].replace(/,/g, ''));
          const deposit = parseFloat(match[4].replace(/,/g, ''));
          const isDebit = withdrawal > 0;
          return {
              date: match[1], valueDate: match[1], description: match[2].trim(),
              category: 'Uncategorized', reference: 'N/A',
              debit: isDebit ? withdrawal : 0, credit: !isDebit ? deposit : 0, balance: 0,
          };
      },
  },
  
  // --- Kotak Mahindra Bank Parsers ---
  {
      bankName: 'KOTAK_Type1',
      // Matches: 10/01/2024 NARRATION 1,234.56CR
      regex: /^(\d{2}\/\d{2}\/\d{4})\s+(.*?)\s+([\d,]+\.\d{2})(CR|DR)/gm,
      mapper: (match) => {
          const amount = parseFloat(match[3].replace(/,/g, ''));
          const isCredit = match[4] === 'CR';
          return {
              date: match[1], valueDate: match[1], description: match[2].trim(),
              category: 'Uncategorized', reference: 'N/A',
              debit: !isCredit ? amount : 0, credit: isCredit ? amount : 0, balance: 0,
          };
      },
  },
];

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
    if (e.message?.toLowerCase().includes('password')) throw new Error('Incorrect password provided.');
    throw new Error('Failed to load or decrypt PDF. It may be corrupted.');
  }
  
  const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
  const pdf = await loadingTask.promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join('\n');
    fullText += pageText + '\n';
  }
  
  // For debugging: This will show you the exact text being parsed.
     console.log("--- Full PDF Text ---");
     console.log(fullText);
     console.log("---------------------");

  for (const parser of parsers) {
    const transactions: ExtractedTransaction[] = [];
    let match;
    const regex = new RegExp(parser.regex); // Re-initialize regex to reset its state
    while ((match = regex.exec(fullText)) !== null) {
      try {
        transactions.push(parser.mapper(match));
      } catch (e) {
        console.error(`Error mapping transaction for ${parser.bankName}`, match, e);
      }
    }

    if (transactions.length > 0) {
      console.log(`Successfully parsed with ${parser.bankName} parser.`);
      return transactions;
    }
  }

  throw new Error("This bank statement format is not yet supported. We are working on adding more banks.");
}
