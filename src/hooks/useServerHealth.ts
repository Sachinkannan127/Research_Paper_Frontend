import { useEffect, useState } from 'react';
import { useSettings } from '../state/SettingsContext';

export type ServerStatus = 'checking' | 'online' | 'offline';

export const useServerHealth = (pollIntervalMs = 10000) => {
  const { apiBaseUrl } = useSettings();
  const [serverStatus, setServerStatus] = useState<ServerStatus>('checking');

  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        console.log(`[HealthCheck] Fetching from: ${apiBaseUrl}/health`);
        const response = await fetch(`${apiBaseUrl}/health`);
        const data = await response.json();
        const isOnline = data.status === 'Naa Nalla Irukken';
        console.log(`[HealthCheck] Server is ${isOnline ? 'online' : 'offline'}. Data:`, data);
        setServerStatus(isOnline ? 'online' : 'offline');
      } catch (err) {
        console.error(`[HealthCheck] Failed to connect to ${apiBaseUrl}/health. Error:`, err);
        setServerStatus('offline');
      }
    };

    checkServerHealth();
    const interval = setInterval(checkServerHealth, pollIntervalMs);
    return () => clearInterval(interval);
  }, [apiBaseUrl, pollIntervalMs]);

  return serverStatus;
};
