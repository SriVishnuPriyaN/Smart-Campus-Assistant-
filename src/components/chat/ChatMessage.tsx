import { User, Bot } from 'lucide-react';
import { Message } from '@/types/chat';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: Message;
}

function renderMarkdown(text: string) {
  // Simple markdown renderer for our use case
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
          {trimmed.replace('## ', '')}
        </h2>
      );
    } else if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={key++} className="text-base font-medium text-foreground/90 mt-3 mb-1">
          {trimmed.replace('### ', '')}
        </h3>
      );
    } else if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote key={key++} className="border-l-2 border-primary/50 pl-3 py-1 my-2 text-muted-foreground italic">
          {trimmed.replace('> ', '')}
        </blockquote>
      );
    } else if (trimmed.startsWith('• ')) {
      elements.push(
        <div key={key++} className="flex gap-2 my-1">
          <span className="text-primary">•</span>
          <span>{renderInlineStyles(trimmed.replace('• ', ''))}</span>
        </div>
      );
    } else if (trimmed === '---') {
      elements.push(<hr key={key++} className="border-border/50 my-3" />);
    } else if (trimmed.startsWith('*') && trimmed.endsWith('*') && !trimmed.startsWith('**')) {
      elements.push(
        <p key={key++} className="text-xs text-muted-foreground mt-2 italic">
          {trimmed.replace(/^\*|\*$/g, '')}
        </p>
      );
    } else if (trimmed) {
      elements.push(
        <p key={key++} className="my-1">
          {renderInlineStyles(trimmed)}
        </p>
      );
    } else if (index > 0 && lines[index - 1].trim()) {
      elements.push(<div key={key++} className="h-2" />);
    }
  });

  return elements;
}

function renderInlineStyles(text: string): React.ReactNode {
  // Handle **bold** text
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        "flex gap-4 animate-fade-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser ? "bg-primary" : "bg-secondary"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-primary-foreground" />
        ) : (
          <Bot className="h-4 w-4 text-secondary-foreground" />
        )}
      </div>

      {/* Message Bubble */}
      <div
        className={cn(
          "max-w-[75%] md:max-w-[65%]",
          isUser ? "chat-bubble-user" : "chat-bubble-assistant"
        )}
      >
        <div className="text-sm leading-relaxed">
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            renderMarkdown(message.content)
          )}
        </div>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-4 animate-fade-in">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
        <Bot className="h-4 w-4 text-secondary-foreground" />
      </div>
      <div className="chat-bubble-assistant flex items-center gap-1 py-4">
        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-typing" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-typing" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-typing" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
