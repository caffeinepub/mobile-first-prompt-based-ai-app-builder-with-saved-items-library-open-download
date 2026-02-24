import { useParams } from '@tanstack/react-router';
import { useGetSharedItem } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { CreationPreview } from '../components/preview/CreationPreview';
import AsyncState from '../components/system/AsyncState';
import { Badge } from '../components/ui/badge';
import { normalizeError } from '../services/errors';

export default function SharedViewerPage() {
  const { id } = useParams({ from: '/shared/$id' });
  const { data: item, isLoading, error, refetch } = useGetSharedItem(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading shared creation...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-4 py-12">
          <h2 className="text-2xl font-bold">Not Found</h2>
          <p className="text-muted-foreground">
            This creation is not available or no longer shared.
          </p>
        </div>
      </div>
    );
  }

  let parsedContent;
  try {
    parsedContent = JSON.parse(item.content);
  } catch (parseError) {
    return (
      <div className="max-w-4xl mx-auto">
        <AsyncState error={normalizeError(parseError)} onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Badge variant="secondary">Shared Creation</Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-1">
            <CardTitle>{parsedContent.prompt || 'Shared Creation'}</CardTitle>
            <p className="text-sm text-muted-foreground capitalize">{parsedContent.type}</p>
          </div>
        </CardHeader>
        <CardContent>
          <CreationPreview type={parsedContent.type} data={parsedContent.data} />
        </CardContent>
      </Card>
    </div>
  );
}
