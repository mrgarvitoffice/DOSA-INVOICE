
"use client";

import { useState, useTransition, useRef } from 'react';
import type { InvoiceItem } from '@/lib/definitions';
import { extractInvoiceData } from '@/lib/actions';
import { exportToCsv } from '@/lib/utils';
import InvoiceUploader from '@/components/invoice-uploader';
import InvoiceTable from '@/components/invoice-table';
import AppHeader from '@/components/header';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const createEmptyRow = (): InvoiceItem => ({
  id: crypto.randomUUID(),
  name: '',
  quantity: 1,
  unit: '',
  rate: 0,
});

export default function Home() {
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([createEmptyRow()]);
  const [previewUrls, setPreviewUrls] = useState<{url: string, file: File}[]>([]);
  const [isExtracting, startExtraction] = useTransition();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (files: File[], append: boolean = false) => {
    if (files.length === 0) return;

    const newUrls = files.map(file => ({ url: URL.createObjectURL(file), file }));

    if (append) {
      setPreviewUrls(prev => [...prev, ...newUrls]);
    } else {
      previewUrls.forEach(item => URL.revokeObjectURL(item.url));
      setPreviewUrls(newUrls);
    }
    
    startExtraction(async () => {
      const formData = new FormData();
      files.forEach(file => formData.append('invoices', file));
      
      try {
        const result = await extractInvoiceData(formData);
        if (result.error) {
          toast({
            variant: "destructive",
            title: "Extraction Failed",
            description: result.error,
          });
          if (!append) setInvoiceItems([createEmptyRow()]);
        } else if (result.data) {
          const itemsWithIds = result.data.map(item => ({ ...item, id: crypto.randomUUID() }));
          
          if (append) {
            setInvoiceItems(prevItems => {
              // Filter out the initial empty row if it's the only thing present
              const existingItems = prevItems.length === 1 && !prevItems[0].name ? [] : prevItems;
              return [...existingItems, ...itemsWithIds];
            });
          } else {
            setInvoiceItems(itemsWithIds.length > 0 ? itemsWithIds : [createEmptyRow()]);
          }

          toast({
            title: "Extraction Complete",
            description: `Extracted ${itemsWithIds.length} items from ${files.length} invoice(s).`,
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "An unexpected error occurred",
          description: "Please try again.",
        });
        if (!append) setInvoiceItems([createEmptyRow()]);
      }
    });
  };

  const handleFilesChange = (files: File[]) => {
    processFiles(files, false);
  };

  const handleMoreFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files), true);
      e.target.value = ''; // Reset file input
    }
  };

  const handleReset = () => {
    previewUrls.forEach(item => URL.revokeObjectURL(item.url));
    setPreviewUrls([]);
    setInvoiceItems([createEmptyRow()]);
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
    const filename = `Invoice_Data_${date}.csv`;
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">Upload Invoice</h2>
              {previewUrls.length > 0 && (
                <>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleMoreFilesChange}
                    className="hidden"
                    ref={fileInputRef}
                    multiple
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Upload More
                  </Button>
                </>
              )}
            </div>
            <Card className="h-[calc(100vh-16rem)] shadow-md">
              <CardContent className="p-2 h-full">
                <InvoiceUploader 
                  onFilesChange={handleFilesChange} 
                  previewUrls={previewUrls.map(item => item.url)} 
                />
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
