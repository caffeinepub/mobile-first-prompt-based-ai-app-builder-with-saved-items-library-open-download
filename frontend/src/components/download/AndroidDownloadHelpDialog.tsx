import React from 'react';
import { Smartphone, Download, Code2, ExternalLink, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface AndroidDownloadHelpDialogProps {
  open: boolean;
  onClose: () => void;
  onDownloadHtml: () => void;
  onDownloadAndroid: () => void;
}

export default function AndroidDownloadHelpDialog({
  open,
  onClose,
  onDownloadHtml,
  onDownloadAndroid,
}: AndroidDownloadHelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden border border-border shadow-xl">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <DialogTitle className="font-display text-lg font-bold text-foreground">
                Android Export Options
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                Choose how you want to export your creation.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Recommended option */}
          <div className="rounded-xl border-2 border-[var(--accent)]/30 bg-[var(--accent)]/5 p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Download className="w-4 h-4 text-[var(--accent)]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-foreground">HTML Export</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent)] text-white">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Download as an HTML file. Open instantly in any browser on Android — no setup required.
                </p>
              </div>
            </div>
          </div>

          {/* Advanced option */}
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                <Code2 className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Android Project Setup</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Download setup instructions for wrapping your creation in a native Android WebView app. Requires Android Studio.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Footer */}
        <DialogFooter className="px-6 py-4 flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl border-border hover:border-muted-foreground transition-all text-sm"
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={onDownloadAndroid}
            className="rounded-xl border-border hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all text-sm"
          >
            <Code2 className="w-4 h-4 mr-2" />
            Android Setup
          </Button>
          <Button
            onClick={onDownloadHtml}
            className="rounded-xl bg-[var(--accent)] hover:bg-[var(--primary)] text-white font-semibold shadow-md hover:shadow-lg transition-all text-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Download HTML
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
