export class ExportService {
  /**
   * Generates a CSV data string for transactions
   */
  static generateTransactionsCSV(transactions: any[]): string {
    const headers = ['Nomor Invoice', 'Tanggal', 'Operator/Kasir', 'Pelanggan', 'Subtotal', 'Pajak', 'Diskon', 'Total Bersih', 'Status'];
    const rows = transactions.map((t) => {
      const date = new Date(t.createdAt).toLocaleDateString('id-ID');
      const cashierName = t.user?.name || '-';
      const customerName = t.customer?.name || 'Walk-in Customer';
      return [
        t.invoiceNumber,
        date,
        cashierName,
        customerName,
        t.totalAmount.toString(),
        t.tax.toString(),
        t.discount.toString(),
        t.netAmount.toString(),
        t.status
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
    return csvContent;
  }

  /**
   * Generates a beautifully formatted layout mimicking a PDF ledger/receipt
   */
  static generateTransactionsPDFMock(transactions: any[], businessName: string): string {
    let report = `=========================================================\n`;
    report += `               LAPORAN KEUANGAN TRANSAKSI                \n`;
    report += `               Nama Bisnis: ${businessName.toUpperCase()}  \n`;
    report += `               Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')} \n`;
    report += `=========================================================\n\n`;

    report += String('Invoice').padEnd(16) + ' | ' +
              String('Tanggal').padEnd(12) + ' | ' +
              String('Pelanggan').padEnd(15) + ' | ' +
              String('Total Bersih (IDR)').padStart(18) + '\n';
    report += `---------------------------------------------------------\n`;

    let grandTotal = 0;
    transactions.forEach(t => {
      const dateStr = new Date(t.createdAt).toLocaleDateString('id-ID');
      const customerStr = t.customer?.name || 'Walk-in';
      const amount = Number(t.netAmount);
      grandTotal += amount;

      report += t.invoiceNumber.padEnd(16) + ' | ' +
                dateStr.padEnd(12) + ' | ' +
                customerStr.substring(0, 15).padEnd(15) + ' | ' +
                amount.toLocaleString('id-ID').padStart(18) + '\n';
    });

    report += `---------------------------------------------------------\n`;
    report += String('GRAND TOTAL:').padEnd(48) + ' | ' +
              grandTotal.toLocaleString('id-ID').padStart(18) + '\n';
    report += `=========================================================\n`;
    report += `\n* Dokumen ini dibuat otomatis oleh SmartBiz AI *`;
    return report;
  }
}
export default ExportService;
