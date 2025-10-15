import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { InvoiceItem } from './definitions';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function exportToCsv(items: InvoiceItem[], filename: string) {
  if (!items.length) return;

  const headers = ['S No.', 'Food Item', 'Quantity', 'Unit', 'Rate', 'Total'];
  const filteredItems = items.filter(item => item.name || item.quantity || item.rate);
  
  const rows = filteredItems.map((item, index) => {
    const total = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
    return [
      index + 1,
      `"${item.name.replace(/"/g, '""')}"`,
      item.quantity,
      `"${item.unit.replace(/"/g, '""')}"`,
      item.rate,
      total.toFixed(2)
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
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
