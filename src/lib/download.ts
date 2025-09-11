import ExcelJS from 'exceljs';

function generateQBO(transactions: any[]): string {
    const bankId = "123456789";
    const acctId = "987654321";
    const acctType = "CHECKING";
    const currency = "USD";
  
    const transactionEntries = transactions.map(t => `
      <STMTTRN>
        <TRNTYPE>${t.amount > 0 ? 'CREDIT' : 'DEBIT'}</TRNTYPE>
        <DTPOSTED>${t.date.replace(/\//g, '')}120000</DTPOSTED>
        <TRNAMT>${t.amount.toFixed(2)}</TRNAMT>
        <FITID>${new Date(t.date).getTime()}${Math.random()}</FITID>
        <NAME>${t.description.substring(0, 32)}</NAME>
      </STMTTRN>`).join('');
  
    return `
OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:USASCII
CHARSET:1252

<OFX>
  <SIGNONMSGSRSV1>
    <SONRS>
      <STATUS><CODE>0</CODE><SEVERITY>INFO</SEVERITY></STATUS>
      <DTSERVER>${new Date().toISOString().replace(/[-:.]/g, "").substring(0, 14)}</DTSERVER>
      <LANGUAGE>ENG</LANGUAGE>
    </SONRS>
  </SIGNONMSGSRSV1>
  <BANKMSGSRSV1>
    <STMTTRNRS>
      <TRNUID>1</TRNUID>
      <STATUS><CODE>0</CODE><SEVERITY>INFO</SEVERITY></STATUS>
      <STMTRS>
        <CURDEF>${currency}</CURDEF>
        <BANKACCTFROM><BANKID>${bankId}</BANKID><ACCTID>${acctId}</ACCTID><ACCTTYPE>${acctType}</ACCTTYPE></BANKACCTFROM>
        <BANKTRANLIST>
          ${transactionEntries}
        </BANKTRANLIST>
      </STMTRS>
    </STMTTRNRS>
  </BANKMSGSRSV1>
</OFX>
  `.trim();
}

export async function downloadTransactions(transactions: any[], format: 'xlsx' | 'csv' | 'json' | 'qbo', fileName: string) {
    if (!transactions || transactions.length === 0) {
        alert("No transactions to download.");
        return;
    }

    let blob: Blob;
    let fileExtension: string;

    switch (format) {
        case 'xlsx':
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Transactions');
            
            worksheet.columns = Object.keys(transactions[0]).map(key => ({
                header: key.toUpperCase(),
                key: key,
                width: 20
            }));

            worksheet.addRows(transactions);
            
            const buffer = await workbook.xlsx.writeBuffer();
            blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fileExtension = 'xlsx';
            break;

        case 'csv':
            const csvWorkbook = new ExcelJS.Workbook();
            const csvWorksheet = csvWorkbook.addWorksheet('Transactions');
            csvWorksheet.columns = Object.keys(transactions[0]).map(key => ({ header: key, key: key }));
            csvWorksheet.addRows(transactions);

            const csvBuffer = await csvWorkbook.csv.writeBuffer();
            blob = new Blob([csvBuffer], { type: 'text/csv;charset=utf-8;' });
            fileExtension = 'csv';
            break;

        case 'json':
            blob = new Blob([JSON.stringify(transactions, null, 2)], { type: 'application/json' });
            fileExtension = 'json';
            break;
            
        case 'qbo':
            const qboData = generateQBO(transactions);
            blob = new Blob([qboData], { type: 'application/vnd.intu.qbo' });
            fileExtension = 'qbo';
            break;

        default:
            return;
    }

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.${fileExtension}`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
