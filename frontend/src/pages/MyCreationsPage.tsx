import RequireAuth from '../components/auth/RequireAuth';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useListUserItems } from '../hooks/useQueries';
import CreationListItem from '../components/library/CreationListItem';
import AsyncState from '../components/system/AsyncState';
import { Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { normalizeError } from '../services/errors';

export default function MyCreationsPage() {
  const { principal } = useCurrentUser();
  const { data: items, isLoading, error, refetch } = useListUserItems(principal);
  const navigate = useNavigate();

  return (
    <RequireAuth>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">My Creations</h2>
          <p className="text-muted-foreground">Manage your saved creations</p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading your creations...</p>
            </div>
          </div>
        )}

        {error && (
          <AsyncState
            error={normalizeError(error)}
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !error && items && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <img
              src="/assets/generated/empty-creations.dim_1200x800.png"
              alt="No creations yet"
              className="w-full max-w-md opacity-80"
            />
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">No creations yet</h3>
              <p className="text-muted-foreground">
                Start building something amazing with AI
              </p>
            </div>
            <Button onClick={() => navigate({ to: '/' })} className="gap-2">
              <Sparkles className="h-5 w-5" />
              Create Your First Project
            </Button>
          </div>
        )}

        {!isLoading && !error && items && items.length > 0 && (
          <div className="space-y-3">
            {items.map((item) => (
              <CreationListItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
