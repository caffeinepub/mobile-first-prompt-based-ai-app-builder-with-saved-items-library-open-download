import { CreationType } from '../../generation/templates';
import AppRuntime from '../runtime/AppRuntime';
import WebsiteRuntime from '../runtime/WebsiteRuntime';
import ChatbotRuntime from '../runtime/ChatbotRuntime';
import ImageRuntime from '../runtime/ImageRuntime';
import GameRuntime2D from '../runtime/GameRuntime2D';

interface CreationPreviewProps {
  type: CreationType;
  data: any;
}

export function CreationPreview({ type, data }: CreationPreviewProps) {
  switch (type) {
    case 'app':
      return <AppRuntime data={data} />;
    case 'website':
      return <WebsiteRuntime data={data} />;
    case 'chatbot':
      return <ChatbotRuntime data={data} />;
    case 'image':
      return <ImageRuntime data={data} />;
    case 'game':
      return <GameRuntime2D data={data} />;
    default:
      return <div className="text-muted-foreground">Unknown creation type</div>;
  }
}
