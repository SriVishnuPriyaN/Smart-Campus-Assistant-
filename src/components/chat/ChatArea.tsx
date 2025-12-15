import { useRef, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage, TypingIndicator } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { EmptyState } from './EmptyState';
import { Chat } from '@/types/chat';

interface ChatAreaProps {
  chat: Chat | null;
  onSendMessage: (message: string) => void;
  isTyping: boolean;
}

export function ChatArea({ chat, onSendMessage, isTyping }: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat?.messages, isTyping]);

  if (!chat) {
    return <EmptyState />;
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-card/50">
        <div className="p-2 rounded-lg bg-primary/10">
          <FileText className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="font-medium text-foreground">{chat.title}</h2>
          {chat.pdfName && (
            <p className="text-xs text-muted-foreground">
              {chat.pdfName}
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-6 scrollbar-thin">
        <div className="max-w-3xl mx-auto space-y-6">
          {chat.messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isTyping && <TypingIndicator />}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="max-w-3xl mx-auto w-full">
        <ChatInput
          onSend={onSendMessage}
          disabled={!chat.pdfText}
          placeholder={
            chat.pdfText
              ? "Ask something about the PDF..."
              : "Upload a PDF to start chatting..."
          }
        />
      </div>
    </div>
  );
}
