import React from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LoginButton() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        if (error?.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <Button
      onClick={handleAuth}
      disabled={isLoggingIn}
      variant={isAuthenticated ? 'outline' : 'default'}
      size="sm"
      className={`h-9 rounded-xl text-sm font-semibold transition-all ${
        isAuthenticated
          ? 'border-border hover:border-destructive hover:text-destructive'
          : 'bg-[var(--accent)] hover:bg-[var(--primary)] text-white shadow-sm hover:shadow-md'
      } disabled:opacity-50`}
    >
      {isLoggingIn ? (
        <>
          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          <span className="hidden sm:inline">Signing in...</span>
        </>
      ) : isAuthenticated ? (
        <>
          <LogOut className="w-3.5 h-3.5 mr-1.5" />
          <span className="hidden sm:inline">Sign out</span>
        </>
      ) : (
        <>
          <LogIn className="w-3.5 h-3.5 mr-1.5" />
          <span className="hidden sm:inline">Sign in</span>
        </>
      )}
    </Button>
  );
}
