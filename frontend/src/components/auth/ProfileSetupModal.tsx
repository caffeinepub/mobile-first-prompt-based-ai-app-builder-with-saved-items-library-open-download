import React, { useState } from 'react';
import { User, Loader2, CheckCircle } from 'lucide-react';
import { useSaveCallerUserProfile } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface ProfileSetupModalProps {
  onComplete: () => void;
}

export default function ProfileSetupModal({ onComplete }: ProfileSetupModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter your name to continue.');
      return;
    }
    if (trimmed.length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    setError('');
    try {
      await saveProfile.mutateAsync({ name: trimmed });
      onComplete();
    } catch {
      setError('Failed to save profile. Please try again.');
    }
  };

  return (
    <Dialog open>
      <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden border border-border shadow-xl">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
              <User className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <div>
              <DialogTitle className="font-display text-lg font-bold text-foreground">
                Complete Your Profile
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                Tell us your name to get started.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name" className="text-sm font-semibold text-foreground">
                Your Name
              </Label>
              <Input
                id="profile-name"
                type="text"
                placeholder="e.g. Alex Johnson"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                className="h-11 rounded-xl border-border focus-visible:ring-[var(--accent)] text-sm"
                autoFocus
                maxLength={50}
              />
              {error && (
                <p className="text-xs text-destructive font-medium flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-destructive inline-block" />
                  {error}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                This name will be displayed on your profile and creations.
              </p>
            </div>
          </div>

          <Separator />

          <DialogFooter className="px-6 py-4 flex gap-2">
            <Button
              type="submit"
              disabled={saveProfile.isPending || !name.trim()}
              className="flex-1 h-11 rounded-xl bg-[var(--accent)] hover:bg-[var(--primary)] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
            >
              {saveProfile.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
