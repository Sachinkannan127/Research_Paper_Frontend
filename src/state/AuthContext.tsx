import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth, useSession, useUser } from '@clerk/clerk-react';
import { setAccessToken, clearAccessToken } from '../utils/api';

interface AuthContextType {
  backendAuthenticated: boolean;
  isLoading: boolean;
  user: {
    clerk_id: string;
    email: string;
    name: string;
  } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, isLoaded, signOut } = useAuth();
  const { session } = useSession();
  const { user: clerkUser } = useUser();
  const [backendAuthenticated, setBackendAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthContextType['user']>(null);

  useEffect(() => {
    const syncWithBackend = async () => {
      if (!isLoaded) return;

      // Force sign-out on new browser session (e.g. new tab / window closed and reopened)
      const sessionKey = 'app_session_active';
      if (!sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, 'true');
        if (isSignedIn) {
          try {
            setIsLoading(true);
            if (signOut) {
              await signOut();
            }
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://research-paper-assistant-ylic.onrender.com';
            await fetch(`${apiBaseUrl}/api/auth/logout`, { method: 'POST' });
          } catch (err) {
            console.error("Error signing out for new session:", err);
          } finally {
            setIsLoading(false);
          }
          return;
        }
      }

      if (isSignedIn && session) {
        try {
          setIsLoading(true);
          const clerkToken = await session.getToken();
          if (!clerkToken) {
            throw new Error("Could not retrieve Clerk token");
          }

          const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://research-paper-assistant-ylic.onrender.com';
          const res = await fetch(`${apiBaseUrl}/api/auth/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              token: clerkToken,
              email: clerkUser?.primaryEmailAddress?.emailAddress || "",
              name: clerkUser?.fullName || clerkUser?.username || ""
            }),
          });

          if (!res.ok) {
            throw new Error("Backend verification failed");
          }

          const data = await res.json();
          setAccessToken(data.access_token);
          setUser(data.user);
          setBackendAuthenticated(true);
        } catch (err) {
          console.error("Error syncing with backend:", err);
          const errorMsg = err instanceof Error ? err.message : String(err);
          sessionStorage.setItem('backend_sync_error', `Backend sync failed: ${errorMsg}`);
          clearAccessToken();
          setUser(null);
          setBackendAuthenticated(false);
          if (signOut) {
            await signOut();
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        clearAccessToken();
        setUser(null);
        setBackendAuthenticated(false);
        setIsLoading(false);
      }
    };

    syncWithBackend();
  }, [isSignedIn, isLoaded, session, signOut]);

  return (
    <AuthContext.Provider
      value={{
        backendAuthenticated,
        isLoading: isLoading || !isLoaded,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useBackendAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useBackendAuth must be used within an AuthProvider');
  }
  return context;
};
