'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import OpenAI from 'openai';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    console.log('Submitting message:', input);
    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    console.log('Environment variables:', {
      hasApiKey: !!process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
      isClient: typeof window !== 'undefined'
    });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          date: new Date().toLocaleDateString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const completion = await response.json();
      
      console.log('API Response:', completion);
      const botResponse = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
      console.log('Bot Response:', botResponse);
      
      setMessages((prev) => [...prev, { role: 'assistant', content: botResponse }]);
    } catch (error: unknown) {
      console.error('Error calling OpenRouter API:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { status?: number; statusText?: string; data?: unknown } };
        console.error('API Error Response:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data
        });
      }
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, there was an error processing your request. Please try again later.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-background rounded-lg border overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="font-semibold">AI Assistant</h3>
        <p className="text-xs text-muted-foreground">Ask me anything about your ideas</p>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>How can I help you with your ideas today?</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div 
                key={index} 
                className={cn(
                  'flex gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div 
                  className={cn(
                    'max-w-[80%] rounded-lg px-4 py-2',
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary/50'
                  )}
                >
                  {message.content.split('\n').map((line, i) => (
                    <p key={i} className="whitespace-pre-wrap">{line}</p>
                  ))}
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
