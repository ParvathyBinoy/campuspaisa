import { Transaction, Category } from '../types';
import { formatDateDisplay } from './dates';

/**
 * Escapes a cell according to standard RFC 4180 CSV specifications.
 */
function escapeCSVCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Exports transactions to a downloaded CSV file
 */
export function exportTransactionsToCSV(
  transactions: Transaction[],
  categories: Category[],
  fileNamePrefix: string = 'campuspaisa-transactions'
): void {
  const catMap = new Map<string, string>(categories.map(c => [c.id, c.name]));

  const headers = [
    'Transaction ID',
    'Date',
    'Type',
    'Category',
    'Subcategory',
    'Description',
    'Amount',
    'Payment Method',
    'Essential',
    'Tags',
  ];

  const rows = transactions.map(t => {
    const catName = catMap.get(t.categoryId) || 'Uncategorized';
    return [
      t.id,
      formatDateDisplay(t.date),
      t.type.toUpperCase(),
      catName,
      t.subCategory || '',
      t.description,
      t.amount,
      t.paymentMethod,
      t.isEssential === true ? 'Yes' : t.isEssential === false ? 'No' : 'Unspecified',
      (t.tags || []).join('; '),
    ].map(escapeCSVCell).join(',');
  });

  const csvContent = [headers.map(escapeCSVCell).join(','), ...rows].join('\r\n');
  downloadBlob(csvContent, `${fileNamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Generic helper to download string content as a file
 */
export function downloadBlob(content: string, fileName: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
