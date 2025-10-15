"use client";

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { UploadCloud, File as FileIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InvoiceUploaderProps {
  onFileChange: (file: File | null) => void;
  previewUrl: string | null;
}

export default function InvoiceUploader({ onFileChange, previewUrl }: InvoiceUploaderProps) {
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileChange(e.dataTransfer.files[0]);
    }
  }, [onFileChange]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
      e.target.value = ''; // Reset file input
    }
  };

  const isImage = previewUrl && !previewUrl.endsWith('.pdf');

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={cn(
        "relative flex h-full w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-4 transition-all duration-300",
        isDragging ? "border-primary bg-primary/10" : "",
        { "p-0 border-none": previewUrl }
      )}
    >
      <input
        id="file-upload"
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
      {previewUrl ? (
        <div className="relative w-full h-full">
            {isImage ? (
                <Image
                    src={previewUrl}
                    alt="Invoice Preview"
                    fill
                    style={{ objectFit: 'contain' }}
                    className="rounded-md transition-opacity duration-500 opacity-0 animate-fade-in"
                />
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <FileIcon className="w-24 h-24 mb-4" />
                    <p className="text-lg font-medium">PDF file uploaded</p>
                    <p className="text-sm">Preview is not available for PDFs.</p>
                </div>
            )}
        </div>
      ) : (
        <label htmlFor="file-upload" className="flex h-full w-full cursor-pointer flex-col items-center justify-center text-center text-muted-foreground hover:text-primary">
            <UploadCloud className="h-12 w-12 mb-4" />
            <p className="font-semibold">Drag & drop your invoice here</p>
            <p className="text-sm mt-1">or click to browse</p>
            <p className="text-xs mt-4 text-muted-foreground/80">Supports JPG, PNG, PDF</p>
        </label>
      )}
    </div>
  );
}

// Add fade-in animation to globals.css if it doesn't exist, or tailwind.config
// For this example, let's assume a utility class or keyframe exists:
// @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
// .animate-fade-in { animation: fadeIn 0.5s ease-in-out forwards; }
// tailwind.config.ts should have:
// keyframes: { 'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } } },
// animation: { 'fade-in': 'fade-in 0.5s ease-in-out forwards' }
