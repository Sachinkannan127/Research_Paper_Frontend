import React, { createContext, useContext, useState } from 'react';
import { apiFetch } from '../utils/api';
import { useBackendAuth } from './AuthContext';

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
  voiceAutoplay: boolean;
  setVoiceAutoplay: (value: boolean) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
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

  const [voiceAutoplay, setVoiceAutoplayBase] = useState<boolean>(() => {
    const saved = localStorage.getItem('assistant_voice_autoplay');
    return saved !== 'false';
  });

  const [theme, setThemeBase] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('assistant_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  const [activePdfName, setActivePdfName] = useState<string>('Research_paper.pdf');

  const rawApiUrl = import.meta.env.VITE_API_BASE_URL || `https://research-paper-backend-1ub4.onrender.com`;
  const apiBaseUrl = rawApiUrl.replace('localhost', '127.0.0.1').replace(/\/$/, '');

  const { backendAuthenticated } = useBackendAuth();

  const refreshConfig = async () => {
    if (!backendAuthenticated) return;
    try {
      const res = await apiFetch(`${apiBaseUrl}/config`);
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
  }, [apiBaseUrl, backendAuthenticated]);

  React.useEffect(() => {
    console.log("[Theme Context] useEffect trigger - Setting data-theme on html to:", theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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

  const setVoiceAutoplay = (value: boolean) => {
    localStorage.setItem('assistant_voice_autoplay', String(value));
    setVoiceAutoplayBase(value);
  };

  const toggleTheme = () => {
    console.log("[Theme Context] toggleTheme called. Current theme state:", theme);
    setThemeBase((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      console.log("[Theme Context] Setting next theme state to:", next);
      localStorage.setItem('assistant_theme', next);
      return next;
    });
  };

  const resetPreferences = () => {
    localStorage.removeItem('assistant_model');
    localStorage.removeItem('assistant_use_stream');
    localStorage.removeItem('assistant_voice_autoplay');
    localStorage.removeItem('assistant_theme');
    setModelBase('fast');
    setUseStreamBase(true);
    setVoiceAutoplayBase(true);
    setThemeBase('dark');
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
        voiceAutoplay,
        setVoiceAutoplay,
        theme,
        toggleTheme,
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
