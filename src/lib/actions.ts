'use server';

import { extractInvoice } from '@/ai/flows/invoice-extractor';
import type { InvoiceItem } from './definitions';

interface ExtractedItemData {
  name: string;
  quantity: number;
  unit: string;
  rate: number;
}

export async function extractInvoiceData(formData: FormData): Promise<{ data?: ExtractedItemData[]; error?: string }> {
  const file = formData.get('invoice') as File | null;

  if (!file) {
    return { error: 'No invoice file provided.' };
  }

  const fileBuffer = await file.arrayBuffer();
  const fileContentBase64 = Buffer.from(fileBuffer).toString('base64');

  try {
    const result = await extractInvoice({
      file: {
        content: fileContentBase64,
        contentType: file.type,
      },
    });

    if (!result || !Array.isArray(result.items)) {
        return { error: 'Failed to extract structured data from the invoice.' };
    }
    
    const parsedData = result.items.map((item: any) => ({
        name: String(item.name || ''),
        quantity: parseFloat(item.quantity) || 0,
        unit: String(item.unit || ''),
        rate: parseFloat(item.rate) || 0,
    }));
    
    return { data: parsedData };
  } catch (e: any) {
    console.error('Error in extraction flow:', e);
    return { error: e.message || 'An unexpected error occurred during invoice processing.' };
  }
}
