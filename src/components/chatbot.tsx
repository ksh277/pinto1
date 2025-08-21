
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Send } from 'lucide-react';
import { chat } from '@/ai/flows/chat-flow';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chat(input);
      const assistantMessage: Message = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: '죄송합니다. 답변을 생성하는 중에 오류가 발생했습니다.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="fixed bottom-6 right-6 z-50">
          <Button size="lg" className="rounded-full shadow-lg">
            <MessageCircle className="mr-2" />
            AI 문의하기
          </Button>
        </div>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>AI 챗봇 문의</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-grow my-4 pr-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8 border">
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div className="max-w-[85%] rounded-lg bg-muted p-3 text-sm shadow-sm">
                <p>안녕하세요! Pinto 굿즈 제작에 대해 궁금한 점이 있으신가요? 무엇이든 물어보세요!</p>
              </div>
            </div>
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 border">
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[85%] rounded-lg p-3 text-sm shadow-sm ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p>{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 border">
                    <AvatarFallback>나</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {isLoading && (
                <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 border">
                        <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div className="max-w-[85%] rounded-lg bg-muted p-3 text-sm shadow-sm">
                        <div className="flex items-center gap-2">
                           <div className="h-2 w-2 animate-pulse rounded-full bg-primary"></div>
                           <div className="h-2 w-2 animate-pulse rounded-full bg-primary delay-75"></div>
                           <div className="h-2 w-2 animate-pulse rounded-full bg-primary delay-150"></div>
                        </div>
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
        <div className="relative">
          <Input
            placeholder="메시지를 입력하세요..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !isLoading && handleSend()}
            disabled={isLoading}
            className="pr-12"
          />
          <Button
            type="submit"
            size="icon"
            onClick={handleSend}
            disabled={isLoading}
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">메시지 보내기</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
