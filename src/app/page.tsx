"use client";

import { useState, useTransition } from 'react';
import type { InvoiceItem } from '@/lib/definitions';
import { extractInvoiceData } from '@/lib/actions';
import { exportToCsv } from '@/lib/utils';
import InvoiceUploader from '@/components/invoice-uploader';
import InvoiceTable from '@/components/invoice-table';
import AppHeader from '@/components/header';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from '@/components/ui/card';

const createEmptyRow = (): InvoiceItem => ({
  id: crypto.randomUUID(),
  name: '',
  quantity: 1,
  unit: '',
  rate: 0,
});

export default function Home() {
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([createEmptyRow()]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isExtracting, startExtraction] = useTransition();
  const { toast } = useToast();

  const handleFileChange = (file: File | null) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      startExtraction(async () => {
        const formData = new FormData();
        formData.append('invoice', file);
        try {
          const result = await extractInvoiceData(formData);
          if (result.error) {
            toast({
              variant: "destructive",
              title: "Extraction Failed",
              description: result.error,
            });
            setInvoiceItems([createEmptyRow()]);
          } else if (result.data) {
            const itemsWithIds = result.data.map(item => ({ ...item, id: crypto.randomUUID() }));
            setInvoiceItems(itemsWithIds.length > 0 ? itemsWithIds : [createEmptyRow()]);
            toast({
              title: "Extraction Complete",
              description: "Invoice data has been pre-filled.",
            });
          }
        } catch (error) {
          toast({
            variant: "destructive",
            title: "An unexpected error occurred",
            description: "Please try again.",
          });
          setInvoiceItems([createEmptyRow()]);
        }
      });
    } else {
      setPreviewUrl(null);
      setInvoiceItems([createEmptyRow()]);
    }
  };

  const handleReset = () => {
    handleFileChange(null);
    toast({
      title: "Form Cleared",
      description: "Ready for a new invoice.",
    });
  };

  const handleExport = () => {
    if (invoiceItems.every(item => !item.name)) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Cannot export an empty invoice.",
      });
      return;
    }
    const storeName = "DosaStore"; // Placeholder
    const date = new Date().toISOString().split('T')[0];
    const filename = `Invoice_${storeName}_${date}.csv`;
    exportToCsv(invoiceItems, filename);
    toast({
      style: {
        backgroundColor: 'hsl(var(--accent))',
        color: 'hsl(var(--accent-foreground))',
        border: '1px solid hsl(var(--accent-foreground) / 0.2)',
      },
      title: "Export Successful",
      description: `${filename} has been downloaded.`,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <AppHeader onExport={handleExport} onNewInvoice={handleReset} />
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6">
        <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-4">Upload Invoice</h2>
            <Card className="h-[calc(100vh-14rem)] shadow-md">
              <CardContent className="p-2 h-full">
                <InvoiceUploader onFileChange={handleFileChange} previewUrl={previewUrl} />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-3">
             <div className="flex items-center justify-between mb-4 h-9">
               <h2 className="text-xl md:text-2xl font-bold tracking-tight">Extracted Data</h2>
               {isExtracting && <Loader2 className="animate-spin text-primary" />}
             </div>
            <Card className="shadow-md">
              <CardContent className="p-0">
                <InvoiceTable 
                  items={invoiceItems} 
                  setItems={setInvoiceItems}
                  isProcessing={isExtracting}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
