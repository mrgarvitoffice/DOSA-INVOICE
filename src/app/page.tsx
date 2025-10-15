
"use client";

import { useState, useTransition, useRef } from 'react';
import type { InvoiceItem } from '@/lib/definitions';
import { exportToCsv } from '@/lib/utils';
import InvoiceUploader from '@/components/invoice-uploader';
import InvoiceTable from '@/components/invoice-table';
import AppHeader from '@/components/header';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, FileUp, Sheet, FileDown } from "lucide-react";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { extractInvoiceData } from '@/lib/actions';

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
  const [isSaving, startSaving] = useTransition();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileFileInputRef = useRef<HTMLInputElement>(null);

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

  const handleMobileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files), previewUrls.length > 0);
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

  const handleSaveToSheet = () => {
    if (invoiceItems.every(item => !item.name)) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Cannot save an empty invoice.",
      });
      return;
    }
    
    startSaving(async () => {
        try {
            const response = await fetch('/api/save-to-sheet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items: invoiceItems }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save to Google Sheet.');
            }

            const result = await response.json();
            toast({
                title: "Save Successful",
                description: "Your data has been saved to Google Sheets.",
            });

        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "An error occurred",
                description: error.message || "Could not save data to Google Sheets. Make sure your backend is running.",
            });
        }
    });
  };
  
  const handleExportToCsv = () => {
    if (invoiceItems.every(item => !item.name)) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Cannot export an empty invoice.",
      });
      return;
    }
    exportToCsv(invoiceItems, `invoice-data-${new Date().toISOString()}.csv`);
    toast({
      title: "Export Successful",
      description: "Your invoice data has been exported to CSV.",
    });
  };

  const triggerFileSelect = () => {
    const inputRef = fileInputRef.current;
    if (inputRef) {
      inputRef.click();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <AppHeader onSaveToSheet={handleSaveToSheet} onNewInvoice={handleReset} onExportToCsv={handleExportToCsv} />
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:pb-8 pb-24">
        <div className="grid gap-6 lg:grid-cols-5 lg:gap-8 lg:items-start">
          
          <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-20">
            <div className="flex items-center justify-between">
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
                    onClick={triggerFileSelect}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Upload More
                  </Button>
                </>
              )}
            </div>
             <Card className="shadow-lg h-auto lg:max-h-[calc(100vh-12rem)] overflow-hidden">
                <CardContent className="p-2 h-full">
                    <div className="h-full overflow-auto">
                        <InvoiceUploader 
                            onFilesChange={handleFilesChange} 
                            previewUrls={previewUrls.map(item => item.url)}
                            isProcessing={isExtracting}
                        />
                    </div>
                </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
             <div className="flex items-center justify-between mb-4 h-9">
               <h2 className="text-xl md:text-2xl font-bold tracking-tight">Extracted Data</h2>
               {(isExtracting || isSaving) && <Loader2 className="animate-spin text-primary" />}
             </div>
            <Card className="shadow-lg lg:max-h-[calc(100vh-12rem)] overflow-hidden">
              <CardContent className="p-0 h-full">
                <div className="h-full">
                  <InvoiceTable 
                    items={invoiceItems} 
                    setItems={setInvoiceItems}
                    isProcessing={isExtracting}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mobile Action Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border p-3">
            <div className="flex justify-around items-center gap-3">
                <Button 
                    variant="outline"
                    className="flex-1"
                    onClick={handleExportToCsv}
                >
                    <FileDown className="mr-2 h-4 w-4" />
                    Export
                </Button>
                 <Button 
                    className="flex-1"
                    onClick={handleSaveToSheet}
                    disabled={isSaving}
                >
                    <Sheet className="mr-2 h-4 w-4" />
                    {isSaving ? "Saving..." : "Save"}
                </Button>
            </div>
        </div>
      </main>
    </div>
  );
}
