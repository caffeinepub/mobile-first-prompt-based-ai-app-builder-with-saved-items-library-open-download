import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { FileText, Download, Smartphone } from 'lucide-react';

interface AndroidDownloadHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownloadHtml: () => void;
  onDownloadInstructions: () => void;
}

export default function AndroidDownloadHelpDialog({
  open,
  onOpenChange,
  onDownloadHtml,
  onDownloadInstructions
}: AndroidDownloadHelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Smartphone className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle>Android Export Options</DialogTitle>
              <DialogDescription className="mt-1">
                Choose how you'd like to use your creation on Android
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Download className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">Recommended: HTML Export</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Download as a standalone HTML file that works immediately in any browser. 
                  Perfect for quick use on Android devices.
                </p>
                <Button onClick={onDownloadHtml} className="w-full" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download HTML (Ready to Use)
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">Advanced: Setup Instructions</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Get step-by-step instructions for creating a native Android app using Android Studio. 
                  Requires development tools and technical knowledge.
                </p>
                <Button onClick={onDownloadInstructions} variant="outline" className="w-full" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Download Instructions
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
