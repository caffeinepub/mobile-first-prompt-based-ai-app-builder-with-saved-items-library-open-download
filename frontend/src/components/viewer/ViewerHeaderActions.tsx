import { Button } from '../ui/button';
import { Download, Share2, Trash2, Copy, ChevronDown, FileText, FileCode } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useDeleteItem, useShareItem, useUnshareItem } from '../../hooks/useQueries';
import type { Item } from '../../backend';
import { downloadCreation, type ExportFormat } from '../../utils/download';
import { copyShareUrl } from '../../utils/shareLinks';
import { useState } from 'react';
import { Badge } from '../ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel } from '../ui/dropdown-menu';
import { normalizeError } from '../../services/errors';
import { Alert, AlertDescription } from '../ui/alert';
import DownloadPostDownloadDialog from '../download/DownloadPostDownloadDialog';
import AndroidDownloadHelpDialog from '../download/AndroidDownloadHelpDialog';

interface ViewerHeaderActionsProps {
  item: Item;
  parsedContent: any;
}

export default function ViewerHeaderActions({ item, parsedContent }: ViewerHeaderActionsProps) {
  const navigate = useNavigate();
  const deleteItem = useDeleteItem();
  const shareItem = useShareItem();
  const unshareItem = useUnshareItem();
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string>('');
  const [showPostDownload, setShowPostDownload] = useState(false);
  const [lastDownloadFilename, setLastDownloadFilename] = useState('');
  const [lastDownloadFormat, setLastDownloadFormat] = useState<ExportFormat>('json');
  const [showAndroidHelp, setShowAndroidHelp] = useState(false);

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
      } else {
        await shareItem.mutateAsync(item.id);
        copyShareUrl(item.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      setDownloadError(normalizeError(error));
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this creation?')) {
      try {
        await deleteItem.mutateAsync(item.id);
        navigate({ to: '/my-creations' });
      } catch (error) {
        setDownloadError(normalizeError(error));
      }
    }
  };

  const isApp = parsedContent.type === 'app';

  return (
    <>
      {downloadError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{downloadError}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex items-center gap-2 flex-wrap">
        {item.isShared && (
          <Badge variant="secondary" className="gap-1">
            {copied ? (
              <>
                <Copy className="h-3 w-3" />
                Copied!
              </>
            ) : (
              'Shared'
            )}
          </Badge>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isDownloading}>
              <Download className="h-4 w-4 mr-1" />
              Download
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Export Format</DropdownMenuLabel>
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
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          disabled={shareItem.isPending || unshareItem.isPending}
        >
          <Share2 className="h-4 w-4 mr-1" />
          {item.isShared ? 'Unshare' : 'Share'}
        </Button>
        
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={handleDelete} 
          disabled={deleteItem.isPending}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </div>

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
