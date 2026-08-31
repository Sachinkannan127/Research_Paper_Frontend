import { useEffect, useRef, useState } from 'react';
import { useSettings } from '../state/SettingsContext';

export type ServerStatus = 'checking' | 'online' | 'offline';

const MIN_POLL_MS = 10_000;   // 10s when online
const MAX_POLL_MS = 60_000;   // 60s max when offline
const FETCH_TIMEOUT_MS = 45_000; // 45s — covers Render free-tier cold start (~30-50s)

export const useServerHealth = () => {
  const { apiBaseUrl } = useSettings();
  const [serverStatus, setServerStatus] = useState<ServerStatus>('checking');

  // Track current backoff delay between polls
  const pollDelayRef = useRef(MIN_POLL_MS);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    pollDelayRef.current = MIN_POLL_MS;

    const checkServerHealth = async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      try {
        console.log(`[HealthCheck] Fetching from: ${apiBaseUrl}/health`);
        const response = await fetch(`${apiBaseUrl}/health`, {
          signal: controller.signal,
          // Bypass service-worker cache for health checks
          cache: 'no-store',
        });
        const data = await response.json();
        const isOnline = data.status === 'Naa Nalla Irukken';
        console.log(`[HealthCheck] Server is ${isOnline ? 'online' : 'offline'}. Data:`, data);

        if (mountedRef.current) {
          setServerStatus(isOnline ? 'online' : 'offline');
          // Reset to fast polling once we get a response (even an unhealthy one)
          pollDelayRef.current = MIN_POLL_MS;
        }
      } catch (err) {
        if (!mountedRef.current) return;

        const isAbort = err instanceof DOMException && err.name === 'AbortError';
        if (isAbort) {
          // Timed out — server is likely cold-starting on Render; stay in 'checking' a bit longer
          console.warn(`[HealthCheck] Request timed out after ${FETCH_TIMEOUT_MS / 1000}s — server may be cold-starting.`);
        } else {
          console.error(`[HealthCheck] Failed to connect to ${apiBaseUrl}/health. Error:`, err);
        }

        setServerStatus('offline');

        // Exponential backoff: 10s → 20s → 40s → 60s (capped)
        pollDelayRef.current = Math.min(pollDelayRef.current * 2, MAX_POLL_MS);
      } finally {
        clearTimeout(timeout);
      }

      // Schedule next check using current (possibly backed-off) delay
      if (mountedRef.current) {
        timerRef.current = setTimeout(checkServerHealth, pollDelayRef.current);
      }
    };

    // Initial check immediately
    checkServerHealth();

    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [apiBaseUrl]);

  return serverStatus;
};
