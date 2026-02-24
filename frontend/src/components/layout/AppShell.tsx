import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { useEffect } from 'react';
import LoginButton from '../auth/LoginButton';
import ProfileSetupModal from '../auth/ProfileSetupModal';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { Sparkles, FolderOpen } from 'lucide-react';
import { Button } from '../ui/button';
import { ErrorBoundary } from '../system/ErrorBoundary';

export function AppShell() {
  const navigate = useNavigate();
  const { isAuthenticated, userProfile, isLoading, isFetched } = useCurrentUser();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const showProfileSetup = isAuthenticated && !isLoading && isFetched && userProfile === null;

  // Force light mode by removing any dark class
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/caffeine-logo.dim_512x512.png"
              alt="Logo"
              className="h-8 w-8 object-contain"
            />
            <h1 className="text-lg font-bold">AI Builder</h1>
          </div>
          <LoginButton />
        </div>
      </header>

      <main className="flex-1 container px-4 py-6 pb-24">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 safe-area-bottom">
        <div className="container flex items-center justify-around h-16 px-4">
          <Button
            variant={currentPath === '/' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => navigate({ to: '/' })}
            className="flex-col h-auto py-2 gap-1"
          >
            <Sparkles className="h-5 w-5" />
            <span className="text-xs">Builder</span>
          </Button>
          <Button
            variant={currentPath === '/my-creations' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => navigate({ to: '/my-creations' })}
            className="flex-col h-auto py-2 gap-1"
          >
            <FolderOpen className="h-5 w-5" />
            <span className="text-xs">My Creations</span>
          </Button>
        </div>
      </nav>

      <ProfileSetupModal open={showProfileSetup} />
    </div>
  );
}
