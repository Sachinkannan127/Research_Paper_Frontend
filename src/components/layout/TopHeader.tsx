import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Activity, RefreshCw, PanelLeftClose, PanelLeft, Sun, Moon } from 'lucide-react';
import { ServerStatus } from '../../hooks/useServerHealth';
import { useSettings } from '../../state/SettingsContext';
import styles from './TopHeader.module.css';

interface TopHeaderProps {
  serverStatus: ServerStatus;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  serverStatus,
  sidebarCollapsed,
  onToggleSidebar,
}) => {
  const { theme, toggleTheme } = useSettings();
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          className={styles.toggleBtn}
          onClick={onToggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>

        <Link to="/workspace" className={styles.logoGroup}>
          <div className={styles.logoMark}>
            <BookOpen size={20} />
          </div>
          <div className={styles.logoText}>
            <h1>Research Paper Explorer</h1>
            <span className={styles.subtitle}>Retrieval Augmented Assistant</span>
          </div>
        </Link>
      </div>

      <div className={styles.right}>
        <button
          className={styles.toggleBtn}
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {serverStatus === 'checking' && (
          <span className={`${styles.statusBadge} ${styles.statusChecking}`}>
            <RefreshCw size={12} className={styles.spin} /> Checking Server…
          </span>
        )}
        {serverStatus === 'online' && (
          <span className={`${styles.statusBadge} ${styles.statusOnline}`}>
            <Activity size={12} /> Connected
          </span>
        )}
        {serverStatus === 'offline' && (
          <span className={`${styles.statusBadge} ${styles.statusOffline}`}>
            <Activity size={12} /> Disconnected
          </span>
        )}
      </div>
    </header>
  );
};

export default TopHeader;
