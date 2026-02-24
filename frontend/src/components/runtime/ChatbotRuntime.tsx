import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useState } from 'react';
import { Send } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

interface ChatbotRuntimeProps {
  data: any;
}

export default function ChatbotRuntime({ data }: ChatbotRuntimeProps) {
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
    { text: data.greeting || 'Hello! How can I help you today?', isUser: false },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { text: input, isUser: true }]);

    // Simple response logic based on keywords
    setTimeout(() => {
      const responses = data.responses || [
        "I understand. Let me help you with that.",
        "That's a great question!",
        "I'm here to assist you.",
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      setMessages((prev) => [...prev, { text: response, isUser: false }]);
    }, 500);

    setInput('');
  };

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader>
        <CardTitle>{data.name || 'Chatbot'}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 p-4">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
          />
          <Button onClick={handleSend} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
