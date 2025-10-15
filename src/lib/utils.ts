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
  if (!items.length || items.every(item => !item.name)) return;

  const headers = ['S No.', 'Food Item', 'Quantity', 'Unit', 'Rate', 'Total'];
  const csvRows: string[] = [];
  
  const groupedItems: { heading: InvoiceItem | null; items: InvoiceItem[] }[] = [];
  let currentGroup: { heading: InvoiceItem | null; items: InvoiceItem[] } = { heading: null, items: [] };

  items.forEach(item => {
    if (item.isHeading) {
      if (currentGroup.items.length > 0 || currentGroup.heading) {
        groupedItems.push(currentGroup);
      }
      currentGroup = { heading: item, items: [] };
    } else {
      if (!item.name && !item.quantity && !item.rate) {
        return; // Skip empty/placeholder rows
      }
      currentGroup.items.push(item);
    }
  });
  groupedItems.push(currentGroup);
  
  let serialNumberOffset = 0;
  groupedItems.forEach((group, groupIndex) => {
    if (group.heading) {
      if (csvRows.length > 0) {
        csvRows.push(''); // Add an empty row for spacing
      }
      csvRows.push(`"${group.heading.name.toUpperCase()}"`);
    }

    if (group.items.length > 0) {
      csvRows.push(headers.join(','));
      group.items.forEach((item, itemIndex) => {
        const total = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
        const row = [
          serialNumberOffset + itemIndex + 1,
          escapeCsvCell(item.name),
          item.quantity,
          escapeCsvCell(item.unit),
          item.rate,
          total.toFixed(2)
        ].join(',');
        csvRows.push(row);
      });
      serialNumberOffset += group.items.length;
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
