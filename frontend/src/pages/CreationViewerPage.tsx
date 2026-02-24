import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetItem } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { CreationPreview } from '../components/preview/CreationPreview';
import ViewerHeaderActions from '../components/viewer/ViewerHeaderActions';
import AsyncState from '../components/system/AsyncState';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { normalizeError } from '../services/errors';

export default function CreationViewerPage() {
  const { id } = useParams({ from: '/creation/$id' });
  const { data: item, isLoading, error, refetch } = useGetItem(id);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading creation...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/my-creations' })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <AsyncState
          error={normalizeError(error || new Error('Creation not found'))}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  let parsedContent;
  try {
    parsedContent = JSON.parse(item.content);
  } catch (parseError) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/my-creations' })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <AsyncState 
          error={normalizeError(parseError)} 
          onRetry={() => navigate({ to: '/my-creations' })} 
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/my-creations' })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <CardTitle>{parsedContent.prompt || 'Untitled Creation'}</CardTitle>
              <p className="text-sm text-muted-foreground capitalize">{parsedContent.type}</p>
            </div>
            <ViewerHeaderActions item={item} parsedContent={parsedContent} />
          </div>
        </CardHeader>
        <CardContent>
          <CreationPreview type={parsedContent.type} data={parsedContent.data} />
        </CardContent>
      </Card>
    </div>
  );
}
