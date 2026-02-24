import { exportAndroidProjectZip } from './exportAndroidProjectZip';
import { exportCreationToHtml } from './exportCreationHtml';

export type ExportFormat = 'json' | 'android' | 'html';

export interface DownloadResult {
  success: boolean;
  error?: string;
  data?: any;
  filename?: string;
  format?: ExportFormat;
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-z0-9_-]/gi, '_')
    .replace(/_+/g, '_')
    .substring(0, 50);
}

export async function downloadCreation(
  id: string, 
  parsedContent: any, 
  format: ExportFormat = 'json'
): Promise<DownloadResult> {
  try {
    const title = parsedContent.data?.title || parsedContent.prompt || parsedContent.type;
    const sanitizedTitle = sanitizeFilename(title);

    if (format === 'html') {
      const htmlContent = exportCreationToHtml(parsedContent);
      const filename = `${sanitizedTitle}.html`;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);

      try {
        window.open(url, '_blank');
      } catch (popupError) {
        console.warn('Popup blocked, falling back to download only:', popupError);
      }

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(url), 1000);

      return {
        success: true,
        filename,
        format: 'html',
        data: null
      };
    } else if (format === 'android') {
      if (parsedContent.type !== 'app') {
        return {
          success: false,
          error: 'Android export is only available for app creations'
        };
      }
      
      const blob = await exportAndroidProjectZip(id, parsedContent);
      const filename = `${sanitizedTitle}_android_setup.txt`;
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return {
        success: true,
        filename,
        format: 'android',
        data: null
      };
    } else {
      const filename = `${sanitizedTitle}.json`;
      const dataStr = JSON.stringify(parsedContent, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      try {
        sessionStorage.setItem('lastDownloadedCreation', dataStr);
        sessionStorage.setItem('lastDownloadedFilename', filename);
      } catch (e) {
        console.warn('Could not store download in sessionStorage:', e);
      }

      return {
        success: true,
        filename,
        format: 'json',
        data: parsedContent
      };
    }
  } catch (error: any) {
    console.error('Download error:', error);
    return {
      success: false,
      error: error.message || 'Failed to download file. Please try again.'
    };
  }
}
