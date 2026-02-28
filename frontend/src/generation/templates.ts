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

  const isCalculator = keywords.includes('calculator') || keywords.includes('calc');
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

  // Extract bot name from prompt
  let botName = 'Assistant';
  const nameMatch = prompt.match(/(?:named?|called?|name is)\s+([A-Z][a-z]+)/i);
  if (nameMatch) botName = nameMatch[1];
  else if (keywords.includes('customer service') || keywords.includes('support')) botName = 'Support Bot';
  else if (keywords.includes('sales')) botName = 'Sales Assistant';
  else if (keywords.includes('faq')) botName = 'FAQ Bot';
  else if (keywords.includes('help')) botName = 'Help Assistant';
  else if (keywords.includes('doctor') || keywords.includes('health') || keywords.includes('medical')) botName = 'Health Assistant';
  else if (keywords.includes('food') || keywords.includes('restaurant') || keywords.includes('menu')) botName = 'Food Assistant';
  else if (keywords.includes('travel') || keywords.includes('hotel') || keywords.includes('flight')) botName = 'Travel Assistant';

  const responses: Array<{ trigger: string; response: string }> = [];

  if (keywords.includes('customer service') || keywords.includes('support')) {
    responses.push(
      { trigger: 'hello,hi,hey,greetings', response: 'Hello! Welcome to our support center. How can I assist you today?' },
      { trigger: 'problem,issue,error,broken,not working', response: "I understand you're experiencing an issue. Could you please describe the problem in more detail so I can help you better?" },
      { trigger: 'refund,return,money back', response: 'I can help you with refunds and returns. Our policy allows returns within 30 days of purchase. Would you like me to initiate the process?' },
      { trigger: 'order,shipping,delivery,track', response: "I can help you track your order. Please provide your order number and I'll look it up for you." },
      { trigger: 'cancel,cancellation', response: 'I can help you with cancellations. Please note that orders can be cancelled within 24 hours of placement. Shall I proceed?' },
      { trigger: 'password,login,account,access', response: 'For account-related issues, I can help you reset your password or unlock your account. Which would you prefer?' },
      { trigger: 'price,cost,how much,pricing', response: 'I can provide pricing information. Could you specify which product or service you are asking about?' },
      { trigger: 'thank,thanks,bye,goodbye', response: 'Thank you for contacting us! Is there anything else I can help you with today?' }
    );
  } else if (keywords.includes('sales') || keywords.includes('product') || keywords.includes('buy') || keywords.includes('purchase')) {
    responses.push(
      { trigger: 'hello,hi,hey,greetings', response: "Hello! Welcome! I'm here to help you find the perfect product. What are you looking for today?" },
      { trigger: 'price,cost,how much,pricing', response: "Our products are competitively priced. Could you tell me which product you're interested in so I can give you the exact pricing?" },
      { trigger: 'discount,offer,deal,sale,promo', response: 'Great news! We currently have special offers available. Would you like me to share our latest deals with you?' },
      { trigger: 'feature,specification,spec,detail', response: "I'd be happy to walk you through the features. Which product would you like to know more about?" },
      { trigger: 'buy,purchase,order,checkout', response: 'Excellent choice! I can guide you through the purchase process. Would you like to proceed to checkout?' },
      { trigger: 'compare,difference,versus,vs', response: 'I can help you compare our products. Which items would you like to compare?' },
      { trigger: 'return,refund', response: 'We have a hassle-free return policy. Returns are accepted within 30 days of purchase with a full refund.' },
      { trigger: 'thank,thanks,bye,goodbye', response: 'Thank you for your interest! Feel free to reach out anytime. Have a great day!' }
    );
  } else if (keywords.includes('faq') || keywords.includes('question')) {
    responses.push(
      { trigger: 'hello,hi,hey,greetings', response: "Hi there! I'm here to answer your questions. What would you like to know?" },
      { trigger: 'how,what,when,where,why', response: "That's a great question! Let me help you find the answer. Could you be more specific about what you'd like to know?" },
      { trigger: 'start,begin,getting started,setup', response: 'Getting started is easy! First, create an account, then follow the setup wizard. Would you like step-by-step instructions?' },
      { trigger: 'feature,can,able,possible', response: 'We have many features available. Could you tell me which specific feature you are asking about?' },
      { trigger: 'problem,issue,not working,broken', response: "I'm sorry to hear you're having trouble. Let's troubleshoot this together. What exactly is happening?" },
      { trigger: 'contact,reach,email,phone,human', response: 'You can reach our team at support@example.com or call us at 1-800-EXAMPLE. Would you like more contact options?' },
      { trigger: 'thank,thanks,bye,goodbye', response: "You're welcome! Don't hesitate to ask if you have more questions. Goodbye!" }
    );
  } else {
    responses.push(
      { trigger: 'hello,hi,hey,greetings,howdy', response: `Hello! I'm ${botName}, your AI assistant. How can I help you today?` },
      { trigger: 'help,assist,support,what can you do', response: `I'm here to help! Just ask me anything and I'll do my best to assist you.` },
      { trigger: 'how are you,how do you do,how r u', response: "I'm doing great, thank you for asking! I'm ready to help you. What do you need?" },
      { trigger: 'name,who are you,what are you', response: `I'm ${botName}, an AI assistant created to help you. How can I assist you today?` },
      { trigger: 'thank,thanks,appreciate,great', response: "You're very welcome! It's my pleasure to help. Is there anything else you need?" },
      { trigger: 'bye,goodbye,see you,later,cya', response: 'Goodbye! It was great chatting with you. Feel free to come back anytime!' },
      { trigger: 'yes,yeah,sure,okay,ok,yep', response: "Great! Let's proceed. What would you like to do next?" },
      { trigger: 'no,nope,not really,nah', response: 'No problem at all! Is there something else I can help you with?' },
      { trigger: 'good,nice,awesome,excellent,perfect', response: "I'm glad to hear that! Is there anything else I can help you with?" },
      { trigger: 'bad,terrible,awful,horrible,worst', response: "I'm sorry to hear that. Let me see how I can make things better for you. What happened?" }
    );
  }

  // Ensure we always have at least one response entry
  if (responses.length === 0) {
    responses.push(
      { trigger: 'hello,hi,hey', response: `Hello! I'm ${botName}. How can I help you today?` },
      { trigger: 'help,what can you do', response: "I'm here to assist you. Feel free to ask me anything!" },
      { trigger: 'thank,thanks,bye,goodbye', response: "You're welcome! Have a great day!" }
    );
  }

  return {
    botName,
    greeting: `Hi! I'm ${botName}. How can I help you today?`,
    responses,
    fallback: "I'm not sure I understand that. Could you rephrase your question? I'm here to help!",
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
