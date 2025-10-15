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
    isHeading: z.boolean().optional().describe("Set to true if this line is a section heading (e.g., 'Masala Items') and not a purchased item. Headings will not have quantity, unit, or rate."),
    name: z.string().describe("The name of the item or the heading text."),
    quantity: z.number().optional().describe("The quantity of the item. Omit for headings."),
    unit: z.string().optional().describe("The unit of measurement (e.g., pcs, kg). Omit for headings."),
    rate: z.number().optional().describe("The rate or price per unit of the item. Omit for headings."),
  })).describe("An array of line items and section headings extracted from the invoice."),
});
export type InvoiceOutput = z.infer<typeof InvoiceOutputSchema>;


const extractionPrompt = ai.definePrompt({
    name: 'invoiceExtractionPrompt',
    input: { schema: InvoiceInputSchema },
    output: { schema: InvoiceOutputSchema },
    prompt: `You are an expert at extracting structured data from documents.
    Extract the line items from the provided invoice file.
    If you encounter a line that is a category or section heading (e.g., "Masala Demand", "Vegetable Items"), treat it as a heading.
    For headings, set 'isHeading' to true and only provide the 'name'. For regular items, provide all details and 'isHeading' should be false or omitted.
    
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
