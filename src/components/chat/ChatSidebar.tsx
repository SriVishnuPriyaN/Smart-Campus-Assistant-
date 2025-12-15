import { Plus, FileText, MessageSquare, Trash2, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Chat } from '@/types/chat';
import { cn } from '@/lib/utils';

interface ChatSidebarProps {
  chats: Record<string, Chat>;
  currentChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onPdfUpload: (file: File) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function ChatSidebar({
  chats,
  currentChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onPdfUpload,
  isOpen,
  onToggle,
}: ChatSidebarProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      onPdfUpload(file);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      onPdfUpload(file);
    }
  };

  const sortedChats = Object.values(chats).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={onToggle}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative z-50 md:z-0 h-full w-72 bg-sidebar border-r border-sidebar-border",
          "flex flex-col transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">Smart PDF Chat</h1>
          </div>

          <Button
            onClick={onNewChat}
            className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* PDF Upload Zone */}
        <div className="p-4 border-b border-sidebar-border">
          <label
            className="upload-zone flex flex-col items-center gap-2 text-center cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <FileText className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Drop PDF here or click to upload
            </span>
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-hidden">
          <div className="px-4 py-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Chat History
            </span>
          </div>
          <ScrollArea className="h-[calc(100%-2rem)] px-2">
            <div className="space-y-1 pb-4">
              {sortedChats.length === 0 ? (
                <div className="px-3 py-8 text-center text-muted-foreground text-sm">
                  No chats yet. Upload a PDF to get started!
                </div>
              ) : (
                sortedChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={cn(
                      "group sidebar-item",
                      currentChatId === chat.id && "sidebar-item-active"
                    )}
                    onClick={() => onSelectChat(chat.id)}
                  >
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1 truncate text-sm">{chat.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chat.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </aside>
    </>
  );
}
