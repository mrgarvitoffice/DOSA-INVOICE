'use server';

import { extractInvoice } from '@/ai/flows/invoice-extractor';

interface ExtractedItemData {
  name: string;
  quantity: number;
  unit: string;
  rate: number;
}

export async function extractInvoiceData(formData: FormData): Promise<{ data?: ExtractedItemData[]; error?: string }> {
  const files = formData.getAll('invoices') as File[];

  if (!files || files.length === 0) {
    return { error: 'No invoice file provided.' };
  }

  try {
    const allItems: ExtractedItemData[] = [];
    
    for (const file of files) {
      const fileBuffer = await file.arrayBuffer();
      const fileContentBase64 = Buffer.from(fileBuffer).toString('base64');
      const invoiceDataUri = `data:${file.type};base64,${fileContentBase64}`;

      const result = await extractInvoice({
        invoiceDataUri: invoiceDataUri,
      });

      if (result && Array.isArray(result.items)) {
        const parsedData = result.items.map((item: any) => ({
            name: String(item.name || ''),
            quantity: parseFloat(item.quantity) || 0,
            unit: String(item.unit || ''),
            rate: parseFloat(item.rate) || 0,
        }));
        allItems.push(...parsedData);
      }
    }
    
    if (allItems.length === 0) {
        return { error: 'Failed to extract any structured data from the provided invoice(s).' };
    }

    return { data: allItems };
  } catch (e: any) {
    console.error('Error in extraction flow:', e);
    return { error: e.message || 'An unexpected error occurred during invoice processing.' };
  }
}
