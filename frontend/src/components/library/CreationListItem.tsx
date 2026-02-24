import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Eye, Trash2, Share2, Download, MoreVertical,
  Gamepad2, Globe, MessageSquare, Image, AppWindow, Calendar,
  Wand2, EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useDeleteAppCreation, useShareAppCreation, useUnshareAppCreation } from '../../hooks/useQueries';
import type { AppCreation } from '../../backend';
import { exportCreationToHtml } from '../../utils/exportCreationHtml';
import type { CreationDraft } from '../../generation/types';

interface CreationListItemProps {
  item: AppCreation;
}

function getCreationType(content: string): { label: string; icon: React.ElementType; color: string } {
  try {
    const parsed = JSON.parse(content);
    const type = parsed?.type || parsed?.kind || '';
    if (type === 'game') return { label: 'Game', icon: Gamepad2, color: 'bg-violet-50 text-violet-700 border-violet-200' };
    if (type === 'website') return { label: 'Website', icon: Globe, color: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (type === 'chatbot') return { label: 'Chatbot', icon: MessageSquare, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (type === 'image') return { label: 'Image', icon: Image, color: 'bg-amber-50 text-amber-700 border-amber-200' };
    if (type === 'app') return { label: 'App', icon: AppWindow, color: 'bg-rose-50 text-rose-700 border-rose-200' };
  } catch {}
  return { label: 'Creation', icon: Wand2, color: 'bg-gray-50 text-gray-700 border-gray-200' };
}

function getCreationTitle(content: string, id: string): string {
  try {
    const parsed = JSON.parse(content);
    return parsed?.data?.title || parsed?.title || parsed?.name || parsed?.prompt?.slice(0, 40) || id.slice(0, 20);
  } catch {}
  return id.slice(0, 20);
}

function formatDate(id: string): string {
  // id format: creation-{timestamp}-{random}
  const parts = id.split('-');
  const ts = parseInt(parts[1] || '0', 10);
  if (!ts || isNaN(ts)) return '';
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CreationListItem({ item }: CreationListItemProps) {
  const navigate = useNavigate();
  const [shareError, setShareError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const deleteItem = useDeleteAppCreation();
  const shareItem = useShareAppCreation();
  const unshareItem = useUnshareAppCreation();

  const typeInfo = getCreationType(item.content);
  const TypeIcon = typeInfo.icon;
  const title = getCreationTitle(item.content, item.id);
  const dateStr = formatDate(item.id);

  const handleOpen = () => {
    navigate({ to: '/creation/$id', params: { id: item.id } });
  };

  const handleShare = async () => {
    setShareError('');
    try {
      if (item.isShared) {
        await unshareItem.mutateAsync(item.id);
      } else {
        await shareItem.mutateAsync(item.id);
      }
    } catch (err: any) {
      setShareError(err?.message || 'Share action failed.');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleteError('');
    try {
      await deleteItem.mutateAsync(item.id);
    } catch (err: any) {
      setDeleteError(err?.message || 'Delete failed.');
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
    } catch {
      // silently fail
    }
  };

  const isSharePending = shareItem.isPending || unshareItem.isPending;
  const isDeletePending = deleteItem.isPending;

  return (
    <TooltipProvider>
      <div className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group flex flex-col">
        {/* Card Header */}
        <div className="p-5 flex-1">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${typeInfo.color}`}>
                <TypeIcon className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-foreground truncate leading-tight">
                {title}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {item.isShared && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 border-emerald-200 text-emerald-700 bg-emerald-50 font-medium">
                  Shared
                </Badge>
              )}
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeInfo.color}`}>
                {typeInfo.label}
              </span>
            </div>
          </div>

          {dateStr && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {dateStr}
            </div>
          )}

          {(shareError || deleteError) && (
            <p className="mt-2 text-xs text-destructive font-medium">
              {shareError || deleteError}
            </p>
          )}
        </div>

        {/* Card Footer Actions */}
        <div className="px-5 pb-4 flex items-center gap-2 border-t border-border/50 pt-3">
          <Button
            size="sm"
            onClick={handleOpen}
            className="flex-1 h-8 rounded-lg bg-[var(--accent)] hover:bg-[var(--primary)] text-white text-xs font-semibold transition-all"
          >
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            Open
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={handleShare}
                disabled={isSharePending}
                className="h-8 w-8 p-0 rounded-lg border-border hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
              >
                {item.isShared ? <EyeOff className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {item.isShared ? 'Unshare' : 'Share'}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
                className="h-8 w-8 p-0 rounded-lg border-border hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
              >
                <Download className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">Download HTML</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 rounded-lg hover:bg-muted transition-all"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg border-border">
              <DropdownMenuItem
                onClick={handleOpen}
                className="flex items-center gap-2 text-sm"
              >
                <Eye className="w-3.5 h-3.5" />
                View
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeletePending}
                className="text-destructive focus:text-destructive flex items-center gap-2 text-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isDeletePending ? 'Deleting...' : 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </TooltipProvider>
  );
}
