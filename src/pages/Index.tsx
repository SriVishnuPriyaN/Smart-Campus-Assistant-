import { useState } from 'react';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatArea } from '@/components/chat/ChatArea';
import { useChatState } from '@/hooks/useChatState';

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const {
    chats,
    currentChatId,
    currentChat,
    isTyping,
    createNewChat,
    selectChat,
    deleteChat,
    uploadPdf,
    sendMessage,
  } = useChatState();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <ChatSidebar
        chats={chats}
        currentChatId={currentChatId}
        onNewChat={createNewChat}
        onSelectChat={selectChat}
        onDeleteChat={deleteChat}
        onPdfUpload={uploadPdf}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <main className="flex-1 flex flex-col min-w-0">
        <ChatArea
          chat={currentChat}
          onSendMessage={sendMessage}
          isTyping={isTyping}
        />
      </main>
    </div>
  );
};

export default Index;
