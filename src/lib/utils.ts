import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { InvoiceItem } from './definitions';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function escapeCsvCell(cellData: any): string {
  const stringData = String(cellData ?? '').replace(/"/g, '""');
  if (/[",\n]/.test(stringData)) {
    return `"${stringData}"`;
  }
  return stringData;
}

export function exportToCsv(items: InvoiceItem[], filename: string) {
  if (!items.length) return;

  const headers = ['S No.', 'Food Item', 'Quantity', 'Unit', 'Rate', 'Total'];
  const csvRows: string[] = [];
  
  let serialNumber = 0;
  let isFirstGroup = true;

  items.forEach((item, index) => {
    if (item.isHeading) {
      // Add space before a new heading, except for the very first item
      if (index > 0) {
        csvRows.push(''); // Add an empty row for spacing
      }
      // Add heading row, merged across columns (visually in Excel)
      csvRows.push(`"${item.name.toUpperCase()}"`);
      csvRows.push(headers.join(','));
      serialNumber = 0; // Reset serial number for each new section
      isFirstGroup = false;
    } else {
       if (isFirstGroup && index === 0) {
         csvRows.push(headers.join(','));
         isFirstGroup = false;
       }

      if (!item.name && !item.quantity && !item.rate) {
          return; // Skip empty/placeholder rows
      }

      serialNumber++;
      const total = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
      const row = [
        serialNumber,
        escapeCsvCell(item.name),
        item.quantity || '',
        escapeCsvCell(item.unit),
        item.rate || '',
        total > 0 ? total.toFixed(2) : ''
      ].join(',');
      csvRows.push(row);
    }
  });


  const csvContent = csvRows.join('\n');
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
