import React, { useState } from 'react';
import { useRouterState, useNavigate } from '@tanstack/react-router';
import { Wand2, Library, Sparkles } from 'lucide-react';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import ProfileSetupModal from '../auth/ProfileSetupModal';
import LoginButton from '../auth/LoginButton';
import { ErrorBoundary } from '../system/ErrorBoundary';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AppShellProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/', label: 'Builder', icon: Wand2 },
  { path: '/my-creations', label: 'My Creations', icon: Library },
];

export default function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { isAuthenticated, displayName, isLoading, isFetched, userProfile } = useCurrentUser();
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const userInitials = displayName
    ? displayName.slice(0, 2).toUpperCase()
    : '?';

  React.useEffect(() => {
    if (isAuthenticated && isFetched && !isLoading && userProfile === null) {
      setShowProfileSetup(true);
    }
  }, [isAuthenticated, isFetched, isLoading, userProfile]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-sm ring-1 ring-border group-hover:ring-[var(--accent)] transition-all">
              <img
                src="/assets/generated/app-logo.dim_256x256.png"
                alt="App Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-display font-bold text-lg text-foreground tracking-tight">
              CreatorAI
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
              <Sparkles className="w-3 h-3" />
              Beta
            </span>
          </button>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated && displayName && (
              <div className="hidden sm:flex items-center gap-2">
                <Avatar className="w-7 h-7">
                  <AvatarFallback className="text-xs font-semibold bg-[var(--accent)]/10 text-[var(--accent)]">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground">{displayName}</span>
              </div>
            )}
            <LoginButton />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-20 md:pb-6">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>

      {/* Bottom Navigation (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border shadow-[0_-1px_8px_0_rgba(0,0,0,0.06)] md:hidden">
        <div className="flex items-stretch h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;

            return (
              <button
                key={item.path}
                onClick={() => navigate({ to: item.path as '/' | '/my-creations' })}
                className="flex-1 flex flex-col items-center justify-center gap-1 relative transition-colors"
              >
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[var(--accent)]" />
                )}
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-[var(--accent)]' : 'text-muted-foreground'
                  }`}
                />
                <span
                  className={`text-xs font-medium transition-colors ${
                    isActive ? 'text-[var(--accent)] font-semibold' : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop floating nav */}
      <div className="hidden md:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-1 bg-white border border-border rounded-full shadow-md px-2 py-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;

            return (
              <button
                key={item.path}
                onClick={() => navigate({ to: item.path as '/' | '/my-creations' })}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[var(--accent)] text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile Setup Modal */}
      {showProfileSetup && (
        <ProfileSetupModal onComplete={() => setShowProfileSetup(false)} />
      )}

      {/* Footer */}
      <footer className="hidden md:block border-t border-border bg-white py-4 pb-24">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CreatorAI · Built with{' '}
            <span className="text-red-500">♥</span> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'creatorai')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--accent)] hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
