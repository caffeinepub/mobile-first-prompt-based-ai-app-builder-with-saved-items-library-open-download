import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send } from 'lucide-react';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ResponseEntry {
  trigger: string;
  response: string;
}

interface ChatbotData {
  botName?: string;
  greeting?: string;
  responses?: ResponseEntry[];
  fallback?: string;
}

interface ChatbotRuntimeProps {
  data: ChatbotData;
}

export default function ChatbotRuntime({ data }: ChatbotRuntimeProps) {
  const botName = data?.botName || 'Bot';
  const greeting = data?.greeting || 'Hello! How can I help you?';
  const responses: ResponseEntry[] = Array.isArray(data?.responses) ? data.responses : [];
  const fallback = (data?.fallback && data.fallback.trim()) ? data.fallback : "I'm not sure how to answer that. Could you rephrase your question?";

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'greeting-0',
      text: greeting,
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset messages when the chatbot data changes (new bot generated)
  const greetingRef = useRef(greeting);
  useEffect(() => {
    if (greetingRef.current !== greeting) {
      greetingRef.current = greeting;
      setMessages([
        {
          id: 'greeting-' + Date.now(),
          text: greeting,
          isUser: false,
          timestamp: new Date(),
        },
      ]);
      setInputText('');
      setIsTyping(false);
    }
  }, [greeting]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const getBotResponse = useCallback(
    (userInput: string): string => {
      const lower = userInput.toLowerCase().trim();
      if (!lower) return fallback;
      if (!responses || responses.length === 0) return fallback;

      for (const entry of responses) {
        if (!entry || !entry.trigger) continue;
        const triggerStr = String(entry.trigger).toLowerCase();
        // Split on commas and/or whitespace
        const keywords = triggerStr.split(/[\s,]+/).filter(kw => kw.length > 0);
        if (keywords.some(kw => lower.includes(kw))) {
          const reply = entry.response ? String(entry.response).trim() : '';
          return reply || fallback;
        }
      }
      return fallback;
    },
    [responses, fallback]
  );

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      text,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    const delay = 700 + Math.random() * 500;
    setTimeout(() => {
      const botReply = getBotResponse(text);
      const botMsg: ChatMessage = {
        id: 'bot-' + (Date.now() + 1),
        text: botReply,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, delay);
  }, [inputText, isTyping, getBotResponse]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col bg-white" style={{ height: '100%', minHeight: 400 }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-gray-50 shrink-0">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
          {botName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{botName}</p>
          <p className="text-xs text-green-500">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                msg.isUser
                  ? 'bg-blue-500 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-3 py-2 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1 items-center h-5">
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-200 bg-white flex gap-2 shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={isTyping}
          className="flex-1 px-3 py-2 rounded-full border border-gray-300 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:border-blue-400 disabled:opacity-60"
        />
        <button
          onClick={handleSend}
          disabled={!inputText.trim() || isTyping}
          className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white disabled:opacity-40 hover:bg-blue-600 transition-colors shrink-0"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
