import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import type { InvoiceItem } from '@/lib/definitions';

// This is a placeholder API route.
// You will need to implement the logic to connect to Google Sheets.

export async function POST(request: Request) {
  try {
    const { items }: { items: InvoiceItem[] } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ message: 'No items provided.' }, { status: 400 });
    }

    // --- Google Sheets Authentication ---
    // The following code is a template for authenticating with Google Sheets.
    // It uses the environment variables you have set up.
    
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'); // Handle newline characters
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!serviceAccountEmail || !privateKey || !sheetId) {
        throw new Error("Missing Google Sheets environment variables.");
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccountEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // --- Prepare Data for Google Sheets ---
    // Convert the items into a 2D array (rows and columns) that Google Sheets expects.
    // This is just an example; you might want to format it differently.
    const headerRow = ['S.No', 'Name', 'Quantity', 'Unit', 'Rate', 'Total'];
    const rows = items
      .filter(item => !item.isHeading && item.name) // Filter out headings and empty rows
      .map((item, index) => [
        index + 1,
        item.name,
        item.quantity,
        item.unit,
        item.rate,
        (item.quantity * item.rate).toFixed(2),
      ]);

    // --- Write to Google Sheets ---
    // This example appends the data to a sheet named 'Sheet1'. 
    // You might want to create a new sheet for each invoice or handle it differently.
    // The `valueInputOption: 'USER_ENTERED'` allows Google to parse numbers and formulas.
    
    /*
    // UNCOMMENT THE FOLLOWING BLOCK TO ENABLE WRITING TO GOOGLE SHEETS
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Sheet1!A1', // The range to append to. 'Sheet1' is the default sheet name.
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [headerRow, ...rows], // Appending header row for context
      },
    });
    */

    // For now, we will return a success message without actually writing to the sheet.
    // Once you've tested your credentials, you can uncomment the block above.
    console.log("Simulating writing to Google Sheet:", [headerRow, ...rows]);

    return NextResponse.json({ message: 'Successfully saved to Google Sheet.' });

  } catch (error: any) {
    console.error('API Error:', error);
    // Return a more descriptive error message
    return NextResponse.json({ message: error.message || 'Failed to save to Google Sheet.' }, { status: 500 });
  }
}
