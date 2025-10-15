
'use server';

/**
 * @fileOverview An invoice extraction AI agent.
 *
 * - extractInvoice - A function that handles the invoice extraction process.
 * - InvoiceInput - The input type for the extractInvoice function.
 * - InvoiceOutput - The return type for the extractInvoice function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const InvoiceInputSchema = z.object({
  file: z.object({
    content: z.any().describe("A file buffer of the invoice."),
    contentType: z.string().describe("The MIME type of the invoice file."),
  }),
});
export type InvoiceInput = z.infer<typeof InvoiceInputSchema>;

const InvoiceOutputSchema = z.object({
  items: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
    unit: z.string(),
    rate: z.number(),
  }))
});
export type InvoiceOutput = z.infer<typeof InvoiceOutputSchema>;


const extractFromInvoiceFlow = ai.defineFlow(
  {
    name: 'extractFromInvoice',
    inputSchema: InvoiceInputSchema,
    outputSchema: InvoiceOutputSchema,
  },
  async (input) => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log(`Simulating OCR for file of type: ${input.file.contentType}`);
    
    return {
      items: [
        { name: 'Plain Dosa', quantity: 2, unit: 'pcs', rate: 80 },
        { name: 'Masala Dosa', quantity: 1, unit: 'pcs', rate: 100 },
        { name: 'Filter Coffee', quantity: 3, unit: 'cup', rate: 40 },
        { name: 'Mineral Water', quantity: 1, unit: 'btl', rate: 20 },
      ]
    };
  }
);

export async function extractInvoice(input: InvoiceInput): Promise<InvoiceOutput> {
  return extractFromInvoiceFlow(input);
}
