import React, { createContext, useContext, useState } from 'react';

export type ModelType = 'fast' | 'smart';

interface SettingsContextType {
  model: ModelType;
  toggleModel: () => void;
  setModel: (model: ModelType) => void;
  useStream: boolean;
  setUseStream: (value: boolean) => void;
  toggleStream: () => void;
  apiBaseUrl: string;
  resetPreferences: () => void;
  clearLocalData: () => void;
  activePdfName: string;
  refreshConfig: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [model, setModelBase] = useState<ModelType>(() => {
    const saved = localStorage.getItem('assistant_model');
    return (saved === 'smart' ? 'smart' : 'fast') as ModelType;
  });

  const [useStream, setUseStreamBase] = useState<boolean>(() => {
    const saved = localStorage.getItem('assistant_use_stream');
    return saved !== 'false';
  });

  const [activePdfName, setActivePdfName] = useState<string>('Research_paper.pdf');

  const hostname = window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname;
  const rawApiUrl = import.meta.env.VITE_API_BASE_URL || `http://${hostname}:8000`;
  const apiBaseUrl = rawApiUrl.replace('localhost', '127.0.0.1').replace(/\/$/, '');

  const refreshConfig = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/config`);
      if (res.ok) {
        const data = await res.json();
        if (data.active_pdf_name) {
          setActivePdfName(data.active_pdf_name);
        }
      }
    } catch (e) {
      console.error("Failed to load active PDF name", e);
    }
  };

  React.useEffect(() => {
    refreshConfig();
  }, [apiBaseUrl]);

  const toggleModel = () => {
    setModelBase((prev) => {
      const next = prev === 'fast' ? 'smart' : 'fast';
      localStorage.setItem('assistant_model', next);
      return next;
    });
  };

  const setModel = (newModel: ModelType) => {
    localStorage.setItem('assistant_model', newModel);
    setModelBase(newModel);
  };

  const setUseStream = (value: boolean) => {
    localStorage.setItem('assistant_use_stream', String(value));
    setUseStreamBase(value);
  };

  const toggleStream = () => {
    setUseStream(!useStream);
  };

  const resetPreferences = () => {
    localStorage.removeItem('assistant_model');
    localStorage.removeItem('assistant_use_stream');
    setModelBase('fast');
    setUseStreamBase(true);
  };

  const clearLocalData = () => {
    localStorage.removeItem('assistant_messages');
    resetPreferences();
  };

  return (
    <SettingsContext.Provider
      value={{
        model,
        toggleModel,
        setModel,
        useStream,
        setUseStream,
        toggleStream,
        apiBaseUrl,
        resetPreferences,
        clearLocalData,
        activePdfName,
        refreshConfig,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
