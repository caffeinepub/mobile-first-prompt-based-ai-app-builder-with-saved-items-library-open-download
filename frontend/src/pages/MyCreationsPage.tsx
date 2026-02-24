import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Plus, RefreshCw, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useListUserCreations } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Principal } from '@dfinity/principal';
import CreationListItem from '../components/library/CreationListItem';
import RequireAuth from '../components/auth/RequireAuth';

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="h-5 w-2/3 rounded-lg" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-1/3 rounded mb-4" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg ml-auto" />
      </div>
    </div>
  );
}

function EmptyState() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-48 h-36 mb-6 rounded-2xl overflow-hidden opacity-80">
        <img
          src="/assets/generated/empty-state-illustration.dim_400x300.png"
          alt="No creations yet"
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="font-display text-xl font-bold text-foreground mb-2">
        No creations yet
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        Start building something amazing with AI. Your games, apps, websites, and more will appear here.
      </p>
      <Button
        onClick={() => navigate({ to: '/' })}
        className="rounded-xl bg-[var(--accent)] hover:bg-[var(--primary)] text-white font-semibold shadow-md hover:shadow-lg transition-all"
      >
        <Plus className="w-4 h-4 mr-2" />
        Create your first project
      </Button>
    </div>
  );
}

function MyCreationsContent() {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal() ?? Principal.anonymous();
  const { data: items, isLoading, isError, refetch } = useListUserCreations(principal);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
          <RefreshCw className="w-6 h-6 text-destructive" />
        </div>
        <h3 className="font-display text-lg font-bold text-foreground mb-2">Failed to load creations</h3>
        <p className="text-sm text-muted-foreground mb-4">Something went wrong. Please try again.</p>
        <Button
          onClick={() => refetch()}
          variant="outline"
          className="rounded-xl border-border hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try again
        </Button>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <CreationListItem key={item.id} item={item} />
      ))}
    </div>
  );
}

export default function MyCreationsPage() {
  const navigate = useNavigate();
  return (
    <RequireAuth>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Library className="w-5 h-5 text-[var(--accent)]" />
              <h1 className="font-display text-2xl font-bold text-foreground">My Creations</h1>
            </div>
            <p className="text-sm text-muted-foreground">All your AI-generated projects in one place.</p>
          </div>
          <Button
            onClick={() => navigate({ to: '/' })}
            className="rounded-xl bg-[var(--accent)] hover:bg-[var(--primary)] text-white font-semibold shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            New
          </Button>
        </div>

        <MyCreationsContent />
      </div>
    </RequireAuth>
  );
}
