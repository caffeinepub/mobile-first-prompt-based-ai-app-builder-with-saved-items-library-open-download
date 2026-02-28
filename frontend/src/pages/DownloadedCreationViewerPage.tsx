import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, FileJson, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { CreationPreview } from '../components/preview/CreationPreview';
import { normalizeError } from '../services/errors';

export default function DownloadedCreationViewerPage() {
  const navigate = useNavigate();
  const [creation, setCreation] = useState<any>(null);
  const [filename, setFilename] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    try {
      const storedCreation = sessionStorage.getItem('lastDownloadedCreation');
      const storedFilename = sessionStorage.getItem('lastDownloadedFilename');

      if (!storedCreation) {
        setError('No downloaded creation found. Please download a creation first.');
        return;
      }

      const parsed = JSON.parse(storedCreation);
      setCreation(parsed);
      setFilename(storedFilename || 'downloaded-creation.json');
    } catch (err) {
      setError(normalizeError(err));
    }
  }, []);

  const handleBack = () => {
    navigate({ to: '/my-creations' });
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to My Creations
        </Button>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!creation) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to My Creations
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading downloaded creation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to My Creations
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileJson className="h-6 w-6 text-primary" />
            <div className="flex-1 min-w-0">
              <CardTitle className="truncate">{filename}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Downloaded creation • {creation.type}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-4 mb-4">
            <p className="text-sm text-muted-foreground">
              <strong>Prompt:</strong> {creation.prompt || 'No prompt available'}
            </p>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <CreationPreview type={creation.type} data={creation.data} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
