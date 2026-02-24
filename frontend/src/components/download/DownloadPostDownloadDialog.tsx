import React from 'react';
import { Download, FileCode, FileJson, Smartphone, CheckCircle2, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

type DownloadFormat = 'html' | 'json' | 'android';

interface DownloadPostDownloadDialogProps {
  open: boolean;
  onClose: () => void;
  format: DownloadFormat;
  filename?: string;
  onOpenInApp?: () => void;
}

const formatConfig: Record<DownloadFormat, { icon: React.ElementType; label: string; color: string; message: string }> = {
  html: {
    icon: FileCode,
    label: 'HTML File',
    color: 'bg-blue-50 border-blue-200 text-blue-600',
    message: 'Your creation has been exported as an HTML file. Open it in any browser to view it.',
  },
  json: {
    icon: FileJson,
    label: 'JSON Export',
    color: 'bg-amber-50 border-amber-200 text-amber-600',
    message: 'Your creation data has been exported as JSON. You can import it back into the app.',
  },
  android: {
    icon: Smartphone,
    label: 'Android Setup',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    message: 'Android setup instructions have been downloaded. Follow the guide to create your native app.',
  },
};

export default function DownloadPostDownloadDialog({
  open,
  onClose,
  format,
  filename,
  onOpenInApp,
}: DownloadPostDownloadDialogProps) {
  const config = formatConfig[format] || formatConfig.html;
  const FormatIcon = config.icon;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm rounded-2xl p-0 overflow-hidden border border-border shadow-xl">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${config.color}`}>
              <FormatIcon className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="font-display text-lg font-bold text-foreground">
                Download Complete
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                {config.label} ready
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        {/* Body */}
        <div className="px-6 py-5">
          {/* Success indicator */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">Successfully downloaded</p>
              {filename && (
                <p className="text-xs text-emerald-600 font-mono mt-0.5 truncate">{filename}</p>
              )}
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">{config.message}</p>
        </div>

        <Separator />

        {/* Footer */}
        <DialogFooter className="px-6 py-4 flex gap-2">
          {onOpenInApp && format === 'json' && (
            <Button
              onClick={onOpenInApp}
              variant="outline"
              className="flex-1 rounded-xl border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)]/5 font-semibold text-sm transition-all"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in App
            </Button>
          )}
          <Button
            onClick={onClose}
            className="flex-1 rounded-xl bg-[var(--accent)] hover:bg-[var(--primary)] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
