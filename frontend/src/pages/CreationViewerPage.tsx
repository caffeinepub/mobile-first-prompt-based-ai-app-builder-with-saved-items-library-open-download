import React from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAppCreation } from '../hooks/useQueries';
import { CreationPreview } from '../components/preview/CreationPreview';
import ViewerHeaderActions from '../components/viewer/ViewerHeaderActions';
import RequireAuth from '../components/auth/RequireAuth';

function getCreationType(content: string): string {
  try {
    const parsed = JSON.parse(content);
    return parsed?.type || parsed?.kind || 'creation';
  } catch {
    return 'creation';
  }
}

function getCreationTitle(content: string, id: string): string {
  try {
    const parsed = JSON.parse(content);
    return parsed?.data?.title || parsed?.title || parsed?.name || parsed?.prompt?.slice(0, 40) || `Creation ${id.slice(0, 8)}`;
  } catch {
    return `Creation ${id.slice(0, 8)}`;
  }
}

function typeBadgeColor(type: string): string {
  const map: Record<string, string> = {
    game: 'bg-violet-50 text-violet-700 border-violet-200',
    website: 'bg-blue-50 text-blue-700 border-blue-200',
    chatbot: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    image: 'bg-amber-50 text-amber-700 border-amber-200',
    app: 'bg-rose-50 text-rose-700 border-rose-200',
  };
  return map[type] || 'bg-gray-50 text-gray-700 border-gray-200';
}

function ViewerSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <Skeleton className="h-7 w-48 rounded-lg" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-[500px] w-full rounded-2xl" />
    </div>
  );
}

function CreationViewerContent({ id }: { id: string }) {
  const navigate = useNavigate();
  const { data: item, isLoading, isError, error, refetch } = useGetAppCreation(id);

  if (isLoading) return <ViewerSkeleton />;

  if (isError || !item) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-destructive" />
        </div>
        <h2 className="font-display text-xl font-bold text-foreground mb-2">
          {!item ? 'Creation not found' : 'Failed to load creation'}
        </h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          {(error as any)?.message || 'This creation could not be loaded. It may have been deleted or you may not have access.'}
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/my-creations' })}
            className="rounded-xl border-border hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
          </Button>
          <Button
            onClick={() => refetch()}
            className="rounded-xl bg-[var(--accent)] hover:bg-[var(--primary)] text-white font-semibold"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  let parsedContent: any = null;
  let parseError = '';
  try {
    parsedContent = JSON.parse(item.content);
  } catch {
    parseError = 'This creation has corrupted data and cannot be displayed.';
  }

  const type = getCreationType(item.content);
  const title = getCreationTitle(item.content, id);
  const badgeColor = typeBadgeColor(type);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: '/my-creations' })}
          className="h-9 w-9 p-0 rounded-xl hover:bg-muted transition-all flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="font-display text-xl font-bold text-foreground flex-1 min-w-0 truncate">
          {title}
        </h1>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${badgeColor}`}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
        <div className="flex-shrink-0">
          <ViewerHeaderActions item={item} />
        </div>
      </div>

      {/* Preview Container */}
      <div className="bg-white rounded-2xl border border-border shadow-md overflow-hidden">
        {parseError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <AlertCircle className="w-10 h-10 text-destructive mb-3" />
            <p className="text-sm text-muted-foreground">{parseError}</p>
          </div>
        ) : (
          <CreationPreview type={parsedContent?.type} data={parsedContent?.data} />
        )}
      </div>
    </div>
  );
}

export default function CreationViewerPage() {
  const { id } = useParams({ from: '/creation/$id' });
  return (
    <RequireAuth>
      <CreationViewerContent id={id} />
    </RequireAuth>
  );
}
