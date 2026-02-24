interface ImageRuntimeProps {
  data: any;
}

export default function ImageRuntime({ data }: ImageRuntimeProps) {
  return (
    <div className="space-y-4">
      <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center overflow-hidden">
        {data.url ? (
          <img src={data.url} alt={data.alt || 'Generated image'} className="w-full h-full object-cover" />
        ) : (
          <div className="text-center p-8 space-y-2">
            <div className="text-6xl">{data.emoji || '🎨'}</div>
            <p className="text-lg font-medium">{data.description || 'Generated Image'}</p>
          </div>
        )}
      </div>
      {data.caption && <p className="text-sm text-muted-foreground text-center">{data.caption}</p>}
    </div>
  );
}
