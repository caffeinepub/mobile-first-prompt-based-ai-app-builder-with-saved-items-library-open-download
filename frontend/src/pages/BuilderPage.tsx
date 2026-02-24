import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Wand2, Gamepad2, Globe, MessageSquare, Image, AppWindow,
  Loader2, Sparkles, ChevronDown, ChevronUp, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useGenerateAppCreation } from '../hooks/useQueries';
import { generateFromPrompt, type CreationType } from '../generation/templates';
import type { GameKind } from '../generation/detectGameKind';
import RequireAuth from '../components/auth/RequireAuth';

type GameKindOverride = GameKind | null;

const creationTypes: { type: CreationType; label: string; icon: React.ElementType; description: string; color: string }[] = [
  { type: 'game', label: 'Game', icon: Gamepad2, description: '2D browser game', color: 'text-violet-600 bg-violet-50 border-violet-200' },
  { type: 'website', label: 'Website', icon: Globe, description: 'Multi-page site', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { type: 'chatbot', label: 'Chatbot', icon: MessageSquare, description: 'AI conversation', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { type: 'image', label: 'Image', icon: Image, description: 'Visual artwork', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { type: 'app', label: 'App', icon: AppWindow, description: 'Interactive app', color: 'text-rose-600 bg-rose-50 border-rose-200' },
];

const gameKindOptions: { value: GameKindOverride; label: string }[] = [
  { value: null, label: 'Auto-detect' },
  { value: 'runner', label: 'Runner' },
  { value: 'shooter', label: 'Shooter' },
  { value: 'catch', label: 'Catch' },
  { value: 'puzzle', label: 'Puzzle' },
  { value: 'space', label: 'Space' },
];

export default function BuilderPage() {
  const [prompt, setPrompt] = useState('');
  const [selectedType, setSelectedType] = useState<CreationType>('game');
  const [gameKindOverride, setGameKindOverride] = useState<GameKindOverride>(null);
  const [showGameOptions, setShowGameOptions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const generateAppCreation = useGenerateAppCreation();

  const handleGenerate = async () => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      setError('Please describe what you want to create.');
      return;
    }
    setError('');
    setIsGenerating(true);
    try {
      const id = `creation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const options = selectedType === 'game' && gameKindOverride
        ? { gameKindOverride }
        : undefined;
      const data = await generateFromPrompt(trimmedPrompt, selectedType, options);
      const content = JSON.stringify({
        type: selectedType,
        prompt: trimmedPrompt,
        data,
        createdAt: Date.now(),
      });
      await generateAppCreation.mutateAsync({ id, content });
      navigate({ to: '/creation/$id', params: { id } });
    } catch (err: any) {
      setError(err?.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedTypeInfo = creationTypes.find(t => t.type === selectedType)!;

  return (
    <RequireAuth>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Creator
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Build Something Amazing
          </h1>
          <p className="text-muted-foreground text-base">
            Describe your idea and let AI bring it to life in seconds.
          </p>
        </div>

        {/* Creation Type Selector */}
        <div className="mb-6">
          <Label className="text-sm font-semibold text-foreground mb-3 block">
            What do you want to create?
          </Label>
          <div className="grid grid-cols-5 gap-2">
            {creationTypes.map(({ type, label, icon: Icon, description, color }) => {
              const isSelected = selectedType === type;
              return (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedType(type);
                    setShowGameOptions(false);
                    setError('');
                  }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center group ${
                    isSelected
                      ? 'border-[var(--accent)] bg-[var(--accent)]/5 shadow-sm'
                      : 'border-border bg-white hover:border-[var(--accent)]/40 hover:bg-muted/50'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-all ${
                    isSelected ? color : 'bg-muted border-border text-muted-foreground group-hover:bg-muted'
                  }`}>
                    <Icon className="w-[18px] h-[18px]" />
                  </div>
                  <div>
                    <div className={`text-xs font-semibold leading-tight ${isSelected ? 'text-[var(--accent)]' : 'text-foreground'}`}>
                      {label}
                    </div>
                    <div className="text-[10px] text-muted-foreground leading-tight hidden sm:block">
                      {description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Game Kind Options */}
        {selectedType === 'game' && (
          <div className="mb-5">
            <button
              onClick={() => setShowGameOptions(!showGameOptions)}
              className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              Game type options
              {showGameOptions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showGameOptions && (
              <div className="mt-3 flex flex-wrap gap-2">
                {gameKindOptions.map(({ value, label }) => (
                  <button
                    key={String(value)}
                    onClick={() => setGameKindOverride(value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      gameKindOverride === value
                        ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-sm'
                        : 'bg-white text-muted-foreground border-border hover:border-[var(--accent)]/50 hover:text-foreground'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Prompt Input */}
        <div className="mb-6">
          <Label htmlFor="prompt" className="text-sm font-semibold text-foreground mb-2 block">
            Describe your {selectedTypeInfo.label.toLowerCase()}
          </Label>
          <div className="relative">
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (error) setError('');
              }}
              placeholder={
                selectedType === 'game'
                  ? 'e.g. A space shooter game where you dodge asteroids and collect power-ups...'
                  : selectedType === 'website'
                  ? 'e.g. A portfolio website for a photographer with a gallery and contact form...'
                  : selectedType === 'chatbot'
                  ? 'e.g. A friendly customer support bot for a coffee shop...'
                  : selectedType === 'image'
                  ? 'e.g. A serene mountain landscape at sunset with vibrant colors...'
                  : 'e.g. A task manager app with categories, priorities, and due dates...'
              }
              className="min-h-[140px] resize-none rounded-xl border-border focus-visible:ring-[var(--accent)] text-sm leading-relaxed pr-4 pt-4 text-foreground bg-white placeholder:text-muted-foreground"
              maxLength={500}
            />
            <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
              {prompt.length}/500
            </div>
          </div>
          {error && (
            <p className="mt-2 text-xs text-destructive font-medium flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-destructive inline-block" />
              {error}
            </p>
          )}
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full h-12 rounded-xl bg-[var(--accent)] hover:bg-[var(--primary)] text-white font-semibold text-base shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating your {selectedTypeInfo.label.toLowerCase()}...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 mr-2" />
              Generate {selectedTypeInfo.label}
            </>
          )}
        </Button>

        {/* Tips */}
        <div className="mt-6 p-4 rounded-xl bg-muted/60 border border-border">
          <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
            Tips for better results
          </p>
          <ul className="space-y-1">
            {[
              'Be specific about features and style',
              'Mention colors, themes, or genres',
              'Describe the target audience or use case',
            ].map((tip) => (
              <li key={tip} className="text-xs text-muted-foreground flex items-start gap-1.5">
                <span className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </RequireAuth>
  );
}
