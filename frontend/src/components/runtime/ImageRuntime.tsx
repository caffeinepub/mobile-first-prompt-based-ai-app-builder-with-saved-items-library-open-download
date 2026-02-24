import React from 'react';
import { ImageIcon, Info } from 'lucide-react';

interface ImageData {
  title?: string;
  description?: string;
  emoji?: string;
  caption?: string;
  style?: string;
  colors?: string[];
  subject?: string;
}

interface ImageRuntimeProps {
  data?: ImageData;
}

export default function ImageRuntime({ data }: ImageRuntimeProps) {
  const emoji = data?.emoji || '🎨';
  const title = data?.title || 'Artwork';
  const caption = data?.caption || data?.description || '';
  const style = data?.style || '';
  const colors = data?.colors || [];

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-muted/40 to-muted/20 p-6">
      {/* Image Frame */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-border overflow-hidden">
        {/* Canvas area */}
        <div
          className="relative flex items-center justify-center"
          style={{
            minHeight: 240,
            background: colors.length >= 2
              ? `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`
              : 'linear-gradient(135deg, oklch(0.93 0.015 264), oklch(0.88 0.03 264))',
          }}
        >
          {/* Decorative circles */}
          <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-white/10" />
          <div className="absolute bottom-4 left-4 w-10 h-10 rounded-full bg-white/10" />

          {/* Main emoji */}
          <div className="relative z-10 text-center">
            <div className="text-7xl mb-2 drop-shadow-lg">{emoji}</div>
            {style && (
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium backdrop-blur-sm">
                {style}
              </span>
            )}
          </div>
        </div>

        {/* Caption area */}
        <div className="p-4">
          <h3 className="font-display text-base font-bold text-foreground mb-1">{title}</h3>
          {caption && (
            <p className="text-sm text-muted-foreground leading-relaxed">{caption}</p>
          )}
          {colors.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <Info className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              <div className="flex gap-1.5">
                {colors.slice(0, 5).map((color, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full border border-border shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      {data?.subject && (
        <p className="mt-4 text-xs text-muted-foreground text-center max-w-xs">
          Subject: <span className="font-medium text-foreground">{data.subject}</span>
        </p>
      )}
    </div>
  );
}
