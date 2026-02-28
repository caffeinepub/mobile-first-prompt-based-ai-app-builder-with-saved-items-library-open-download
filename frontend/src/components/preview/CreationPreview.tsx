import React from 'react';
import { AppCreation } from '../../backend';
import AppRuntime from '../runtime/AppRuntime';
import WebsiteRuntime from '../runtime/WebsiteRuntime';
import ChatbotRuntime from '../runtime/ChatbotRuntime';
import ImageRuntime from '../runtime/ImageRuntime';
import GameRuntime2D from '../runtime/GameRuntime2D';
import { ErrorBoundary } from '../system/ErrorBoundary';

// Supports two call signatures:
//   1. <CreationPreview creation={appCreation} compact? />  (from list/builder)
//   2. <CreationPreview type="chatbot" data={...} />        (from viewer pages)
interface CreationPreviewByCreation {
  creation: AppCreation;
  compact?: boolean;
  type?: never;
  data?: never;
}

interface CreationPreviewByTypeData {
  type: string;
  data: unknown;
  creation?: never;
  compact?: boolean;
}

type CreationPreviewProps = CreationPreviewByCreation | CreationPreviewByTypeData;

export function CreationPreview({ creation, compact, type: typeProp, data: dataProp }: CreationPreviewProps) {
  // Resolve type and data from either interface
  let resolvedType: string;
  let resolvedData: unknown;
  let creationId: string = 'preview';

  if (creation) {
    creationId = creation.id;
    let parsedData: unknown;
    try {
      parsedData = JSON.parse(creation.content);
    } catch {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground text-sm p-4">
          Unable to preview this creation.
        </div>
      );
    }
    const parsed = parsedData as { type: string; data: unknown };
    if (!parsed || !parsed.type) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground text-sm p-4">
          Invalid creation format.
        </div>
      );
    }
    resolvedType = parsed.type;
    resolvedData = parsed.data;
  } else {
    resolvedType = typeProp || '';
    resolvedData = dataProp;
  }

  if (!resolvedType) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm p-4">
        Invalid creation format.
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={`w-full h-full overflow-hidden ${compact ? 'pointer-events-none' : ''}`}>
        {resolvedType === 'app' && <AppRuntime data={resolvedData as any} />}
        {resolvedType === 'website' && <WebsiteRuntime data={resolvedData as any} />}
        {resolvedType === 'chatbot' && (
          <ChatbotRuntime
            key={creationId}
            data={resolvedData as any}
          />
        )}
        {resolvedType === 'image' && <ImageRuntime data={resolvedData as any} />}
        {resolvedType === 'game' && <GameRuntime2D data={resolvedData as any} />}
      </div>
    </ErrorBoundary>
  );
}

export default CreationPreview;
