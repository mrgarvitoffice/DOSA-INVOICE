
"use client"

import { type Dispatch, type SetStateAction, Fragment } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2 } from 'lucide-react';
import type { InvoiceItem } from '@/lib/definitions';
import { Skeleton } from './ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

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

export default function InvoiceTable(props: InvoiceTableProps) {
    const isMobile = useIsMobile();
    
    // Render mobile version if screen is small
    if (isMobile) {
        return <MobileInvoiceTable {...props} />
    }

    // Render desktop version otherwise
    return <DesktopInvoiceTable {...props} />
}


function DesktopInvoiceTable({ items, setItems, isProcessing }: InvoiceTableProps) {
  
  const handleItemChange = (id: string, field: keyof Omit<InvoiceItem, 'id'>, value: string | number | boolean) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addNewRow = (index?: number) => {
    const newRow = createEmptyRow();
    if (index !== undefined) {
      const newItems = [...items];
      newItems.splice(index + 1, 0, newRow);
      setItems(newItems);
    } else {
      setItems(prevItems => [...prevItems, newRow]);
    }
  };

  const addNewHeading = () => {
    const newHeading: InvoiceItem = {
      id: crypto.randomUUID(),
      isHeading: true,
      name: 'New Heading',
      quantity: 0,
      unit: '',
      rate: 0,
    };
    setItems(prevItems => [...prevItems, newHeading]);
  };

  const deleteRow = (id: string) => {
    setItems(prevItems => {
        const newItems = prevItems.filter(item => item.id !== id);
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
          {items.map((item, index) => {
            if (item.isHeading) {
              serialNumber = 0; // Reset for new section
              return (
                <TableRow key={item.id} className="hover:bg-transparent -mt-px">
                  <TableCell colSpan={7} className="p-2 font-semibold bg-muted/50">
                     <div className="flex items-center justify-between">
                      <Input
                        type="text"
                        value={item.name}
                        onChange={e => handleItemChange(item.id, 'name', e.target.value)}
                        className="h-9 text-base font-bold tracking-tight border-0 bg-transparent focus-visible:ring-1"
                        aria-label="Section Heading"
                      />
                       <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteRow(item.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        aria-label="Delete heading"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            }
            
            // Check if previous item was a heading to restart numbering
            if (index === 0 || items[index - 1]?.isHeading) {
              serialNumber = 1;
            } else {
              serialNumber++;
            }

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
      <div className="p-4 border-t flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => addNewRow()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Row
        </Button>
         <Button variant="outline" size="sm" onClick={addNewHeading}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Heading
        </Button>
      </div>
    </div>
  );
}


function MobileInvoiceTable({ items, setItems, isProcessing }: InvoiceTableProps) {
  const handleItemChange = (id: string, field: keyof Omit<InvoiceItem, 'id'>, value: string | number | boolean) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addNewRow = () => {
    setItems(prevItems => [...prevItems, createEmptyRow()]);
  };

  const addNewHeading = () => {
    const newHeading: InvoiceItem = {
      id: crypto.randomUUID(),
      isHeading: true,
      name: 'New Heading',
      quantity: 0,
      unit: '',
      rate: 0,
    };
    setItems(prevItems => [...prevItems, newHeading]);
  };

  const deleteRow = (id: string) => {
    setItems(prevItems => {
        const newItems = prevItems.filter(item => item.id !== id);
        if (newItems.length === 0) {
            return [createEmptyRow()];
        }
        return newItems;
    });
  };

  if (isProcessing) {
    return (
      <div className="p-2 space-y-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <div className="flex gap-4">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-8 w-1/2" />
                </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  let serialNumber = 0;

  return (
    <div className="overflow-auto p-2">
      <Accordion type="multiple" className="space-y-3">
        {items.map((item, index) => {
          if (item.isHeading) {
            return (
              <div key={item.id} className="p-2 border-b flex items-center justify-between">
                 <Input
                    type="text"
                    value={item.name}
                    onChange={e => handleItemChange(item.id, 'name', e.target.value)}
                    className="h-9 text-base font-bold tracking-tight border-0 bg-transparent focus-visible:ring-1"
                    aria-label="Section Heading"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteRow(item.id)}
                    className="h-8 w-8 flex-shrink-0 text-destructive hover:text-destructive"
                    aria-label="Delete heading"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
              </div>
            );
          }

          if (index === 0 || items[index - 1]?.isHeading) {
            serialNumber = 1;
          } else {
            serialNumber++;
          }
          const total = (Number(item.quantity) || 0) * (Number(item.rate) || 0);

          return (
            <AccordionItem key={item.id} value={item.id} className="border-none">
              <Card className="overflow-hidden">
                <AccordionTrigger className="p-4 hover:no-underline">
                  <div className="flex w-full items-center justify-between">
                     <div className="flex-1 truncate">
                        <p className="text-xs text-muted-foreground">#{serialNumber}</p>
                        <p className="font-semibold truncate">{item.name || "New Item"}</p>
                     </div>
                     <p className="font-bold text-lg ml-4 whitespace-nowrap">{total.toFixed(2)}</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4 pt-4 border-t">
                      <div className="space-y-2">
                        <Label htmlFor={`name-${item.id}`}>Food Item</Label>
                        <Input id={`name-${item.id}`} value={item.name} onChange={e => handleItemChange(item.id, 'name', e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor={`quantity-${item.id}`}>Quantity</Label>
                            <Input id={`quantity-${item.id}`} type="number" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`unit-${item.id}`}>Unit</Label>
                            <Input id={`unit-${item.id}`} value={item.unit} onChange={e => handleItemChange(item.id, 'unit', e.target.value)} />
                        </div>
                      </div>
                       <div className="space-y-2">
                            <Label htmlFor={`rate-${item.id}`}>Rate</Label>
                            <Input id={`rate-${item.id}`} type="number" value={item.rate} onChange={e => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)} />
                        </div>
                        <div className="pt-2">
                          <Button variant="destructive" size="sm" onClick={() => deleteRow(item.id)}>
                            <Trash2 className="mr-2 h-4 w-4"/>
                            Delete
                          </Button>
                        </div>
                    </div>
                </AccordionContent>
              </Card>
            </AccordionItem>
          );
        })}
      </Accordion>
      <div className="p-4 mt-2 border-t flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={addNewRow}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Row
        </Button>
         <Button variant="outline" size="sm" onClick={addNewHeading}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Heading
        </Button>
      </div>
    </div>
  );
}
