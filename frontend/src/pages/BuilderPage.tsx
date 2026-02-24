import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { generateFromPrompt, CreationType } from '../generation/templates';
import { CreationPreview } from '../components/preview/CreationPreview';
import { useCreateItem } from '../hooks/useQueries';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { Sparkles, Save } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import AsyncState from '../components/system/AsyncState';
import { normalizeError } from '../services/errors';
import { detectGameKind, getGameKindLabel, type GameKind } from '../generation/detectGameKind';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const CREATION_TYPES: { value: CreationType; label: string; icon: string }[] = [
  { value: 'app', label: 'App', icon: '📱' },
  { value: 'website', label: 'Website', icon: '🌐' },
  { value: 'chatbot', label: 'Chatbot', icon: '💬' },
  { value: 'image', label: 'Image', icon: '🖼️' },
  { value: 'game', label: 'Game', icon: '🎮' },
];

const GAME_KINDS: { value: GameKind | 'auto'; label: string }[] = [
  { value: 'auto', label: 'Auto-detect' },
  { value: 'runner', label: 'Runner' },
  { value: 'shooter', label: 'Shooter' },
  { value: 'catch', label: 'Catch' },
  { value: 'puzzle', label: 'Puzzle' },
  { value: 'space', label: 'Space' },
];

export default function BuilderPage() {
  const [prompt, setPrompt] = useState('');
  const [selectedType, setSelectedType] = useState<CreationType>('app');
  const [gameKindOverride, setGameKindOverride] = useState<GameKind | 'auto'>('auto');
  const [detectedGameKind, setDetectedGameKind] = useState<GameKind | null>(null);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const createItem = useCreateItem();
  const { isAuthenticated } = useCurrentUser();
  const navigate = useNavigate();

  // Detect game kind when prompt changes and type is game
  useEffect(() => {
    if (selectedType === 'game' && prompt.trim()) {
      const detection = detectGameKind(prompt);
      setDetectedGameKind(detection.kind);
    } else {
      setDetectedGameKind(null);
    }
  }, [prompt, selectedType]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGenerateError(null);

    try {
      const options = selectedType === 'game' && gameKindOverride !== 'auto'
        ? { gameKindOverride }
        : undefined;
      
      const result = await generateFromPrompt(prompt, selectedType, options);
      setGeneratedContent(result);
    } catch (error: any) {
      setGenerateError(normalizeError(error));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedContent || !isAuthenticated) return;

    setSaveError(null);

    try {
      const id = `creation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const content = JSON.stringify({
        type: selectedType,
        prompt,
        data: generatedContent,
        createdAt: Date.now(),
      });

      await createItem.mutateAsync({ id, content });
      navigate({ to: '/my-creations' });
    } catch (error: any) {
      setSaveError(normalizeError(error));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Create Something Amazing</h2>
        <p className="text-muted-foreground">
          Describe what you want to build, and we'll generate a ready-to-use interactive preview instantly.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What do you want to create?</CardTitle>
          <CardDescription>Enter a prompt and select the type of creation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="prompt">Your Prompt</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., A calculator app, A todo list app with dark mode, A portfolio website for a photographer, A friendly customer support chatbot, A space shooter game..."
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>Creation Type</Label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {CREATION_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                    selectedType === type.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="text-3xl">{type.icon}</span>
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedType === 'game' && (
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
              <div className="space-y-2">
                <Label htmlFor="game-kind">Game Type</Label>
                <Select value={gameKindOverride} onValueChange={(value) => setGameKindOverride(value as GameKind | 'auto')}>
                  <SelectTrigger id="game-kind">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GAME_KINDS.map((kind) => (
                      <SelectItem key={kind.value} value={kind.value}>
                        {kind.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {detectedGameKind && gameKindOverride === 'auto' && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Detected:</span> {getGameKindLabel(detectedGameKind)}
                </div>
              )}
              
              {gameKindOverride !== 'auto' && (
                <div className="text-sm text-muted-foreground">
                  Manual override active: {getGameKindLabel(gameKindOverride)}
                </div>
              )}
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full gap-2"
            size="lg"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate
              </>
            )}
          </Button>

          {generateError && (
            <AsyncState
              error={generateError}
              onRetry={handleGenerate}
            />
          )}
        </CardContent>
      </Card>

      {generatedContent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Preview</CardTitle>
              {isAuthenticated && (
                <Button
                  onClick={handleSave}
                  disabled={createItem.isPending}
                  variant="default"
                  size="sm"
                  className="gap-2"
                >
                  {createItem.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {saveError && (
              <AsyncState
                error={saveError}
                onRetry={handleSave}
              />
            )}
            <CreationPreview type={selectedType} data={generatedContent} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
