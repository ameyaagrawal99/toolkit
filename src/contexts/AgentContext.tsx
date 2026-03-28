import React, { createContext, useContext, useState, useCallback } from 'react';

const STORAGE_KEY = 'openai_api_key';

interface PendingParams {
  toolId: string;
  params: Record<string, any>;
}

interface AgentContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  pendingParams: PendingParams | null;
  triggerTool: (toolId: string, params: Record<string, any>) => void;
  consumeParams: () => void;
  isAgentOpen: boolean;
  setIsAgentOpen: (open: boolean) => void;
}

const AgentContext = createContext<AgentContextType | null>(null);

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState<string>(() => localStorage.getItem(STORAGE_KEY) ?? '');
  const [pendingParams, setPendingParams] = useState<PendingParams | null>(null);
  const [isAgentOpen, setIsAgentOpen] = useState(false);

  const setApiKey = useCallback((key: string) => {
    setApiKeyState(key);
    if (key) {
      localStorage.setItem(STORAGE_KEY, key);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const triggerTool = useCallback((toolId: string, params: Record<string, any>) => {
    setPendingParams({ toolId, params });
  }, []);

  const consumeParams = useCallback(() => {
    setPendingParams(null);
  }, []);

  return (
    <AgentContext.Provider value={{ apiKey, setApiKey, pendingParams, triggerTool, consumeParams, isAgentOpen, setIsAgentOpen }}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgentContext = () => {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error('useAgentContext must be used within AgentProvider');
  return ctx;
};
