import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileDown, FileX2 } from 'lucide-react';
import { Logo } from './icons';
import { ThemeSwitcher } from './theme-switcher';

interface AppHeaderProps {
  onExport: () => void;
  onNewInvoice: () => void;
}

export default function AppHeader({ onExport, onNewInvoice }: AppHeaderProps) {
  return (
    <>
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold tracking-tight text-foreground hidden sm:block">
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
              <FileX2 className="mr-0 sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">New Invoice</span>
            </Button>
            <Button
              onClick={onExport}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              aria-label="Export to CSV"
            >
              <FileDown className="mr-0 sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
            <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />
            <ThemeSwitcher />
          </div>
        </div>
        <Separator />
      </header>
    </>
  );
}
