import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '../ui/dropdown-menu';
import { Eye, Download, Share2, Trash2, MoreVertical, Copy, Link2, FileText, FileCode } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useDeleteItem, useShareItem, useUnshareItem } from '../../hooks/useQueries';
import type { Item } from '../../backend';
import { downloadCreation, type ExportFormat } from '../../utils/download';
import { getShareUrl, copyShareUrl } from '../../utils/shareLinks';
import { useState } from 'react';
import { Badge } from '../ui/badge';
import { normalizeError } from '../../services/errors';
import { Alert, AlertDescription } from '../ui/alert';
import DownloadPostDownloadDialog from '../download/DownloadPostDownloadDialog';
import AndroidDownloadHelpDialog from '../download/AndroidDownloadHelpDialog';

interface CreationListItemProps {
  item: Item;
}

export default function CreationListItem({ item }: CreationListItemProps) {
  const navigate = useNavigate();
  const deleteItem = useDeleteItem();
  const shareItem = useShareItem();
  const unshareItem = useUnshareItem();
  const [showShareUrl, setShowShareUrl] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string>('');
  const [showPostDownload, setShowPostDownload] = useState(false);
  const [lastDownloadFilename, setLastDownloadFilename] = useState('');
  const [lastDownloadFormat, setLastDownloadFormat] = useState<ExportFormat>('json');
  const [showAndroidHelp, setShowAndroidHelp] = useState(false);

  let parsedContent;
  try {
    parsedContent = JSON.parse(item.content);
  } catch {
    parsedContent = { prompt: 'Invalid data', type: 'unknown' };
  }

  const handleOpen = () => {
    navigate({ to: '/creation/$id', params: { id: item.id } });
  };

  const handleDownload = async (format: ExportFormat) => {
    setIsDownloading(true);
    setDownloadError('');
    try {
      const result = await downloadCreation(item.id, parsedContent, format);
      if (result.success) {
        setLastDownloadFilename(result.filename || 'creation');
        setLastDownloadFormat(result.format || format);
        setShowPostDownload(true);
      } else {
        setDownloadError(normalizeError(new Error(result.error)));
      }
    } catch (error) {
      setDownloadError(normalizeError(error));
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadJson = () => handleDownload('json');
  const handleDownloadHtml = () => handleDownload('html');
  
  const handleAndroidClick = () => {
    const isAndroid = /android/i.test(navigator.userAgent);
    if (isAndroid) {
      setShowAndroidHelp(true);
    } else {
      handleDownload('android');
    }
  };

  const handleAndroidInstructions = () => {
    setShowAndroidHelp(false);
    handleDownload('android');
  };

  const handleAndroidHtmlFallback = () => {
    setShowAndroidHelp(false);
    handleDownloadHtml();
  };

  const handleOpenDownloaded = () => {
    setShowPostDownload(false);
    if (lastDownloadFormat === 'json') {
      navigate({ to: '/downloaded-creation' });
    }
  };

  const handleShare = async () => {
    try {
      if (item.isShared) {
        await unshareItem.mutateAsync(item.id);
        setShowShareUrl(false);
      } else {
        await shareItem.mutateAsync(item.id);
        setShowShareUrl(true);
      }
    } catch (error) {
      setDownloadError(normalizeError(error));
    }
  };

  const handleCopyShareUrl = () => {
    try {
      copyShareUrl(item.id);
    } catch (error) {
      setDownloadError(normalizeError(error));
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this creation?')) {
      try {
        await deleteItem.mutateAsync(item.id);
      } catch (error) {
        setDownloadError(normalizeError(error));
      }
    }
  };

  const shareUrl = getShareUrl(item.id);
  const isApp = parsedContent.type === 'app';

  return (
    <>
      <Card>
        <CardContent className="p-4">
          {downloadError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{downloadError}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-start gap-2">
                <h3 className="font-semibold text-lg truncate flex-1">
                  {parsedContent.prompt || 'Untitled Creation'}
                </h3>
                {item.isShared && (
                  <Badge variant="secondary" className="shrink-0">
                    <Link2 className="h-3 w-3 mr-1" />
                    Shared
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground capitalize">{parsedContent.type}</p>
              {item.isShared && showShareUrl && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <code className="text-xs flex-1 truncate">{shareUrl}</code>
                  <Button size="sm" variant="ghost" onClick={handleCopyShareUrl}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button variant="default" size="sm" onClick={handleOpen}>
                <Eye className="h-4 w-4 mr-2" />
                Open
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="px-3">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Download</DropdownMenuLabel>
                  <DropdownMenuItem onClick={handleDownloadHtml} disabled={isDownloading}>
                    <FileCode className="h-4 w-4 mr-2" />
                    HTML (Ready to Use)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownloadJson} disabled={isDownloading}>
                    <Download className="h-4 w-4 mr-2" />
                    JSON
                  </DropdownMenuItem>
                  {isApp && (
                    <DropdownMenuItem onClick={handleAndroidClick} disabled={isDownloading}>
                      <FileText className="h-4 w-4 mr-2" />
                      Android (Setup Guide)
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleShare} disabled={shareItem.isPending || unshareItem.isPending}>
                    <Share2 className="h-4 w-4 mr-2" />
                    {item.isShared ? 'Unshare' : 'Share'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} disabled={deleteItem.isPending} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      <DownloadPostDownloadDialog
        open={showPostDownload}
        onOpenChange={setShowPostDownload}
        filename={lastDownloadFilename}
        onOpenFile={handleOpenDownloaded}
        format={lastDownloadFormat}
      />

      <AndroidDownloadHelpDialog
        open={showAndroidHelp}
        onOpenChange={setShowAndroidHelp}
        onDownloadHtml={handleAndroidHtmlFallback}
        onDownloadInstructions={handleAndroidInstructions}
      />
    </>
  );
}
