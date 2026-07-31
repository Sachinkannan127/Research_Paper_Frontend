import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  MessageSquare,
  FileText,
  Link2,
  Settings,
  Zap,
  BrainCircuit,
} from 'lucide-react';
import { useSettings } from '../../state/SettingsContext';
import { ServerStatus } from '../../hooks/useServerHealth';
import styles from './Sidebar.module.css';

interface SidebarProps {
  collapsed: boolean;
  serverStatus: ServerStatus;
}

const navItems = [
  { to: '/workspace', label: 'Chat Workspace', icon: MessageSquare },
  { to: '/document', label: 'Document Info', icon: FileText },
  { to: '/sources', label: 'Sources', icon: Link2 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, serverStatus }) => {
  const { model } = useSettings();

  const statusLabel =
    serverStatus === 'online'
      ? 'Server Online'
      : serverStatus === 'offline'
        ? 'Server Offline'
        : 'Checking…';

  const statusClass =
    serverStatus === 'online'
      ? styles.statusOnline
      : serverStatus === 'offline'
        ? styles.statusOffline
        : styles.statusChecking;

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}>
      <div className={styles.documentChip}>
        <div className={styles.docLabel}>Active Document</div>
        <div className={styles.docName}>Research_paper.pdf</div>
      </div>

      <nav className={styles.nav}>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
            }
            title={label}
          >
            <Icon size={18} className={styles.navIcon} />
            <span className={styles.navLabel}>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.footerMeta}>
          <div className={styles.footerRow}>
            <span className={`${styles.statusDot} ${statusClass}`} />
            <span>{statusLabel}</span>
          </div>
          <div className={styles.footerRow}>
            {model === 'fast' ? <Zap size={14} /> : <BrainCircuit size={14} />}
            <span>{model === 'fast' ? 'Fast Mode' : 'Smart Mode'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
