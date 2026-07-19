import React, { createContext, useContext, useState, useEffect } from 'react';

export interface RetrievedChunk {
  text: string;
  page: number | null;
  source: string | null;
  score: number;
}

export interface PipelineStep {
  name: string;
  label: string;
  status: 'pending' | 'active' | 'done' | 'cached' | 'failed';
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  modelName?: string;
  retryAttempts?: number;
  retrievedChunks?: RetrievedChunk[];
  isStreaming?: boolean;
  pipelineSteps?: PipelineStep[];
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
}

interface AssistantContextType {
  sessions: ChatSession[];
  activeSessionId: string | null;
  messages: Message[];
  isLoading: boolean;
  activeChunk: RetrievedChunk | null;
  error: string | null;
  setIsLoading: (val: boolean) => void;
  setActiveChunk: (chunk: RetrievedChunk | null) => void;
  setError: (err: string | null) => void;
  createSession: (title?: string) => string;
  deleteSession: (id: string) => void;
  renameSession: (id: string, title: string) => void;
  setActiveSessionId: (id: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => string;
  updateMessageContent: (id: string, content: string, extra?: Partial<Omit<Message, 'id' | 'content' | 'timestamp'>>) => void;
  clearChat: () => void;
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

export const AssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('assistant_sessions');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    const saved = localStorage.getItem('assistant_active_session_id');
    return saved || null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [activeChunk, setActiveChunk] = useState<RetrievedChunk | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Proactive initialization of first session if none exists
  useEffect(() => {
    if (sessions.length === 0) {
      const defaultId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11);
      const newSession: ChatSession = {
        id: defaultId,
        title: 'New Conversation',
        messages: [],
        timestamp: Date.now(),
      };
      setSessions([newSession]);
      setActiveSessionId(defaultId);
    } else if (!activeSessionId) {
      setActiveSessionId(sessions[0].id);
    }
  }, [sessions, activeSessionId]);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('assistant_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem('assistant_active_session_id', activeSessionId);
    } else {
      localStorage.removeItem('assistant_active_session_id');
    }
  }, [activeSessionId]);

  const createSession = (title = 'New Conversation') => {
    const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11);
    const newSession: ChatSession = {
      id,
      title,
      messages: [],
      timestamp: Date.now(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(id);
    return id;
  };

  const deleteSession = (id: string) => {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      // Auto-create replacement if we delete the last remaining session
      if (filtered.length === 0) {
        const replacementId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11);
        const replacement: ChatSession = {
          id: replacementId,
          title: 'New Conversation',
          messages: [],
          timestamp: Date.now(),
        };
        setActiveSessionId(replacementId);
        return [replacement];
      }
      // If we deleted the active one, shift active to the first remaining session
      if (activeSessionId === id && filtered.length > 0) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  const renameSession = (id: string, title: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title } : s))
    );
  };

  const addMessage = (msg: Omit<Message, 'id' | 'timestamp'>) => {
    const messageId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11);
    const newMessage: Message = {
      ...msg,
      id: messageId,
      timestamp: Date.now(),
    };

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          // If the session has no messages or is titled "New Conversation", auto-title it based on first user query
          let updatedTitle = s.title;
          if (s.messages.length === 0 && msg.role === 'user') {
            updatedTitle = msg.content.length > 25 ? msg.content.substring(0, 22) + '...' : msg.content;
          }
          return {
            ...s,
            title: updatedTitle,
            messages: [...s.messages, newMessage],
          };
        }
        return s;
      })
    );
    return messageId;
  };

  const updateMessageContent = (
    messageId: string,
    content: string,
    extra?: Partial<Omit<Message, 'id' | 'content' | 'timestamp'>>
  ) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          const updatedMessages = s.messages.map((m) =>
            m.id === messageId ? { ...m, content, ...extra } : m
          );
          return { ...s, messages: updatedMessages };
        }
        return s;
      })
    );
  };

  const clearChat = () => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId ? { ...s, messages: [] } : s
      )
    );
    setActiveChunk(null);
    setError(null);
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;
  const messages = activeSession ? activeSession.messages : [];

  return (
    <AssistantContext.Provider
      value={{
        sessions,
        activeSessionId,
        messages,
        isLoading,
        activeChunk,
        error,
        setIsLoading,
        setActiveChunk,
        setError,
        createSession,
        deleteSession,
        renameSession,
        setActiveSessionId,
        addMessage,
        updateMessageContent,
        clearChat,
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
};

export const useAssistant = () => {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return context;
};

