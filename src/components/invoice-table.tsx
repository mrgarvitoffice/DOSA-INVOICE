"use client"

import type { Dispatch, SetStateAction } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2 } from 'lucide-react';
import type { InvoiceItem } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';

interface InvoiceTableProps {
  items: InvoiceItem[];
  setItems: Dispatch<SetStateAction<InvoiceItem[]>>;
  isProcessing: boolean;
}

const createEmptyRow = (): InvoiceItem => ({
  id: crypto.randomUUID(),
  isHeading: false,
  name: '',
  quantity: 1,
  unit: '',
  rate: 0,
});

export default function InvoiceTable({ items, setItems, isProcessing }: InvoiceTableProps) {
  
  const handleItemChange = (id: string, field: keyof Omit<InvoiceItem, 'id' | 'isHeading'>, value: string | number) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addNewRow = () => {
    setItems(prevItems => [...prevItems, createEmptyRow()]);
  };

  const deleteRow = (id: string) => {
    setItems(prevItems => {
        const newItems = prevItems.filter(item => item.id !== id);
        // If all rows are deleted, add a new empty one
        if (newItems.length === 0) {
            return [createEmptyRow()];
        }
        return newItems;
    });
  };
  
  if (isProcessing) {
    return (
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">S No.</TableHead>
              <TableHead className="w-[40%]">Food Item</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(4)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  let serialNumber = 0;

  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">S No.</TableHead>
            <TableHead className="min-w-[200px] w-auto">Food Item</TableHead>
            <TableHead className="min-w-[100px] w-[100px]">Quantity</TableHead>
            <TableHead className="min-w-[100px] w-[100px]">Unit</TableHead>
            <TableHead className="min-w-[100px] w-[100px]">Rate</TableHead>
            <TableHead className="text-right min-w-[100px] w-[100px]">Total</TableHead>
            <TableHead className="w-10" aria-label="Actions"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            if (item.isHeading) {
              return (
                <TableRow key={item.id} className="bg-muted/50">
                  <TableCell colSpan={6} className="py-2">
                    <div className="flex items-center justify-between">
                      <Input
                        type="text"
                        value={item.name}
                        onChange={e => handleItemChange(item.id, 'name', e.target.value)}
                        className="h-8 font-semibold text-base border-0 bg-transparent focus-visible:ring-0"
                        aria-label="Section Heading"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteRow(item.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      aria-label="Delete heading"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            }

            serialNumber++;
            const total = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
            return (
              <TableRow key={item.id}>
                <TableCell className="text-center font-medium">{serialNumber}</TableCell>
                <TableCell>
                  <Input
                    type="text"
                    value={item.name}
                    onChange={e => handleItemChange(item.id, 'name', e.target.value)}
                    className="h-8"
                    aria-label="Food Item"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={e => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    className="h-8"
                    aria-label="Quantity"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="text"
                    value={item.unit}
                    onChange={e => handleItemChange(item.id, 'unit', e.target.value)}
                    className="h-8"
                    aria-label="Unit"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.rate}
                    onChange={e => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                    className="h-8"
                    aria-label="Rate"
                  />
                </TableCell>
                <TableCell className="text-right font-medium" aria-label="Total">
                  {total.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteRow(item.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    aria-label="Delete row"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <div className="p-4 border-t">
        <Button variant="outline" size="sm" onClick={addNewRow}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Row
        </Button>
      </div>
    </div>
  );
}
