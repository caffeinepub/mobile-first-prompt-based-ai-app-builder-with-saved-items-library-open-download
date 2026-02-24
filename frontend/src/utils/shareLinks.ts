export function getShareUrl(id: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/#/shared/${id}`;
}

export function copyShareUrl(id: string): void {
  const url = getShareUrl(id);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).catch((err) => {
      console.error('Failed to copy share URL:', err);
      throw new Error('Failed to copy to clipboard');
    });
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = url;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Fallback copy failed:', err);
      throw new Error('Failed to copy to clipboard');
    } finally {
      document.body.removeChild(textArea);
    }
  }
}
