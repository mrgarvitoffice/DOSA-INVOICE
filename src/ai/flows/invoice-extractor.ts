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
  invoiceDataUri: z.string().describe("A data URI of the invoice file (e.g., 'data:image/png;base64,...')."),
});
export type InvoiceInput = z.infer<typeof InvoiceInputSchema>;

const InvoiceOutputSchema = z.object({
  items: z.array(z.object({
    name: z.string().describe("The name of the item on the invoice."),
    quantity: z.number().describe("The quantity of the item."),
    unit: z.string().describe("The unit of measurement for the quantity (e.g., pcs, kg, cup)."),
    rate: z.number().describe("The rate or price per unit of the item."),
  })).describe("An array of line items extracted from the invoice."),
});
export type InvoiceOutput = z.infer<typeof InvoiceOutputSchema>;


const extractionPrompt = ai.definePrompt({
    name: 'invoiceExtractionPrompt',
    input: { schema: InvoiceInputSchema },
    output: { schema: InvoiceOutputSchema },
    prompt: `You are an expert at extracting structured data from documents.
    Extract the line items from the provided invoice file.
    
    Invoice: {{media url=invoiceDataUri}}
    `,
});


const extractFromInvoiceFlow = ai.defineFlow(
  {
    name: 'extractFromInvoice',
    inputSchema: InvoiceInputSchema,
    outputSchema: InvoiceOutputSchema,
  },
  async (input) => {
    const { output } = await extractionPrompt(input);
    return output!;
  }
);

export async function extractInvoice(input: InvoiceInput): Promise<InvoiceOutput> {
  return extractFromInvoiceFlow(input);
}
