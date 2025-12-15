import { useState, useCallback } from 'react';
import { Chat, Message, ChatState } from '@/types/chat';
import { extractTextFromPdf, prepareChunks, findBestAnswer, generateChatTitle } from '@/lib/pdf-utils';
import { toast } from '@/hooks/use-toast';

const generateId = () => Math.random().toString(36).substring(2, 15);

const createWelcomeMessage = (): Message => ({
  id: generateId(),
  role: 'assistant',
  content: "Hello! I'm your PDF assistant. Upload a PDF document using the sidebar, and I'll help you find information within it. Just ask me any question about the content!",
  timestamp: new Date(),
});

const createEmptyChat = (): Chat => ({
  id: generateId(),
  title: 'New Chat',
  messages: [createWelcomeMessage()],
  pdfText: '',
  pdfName: '',
  chunks: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});

export function useChatState() {
  const [state, setState] = useState<ChatState>({
    chats: {},
    currentChatId: null,
  });
  const [isTyping, setIsTyping] = useState(false);

  const currentChat = state.currentChatId ? state.chats[state.currentChatId] : null;

  const createNewChat = useCallback(() => {
    const newChat = createEmptyChat();
    setState((prev) => ({
      chats: { ...prev.chats, [newChat.id]: newChat },
      currentChatId: newChat.id,
    }));
  }, []);

  const selectChat = useCallback((chatId: string) => {
    setState((prev) => ({
      ...prev,
      currentChatId: chatId,
    }));
  }, []);

  const deleteChat = useCallback((chatId: string) => {
    setState((prev) => {
      const { [chatId]: deleted, ...remainingChats } = prev.chats;
      const newCurrentId = prev.currentChatId === chatId
        ? Object.keys(remainingChats)[0] || null
        : prev.currentChatId;
      
      return {
        chats: remainingChats,
        currentChatId: newCurrentId,
      };
    });
    
    toast({
      title: "Chat deleted",
      description: "The chat has been removed.",
    });
  }, []);

  const uploadPdf = useCallback(async (file: File) => {
    if (!state.currentChatId) {
      // Create new chat if none exists
      const newChat = createEmptyChat();
      newChat.title = generateChatTitle(file.name);
      newChat.pdfName = file.name;
      
      setState((prev) => ({
        chats: { ...prev.chats, [newChat.id]: newChat },
        currentChatId: newChat.id,
      }));

      try {
        const text = await extractTextFromPdf(file);
        const chunks = prepareChunks(text);

        setState((prev) => {
          const chat = prev.chats[newChat.id];
          if (!chat) return prev;

          const pdfMessage: Message = {
            id: generateId(),
            role: 'assistant',
            content: `I've loaded "${file.name}" successfully! It contains ${chunks.length} sections of content. Feel free to ask me anything about the document.`,
            timestamp: new Date(),
          };

          return {
            ...prev,
            chats: {
              ...prev.chats,
              [newChat.id]: {
                ...chat,
                pdfText: text,
                chunks,
                messages: [...chat.messages, pdfMessage],
                updatedAt: new Date(),
              },
            },
          };
        });

        toast({
          title: "PDF uploaded",
          description: `"${file.name}" is ready for questions.`,
        });
      } catch (error) {
        toast({
          title: "Error loading PDF",
          description: "Could not extract text from the PDF. Please try another file.",
          variant: "destructive",
        });
      }
    } else {
      // Update current chat
      const title = generateChatTitle(file.name);

      try {
        const text = await extractTextFromPdf(file);
        const chunks = prepareChunks(text);

        setState((prev) => {
          const chat = prev.chats[prev.currentChatId!];
          if (!chat) return prev;

          const pdfMessage: Message = {
            id: generateId(),
            role: 'assistant',
            content: `I've loaded "${file.name}" successfully! It contains ${chunks.length} sections of content. Feel free to ask me anything about the document.`,
            timestamp: new Date(),
          };

          return {
            ...prev,
            chats: {
              ...prev.chats,
              [prev.currentChatId!]: {
                ...chat,
                title,
                pdfName: file.name,
                pdfText: text,
                chunks,
                messages: [...chat.messages, pdfMessage],
                updatedAt: new Date(),
              },
            },
          };
        });

        toast({
          title: "PDF uploaded",
          description: `"${file.name}" is ready for questions.`,
        });
      } catch (error) {
        toast({
          title: "Error loading PDF",
          description: "Could not extract text from the PDF. Please try another file.",
          variant: "destructive",
        });
      }
    }
  }, [state.currentChatId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!state.currentChatId) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setState((prev) => {
      const chat = prev.chats[prev.currentChatId!];
      if (!chat) return prev;

      return {
        ...prev,
        chats: {
          ...prev.chats,
          [prev.currentChatId!]: {
            ...chat,
            messages: [...chat.messages, userMessage],
            updatedAt: new Date(),
          },
        },
      };
    });

    setIsTyping(true);

    // Simulate typing delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700));

    const chat = state.chats[state.currentChatId];
    const answer = findBestAnswer(content, chat?.chunks || []);

    const assistantMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: answer,
      timestamp: new Date(),
    };

    setState((prev) => {
      const chat = prev.chats[prev.currentChatId!];
      if (!chat) return prev;

      return {
        ...prev,
        chats: {
          ...prev.chats,
          [prev.currentChatId!]: {
            ...chat,
            messages: [...chat.messages, assistantMessage],
            updatedAt: new Date(),
          },
        },
      };
    });

    setIsTyping(false);
  }, [state.currentChatId, state.chats]);

  return {
    chats: state.chats,
    currentChatId: state.currentChatId,
    currentChat,
    isTyping,
    createNewChat,
    selectChat,
    deleteChat,
    uploadPdf,
    sendMessage,
  };
}
