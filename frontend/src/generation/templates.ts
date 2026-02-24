import type { GameData } from './types';
import { getGameTemplate } from './gameTemplates';
import type { GameKind } from './detectGameKind';

export type CreationType = 'app' | 'website' | 'chatbot' | 'image' | 'game';

export interface GenerateOptions {
  gameKindOverride?: GameKind;
}

export async function generateFromPrompt(
  prompt: string,
  type: CreationType,
  options?: GenerateOptions
): Promise<any> {
  // Simulate generation delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  switch (type) {
    case 'app':
      return generateApp(prompt);
    case 'website':
      return generateWebsite(prompt);
    case 'chatbot':
      return generateChatbot(prompt);
    case 'image':
      return generateImage(prompt);
    case 'game':
      return generateGame(prompt, options?.gameKindOverride);
    default:
      throw new Error('Unknown creation type');
  }
}

function generateApp(prompt: string) {
  const keywords = prompt.toLowerCase();
  
  // Detect calculator intent
  const isCalculator = keywords.includes('calculator') || keywords.includes('calc');
  
  // Detect scientific calculator intent
  const isScientific = isCalculator && (
    keywords.includes('scientific') ||
    keywords.includes('trig') ||
    keywords.includes('sin') ||
    keywords.includes('cos') ||
    keywords.includes('tan') ||
    keywords.includes('log') ||
    keywords.includes('ln') ||
    keywords.includes('function')
  );
  
  if (isCalculator) {
    return {
      appKind: 'calculator',
      mode: isScientific ? 'scientific' : 'basic',
      title: isScientific ? 'Scientific Calculator' : 'Calculator',
    };
  }
  
  // Existing task-list logic
  const isTodo = keywords.includes('todo') || keywords.includes('task');
  const isNote = keywords.includes('note');

  return {
    appKind: 'task-list',
    title: isTodo ? 'Task Manager' : isNote ? 'Notes App' : 'My App',
    tasks: [
      { text: 'Complete project setup', completed: false },
      { text: 'Design user interface', completed: true },
      { text: 'Implement core features', completed: false },
      { text: 'Test and deploy', completed: false },
    ],
    actions: ['Add New Item', 'Clear Completed'],
  };
}

function generateWebsite(prompt: string) {
  const keywords = prompt.toLowerCase();
  const isPortfolio = keywords.includes('portfolio');
  const isBusiness = keywords.includes('business') || keywords.includes('company');

  return {
    pages: [
      {
        title: 'Home',
        content: isPortfolio
          ? 'Welcome to my portfolio. I create beautiful digital experiences.'
          : isBusiness
            ? 'Welcome to our company. We deliver excellence in every project.'
            : 'Welcome to our website. Discover what we have to offer.',
        image: '🏠 Hero Image',
      },
      {
        title: 'About',
        content: isPortfolio
          ? 'I am a creative professional with years of experience in design and development.'
          : 'We are a team of dedicated professionals committed to delivering quality results.',
        image: '👥 Team Photo',
      },
      {
        title: 'Contact',
        content: 'Get in touch with us. We would love to hear from you and discuss your project.',
        image: '📧 Contact Form',
      },
    ],
  };
}

function generateChatbot(prompt: string) {
  const keywords = prompt.toLowerCase();
  const isSupport = keywords.includes('support') || keywords.includes('help');
  const isSales = keywords.includes('sales') || keywords.includes('product');

  return {
    name: isSupport ? 'Support Assistant' : isSales ? 'Sales Bot' : 'Chat Assistant',
    greeting: isSupport
      ? 'Hello! How can I help you today?'
      : isSales
        ? 'Hi! Looking for the perfect product?'
        : 'Welcome! I am here to assist you.',
    responses: isSupport
      ? [
          'I can help you with that issue.',
          'Let me look into that for you.',
          'Have you tried restarting the application?',
        ]
      : isSales
        ? [
            'We have great options for you!',
            'That product is currently on sale.',
            'Would you like to see more details?',
          ]
        : [
            'That is a great question!',
            'I am here to help.',
            'Let me assist you with that.',
          ],
  };
}

function generateImage(prompt: string) {
  const keywords = prompt.toLowerCase();
  let emoji = '🎨';
  let description = 'Abstract Art';

  if (keywords.includes('landscape') || keywords.includes('nature')) {
    emoji = '🏞️';
    description = 'Beautiful Landscape';
  } else if (keywords.includes('portrait') || keywords.includes('person')) {
    emoji = '👤';
    description = 'Portrait';
  } else if (keywords.includes('abstract')) {
    emoji = '🎨';
    description = 'Abstract Composition';
  } else if (keywords.includes('animal')) {
    emoji = '🦁';
    description = 'Animal Portrait';
  }

  return {
    emoji,
    description,
    caption: `Generated based on: "${prompt}"`,
  };
}

function generateGame(prompt: string, overrideKind?: GameKind): GameData {
  return getGameTemplate(prompt, overrideKind);
}
