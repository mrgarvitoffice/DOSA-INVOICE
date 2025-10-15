import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { InvoiceItem } from './definitions';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function escapeCsvCell(cellData: any): string {
  const stringData = String(cellData ?? '').replace(/"/g, '""');
  // Enclose in quotes if it contains a comma, a quote, or a newline
  if (/[",\n]/.test(stringData)) {
    return `"${stringData}"`;
  }
  return stringData;
}

export function exportToCsv(items: InvoiceItem[], filename: string) {
  if (!items.length) return;

  // Add "TOTAL" as a bold header. The actual styling happens in Excel,
  // but using uppercase convention helps.
  const headers = ['"S No."', '"Food Item"', '"Quantity"', '"Unit"', '"Rate"', '"TOTAL"'];
  
  let serialNumber = 0;
  const rows = items.map(item => {
    if (item.isHeading) {
      // For headings, merge cells and make it stand out.
      // We create a row where the first cell contains the heading, and the rest are empty.
      return [escapeCsvCell(item.name.toUpperCase()), '', '', '', '', ''].join(',');
    }
    
    if (!item.name && !item.quantity && !item.rate) {
        return null; // Skip empty/placeholder rows
    }

    serialNumber++;
    const total = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
    return [
      serialNumber,
      escapeCsvCell(item.name),
      item.quantity || '',
      escapeCsvCell(item.unit),
      item.rate || '',
      total > 0 ? total.toFixed(2) : ''
    ].join(',');
  }).filter(Boolean); // filter(Boolean) removes null entries

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' }); // \uFEFF for BOM
  const link = document.createElement("a");
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
