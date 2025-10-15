import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileDown, FileX2 } from 'lucide-react';
import { Logo } from './icons';

interface AppHeaderProps {
  onExport: () => void;
  onNewInvoice: () => void;
}

export default function AppHeader({ onExport, onNewInvoice }: AppHeaderProps) {
  return (
    <>
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Logo className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              DosaInvoice
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onNewInvoice}
              aria-label="Start new invoice"
            >
              <FileX2 className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
            <Button
              onClick={onExport}
              size="sm"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              aria-label="Export to Excel"
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export to Excel
            </Button>
          </div>
        </div>
        <Separator />
      </header>
    </>
  );
}
