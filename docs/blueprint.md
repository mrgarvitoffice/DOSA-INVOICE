# **App Name**: DosaInvoice

## Core Features:

- Invoice Upload and Preview: Allow store managers to upload invoice images or PDFs via drag-and-drop or button, instantly displaying a preview.
- OCR Data Extraction: Employ OCR technology to automatically extract item details such as Item Name, Quantity, Unit, Rate, and Total from the uploaded invoice. This is to be used as a tool to pre-populate data, as needed.
- Editable Data Table: Display extracted data in an auto-filled, editable table. Enable adding or deleting rows, and ensure dynamic auto-calculation of 'Total' (Qty x Rate).
- Manual Data Entry: Provide a manual entry option for items not captured by OCR. Enable users to type in item details directly into the table.
- Excel Export: Enable one-click export of the table data to an Excel file (.xlsx) that is automatically downloaded locally. The Excel filename should be auto-set as Invoice_StoreName_Date.xlsx.
- Table Reset: Include a 'New Invoice' button to clear the table for the next entry, resetting the form.

## Style Guidelines:

- Primary color: Light orange (#FFB347), evoking themes of productivity, clarity, and data, avoiding connotations of 'playful' or 'energetic'. The slight warmth should aim to create a sense of efficiency.
- Background color: Off-white (#F8F8F8) providing a neutral backdrop that keeps the focus on the content without causing eye strain.
- Accent color: Light yellowish-orange (#FFDA63) to draw attention to CTAs like 'Export to Excel' and highlight user actions.
- Body and headline font: 'Inter' sans-serif for a modern, objective feel. It should ensure legibility and align with a data-driven interface. Consider different font weights and sizes for information hierarchy.
- Use minimalist icons for upload, add/delete row, and export functions.
- Arrange the invoice preview on the left and the editable table on the right. Ensure a clear and intuitive layout with sufficient spacing for readability.
- Implement subtle animations, such as a smooth transition upon invoice upload and a brief highlight upon Excel export.