import React, { useState } from 'react';
import { Share2, Download, Trash2, Loader2, Check, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useShareAppCreation, useUnshareAppCreation, useDeleteAppCreation } from '../../hooks/useQueries';
import type { AppCreation } from '../../backend';
import { exportCreationToHtml } from '../../utils/exportCreationHtml';
import type { CreationDraft } from '../../generation/types';
import { useNavigate } from '@tanstack/react-router';

interface ViewerHeaderActionsProps {
  item: AppCreation;
}

function getCreationTitle(content: string, id: string): string {
  try {
    const parsed = JSON.parse(content);
    return parsed?.data?.title || parsed?.title || parsed?.name || parsed?.prompt?.slice(0, 40) || id.slice(0, 20);
  } catch {
    return id.slice(0, 20);
  }
}

export default function ViewerHeaderActions({ item }: ViewerHeaderActionsProps) {
  const navigate = useNavigate();
  const shareItem = useShareAppCreation();
  const unshareItem = useUnshareAppCreation();
  const deleteItem = useDeleteAppCreation();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const title = getCreationTitle(item.content, item.id);

  const handleShare = async () => {
    setError('');
    try {
      if (item.isShared) {
        await unshareItem.mutateAsync(item.id);
      } else {
        await shareItem.mutateAsync(item.id);
        const shareUrl = `${window.location.origin}/shared/${item.id}`;
        try {
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {}
      }
    } catch (err: any) {
      setError(err?.message || 'Share action failed.');
    }
  };

  const handleDownload = () => {
    try {
      const parsed: CreationDraft = JSON.parse(item.content);
      const html = exportCreationToHtml(parsed);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err?.message || 'Download failed.');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteItem.mutateAsync(item.id);
      navigate({ to: '/my-creations' });
    } catch (err: any) {
      setError(err?.message || 'Delete failed.');
    }
  };

  const isSharePending = shareItem.isPending || unshareItem.isPending;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {error && (
          <span className="text-xs text-destructive font-medium">{error}</span>
        )}

        {/* Share */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant={item.isShared ? 'default' : 'outline'}
              onClick={handleShare}
              disabled={isSharePending}
              className={`h-9 rounded-xl text-xs font-semibold transition-all ${
                item.isShared
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-0'
                  : 'border-border hover:border-[var(--accent)] hover:text-[var(--accent)]'
              }`}
            >
              {isSharePending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : copied ? (
                <><Check className="w-3.5 h-3.5 mr-1.5" /><span className="hidden sm:inline">Copied!</span></>
              ) : item.isShared ? (
                <><EyeOff className="w-3.5 h-3.5 mr-1.5" /><span className="hidden sm:inline">Unshare</span></>
              ) : (
                <><Share2 className="w-3.5 h-3.5 mr-1.5" /><span className="hidden sm:inline">Share</span></>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {item.isShared ? 'Remove public link' : 'Create public link'}
          </TooltipContent>
        </Tooltip>

        {/* Download */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              className="h-9 rounded-xl text-xs font-semibold border-border hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">Export as HTML</TooltipContent>
        </Tooltip>

        {/* Delete */}
        <AlertDialog>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={deleteItem.isPending}
                  className="h-9 rounded-xl text-xs font-semibold border-border hover:border-destructive hover:text-destructive transition-all"
                >
                  {deleteItem.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </Button>
              </AlertDialogTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Delete creation</TooltipContent>
          </Tooltip>
          <AlertDialogContent className="rounded-2xl border-border shadow-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display text-lg font-bold">Delete Creation?</AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-muted-foreground">
                Are you sure you want to delete <strong>"{title}"</strong>? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl border-border hover:border-muted-foreground transition-all">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="rounded-xl bg-destructive hover:bg-destructive/90 text-white font-semibold transition-all"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
