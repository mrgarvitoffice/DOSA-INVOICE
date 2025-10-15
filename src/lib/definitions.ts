export type InvoiceItem = {
    id: string;
    isHeading?: boolean;
    name: string;
    quantity: number;
    unit: string;
    rate: number;
  };

export type ExtractedItemData = Omit<InvoiceItem, 'id'>;
  