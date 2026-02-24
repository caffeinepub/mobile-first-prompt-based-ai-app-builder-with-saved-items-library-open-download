import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { CheckCircle2, ExternalLink, FileJson, FileCode, FileText } from 'lucide-react';
import type { ExportFormat } from '../../utils/download';

interface DownloadPostDownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filename: string;
  onOpenFile: () => void;
  format?: ExportFormat;
}

export default function DownloadPostDownloadDialog({
  open,
  onOpenChange,
  filename,
  onOpenFile,
  format = 'json'
}: DownloadPostDownloadDialogProps) {
  const canOpenInApp = format === 'json';
  
  const getIcon = () => {
    switch (format) {
      case 'html':
        return <FileCode className="h-8 w-8 text-muted-foreground shrink-0" />;
      case 'android':
        return <FileText className="h-8 w-8 text-muted-foreground shrink-0" />;
      default:
        return <FileJson className="h-8 w-8 text-muted-foreground shrink-0" />;
    }
  };

  const getFormatLabel = () => {
    switch (format) {
      case 'html':
        return 'HTML File';
      case 'android':
        return 'Android Setup';
      default:
        return 'JSON File';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle>Download Complete</DialogTitle>
              <DialogDescription className="mt-1">
                {format === 'html' 
                  ? 'Your file has been saved and opened in a new tab'
                  : 'Your file has been saved to your device'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="bg-muted rounded-lg p-4 flex items-center gap-3">
          {getIcon()}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{filename}</p>
            <p className="text-xs text-muted-foreground">{getFormatLabel()} • Saved to Downloads</p>
          </div>
        </div>

        {canOpenInApp ? (
          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button onClick={onOpenFile} className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in App
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
              Close
            </Button>
          </DialogFooter>
        ) : (
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)} className="w-full">
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
