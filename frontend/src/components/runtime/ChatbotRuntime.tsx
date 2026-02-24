import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatbotData {
  title?: string;
  botName?: string;
  greeting?: string;
  responses?: Array<{ trigger: string; response: string }>;
  fallback?: string;
}

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

interface ChatbotRuntimeProps {
  data?: ChatbotData;
}

function getBotResponse(input: string, data?: ChatbotData): string {
  if (!data?.responses?.length) {
    return data?.fallback || "I'm here to help! Could you tell me more?";
  }
  const lower = input.toLowerCase();
  for (const { trigger, response } of data.responses) {
    if (lower.includes(trigger.toLowerCase())) return response;
  }
  return data.fallback || "That's interesting! Could you elaborate?";
}

export default function ChatbotRuntime({ data }: ChatbotRuntimeProps) {
  const botName = data?.botName || 'Assistant';
  const greeting = data?.greeting || `Hi! I'm ${botName}. How can I help you today?`;

  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'bot', text: greeting, timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isTyping) return;
    setInput('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));

    const botText = getBotResponse(text, data);
    const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'bot', text: botText, timestamp: new Date() };
    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-muted/20">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-border">
        <div className="w-9 h-9 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
          <Bot className="w-5 h-5 text-[var(--accent)]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{botName}</p>
          <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Online
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-muted border border-border text-muted-foreground'
            }`}>
              {msg.role === 'user'
                ? <User className="w-3.5 h-3.5" />
                : <Bot className="w-3.5 h-3.5" />
              }
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-[var(--accent)] text-white rounded-br-sm'
                  : 'bg-white border border-border text-foreground rounded-bl-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end gap-2">
            <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <div className="bg-white border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Row */}
      <div className="px-4 py-3 bg-white border-t border-border">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 h-10 px-4 rounded-xl border border-border bg-muted/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
            disabled={isTyping}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            size="sm"
            className="h-10 w-10 p-0 rounded-xl bg-[var(--accent)] hover:bg-[var(--primary)] text-white shadow-sm transition-all disabled:opacity-50"
          >
            {isTyping ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
