import React from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Loader2, LogIn, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RequireAuthProps {
  children: React.ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { identity, loginStatus, login, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
          <p className="text-sm text-muted-foreground font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <div className="w-full max-w-sm">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-border p-8 flex flex-col items-center text-center">
            {/* Logo */}
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md ring-2 ring-[var(--accent)]/20 mb-5">
              <img
                src="/assets/generated/app-logo.dim_256x256.png"
                alt="CreatorAI"
                className="w-full h-full object-cover"
              />
            </div>

            {/* App name */}
            <h1 className="font-display text-2xl font-bold text-foreground mb-1">
              CreatorAI
            </h1>

            {/* Tagline */}
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Sign in to create and manage your AI-powered projects — games, apps, websites, and more.
            </p>

            {/* Features */}
            <div className="w-full space-y-2.5 mb-7">
              {[
                { icon: Wand2, text: 'Generate apps, games & websites with AI' },
                { icon: Sparkles, text: 'Save and share your creations' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-left">
                  <div className="w-7 h-7 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-[var(--accent)]" />
                  </div>
                  <span className="text-sm text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="w-full h-11 text-sm font-semibold rounded-xl bg-[var(--accent)] hover:bg-[var(--primary)] text-white transition-all shadow-md hover:shadow-lg"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign in with Internet Identity
                </>
              )}
            </Button>

            <p className="mt-4 text-xs text-muted-foreground">
              Secure, decentralized authentication — no passwords needed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
