"use client";

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { UploadCloud, File as FileIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

interface InvoiceUploaderProps {
  onFilesChange: (files: File[]) => void;
  previewUrls: string[];
}

export default function InvoiceUploader({ onFilesChange, previewUrls }: InvoiceUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesChange(Array.from(e.dataTransfer.files));
    }
  }, [onFilesChange]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesChange(Array.from(e.target.files));
      e.target.value = ''; // Reset file input
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={cn(
        "relative flex h-full w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-4 transition-all duration-300",
        isDragging ? "border-primary bg-primary/10" : "",
        { "p-0 border-none": previewUrls.length > 0 }
      )}
    >
      <input
        id="file-upload"
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileSelect}
        className="hidden"
        multiple
      />
      {previewUrls.length > 0 ? (
        <Carousel className="w-full h-full p-6">
          <CarouselContent>
            {previewUrls.map((url, index) => {
              const isImage = !url.endsWith('.pdf') && !url.startsWith('blob:application/pdf');
               return (
                <CarouselItem key={index}>
                    <div className="relative w-full h-[calc(100vh-18rem)]">
                        {isImage ? (
                            <Image
                                src={url}
                                alt={`Invoice Preview ${index + 1}`}
                                fill
                                style={{ objectFit: 'contain' }}
                                className="rounded-md transition-opacity duration-500 opacity-0 animate-fade-in"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-slate-50 rounded-md">
                                <FileIcon className="w-24 h-24 mb-4" />
                                <p className="text-lg font-medium">PDF file uploaded</p>
                                <p className="text-sm">Preview is not available for PDFs.</p>
                            </div>
                        )}
                    </div>
                </CarouselItem>
              )
            })}
          </CarouselContent>
          {previewUrls.length > 1 && (
            <>
                <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
            </>
          )}
        </Carousel>
      ) : (
        <label htmlFor="file-upload" className="flex h-full w-full cursor-pointer flex-col items-center justify-center text-center text-muted-foreground hover:text-primary">
            <UploadCloud className="h-12 w-12 mb-4" />
            <p className="font-semibold">Drag & drop your invoices here</p>
            <p className="text-sm mt-1">or click to browse</p>
            <p className="text-xs mt-4 text-muted-foreground/80">Supports JPG, PNG, PDF</p>
        </label>
      )}
    </div>
  );
}
