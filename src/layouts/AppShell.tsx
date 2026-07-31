import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { MessageSquare, Link2, Settings } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { TopHeader } from '../components/layout/TopHeader';
import { ToastContainer, ToastItem } from '../components/common/Toast';
import { useAssistant } from '../state/AssistantContext';
import { useServerHealth } from '../hooks/useServerHealth';
import styles from './AppShell.module.css';

const mobileNavItems = [
  { to: '/workspace', label: 'Chat', icon: MessageSquare },
  { to: '/sources', label: 'Sources', icon: Link2 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export const AppShell: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const { error, setError } = useAssistant();
  const serverStatus = useServerHealth();
  const location = useLocation();

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, variant: ToastItem['variant'] = 'info') => {
    const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, variant }]);
  }, []);

  useEffect(() => {
    if (error) {
      addToast(`API Error: ${error}`, 'error');
      setError(null);
    }
  }, [error, addToast, setError]);

  useEffect(() => {
    if (serverStatus === 'offline' && location.pathname.startsWith('/workspace')) {
      addToast('Backend server is offline. Check Settings → Connection.', 'error');
    }
  }, [serverStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.shell}>
      <TopHeader
        serverStatus={serverStatus}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((c) => !c)}
      />

      <div className={styles.body}>
        <Sidebar collapsed={sidebarCollapsed} serverStatus={serverStatus} />

        <div className={styles.main}>
          <div className={styles.content}>
            <Outlet context={{ addToast }} />
          </div>

          <nav className={styles.mobileNav}>
            {mobileNavItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `${styles.mobileNavItem} ${isActive ? styles.mobileNavItemActive : ''}`
                }
              >
                <Icon size={20} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default AppShell;
