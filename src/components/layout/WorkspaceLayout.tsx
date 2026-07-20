import React, { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import {
  BookOpen, MessageSquare, Database, UploadCloud,
  Settings, User, Activity, RefreshCw, PanelLeftClose, PanelLeft,
  Zap, BrainCircuit, Menu,
} from 'lucide-react';
import { useSettings } from '../../state/SettingsContext';
import { useServerHealth } from '../../hooks/useServerHealth';
import { CitationInspector } from '../inspector/CitationInspector';
import { useAssistant } from '../../state/AssistantContext';
import styles from './WorkspaceLayout.module.css';

const NAV_ITEMS = [
  { to: '/workspace/dashboard', label: 'Chat Console',    icon: MessageSquare },
  { to: '/workspace/database',  label: 'Vector Database', icon: Database },
  { to: '/workspace/upload',    label: 'Upload & Config', icon: UploadCloud },
  { to: '/workspace/settings',  label: 'Settings',        icon: Settings },
  { to: '/workspace/profile',   label: 'Profile',         icon: User },
];

export const WorkspaceLayout: React.FC = () => {
  const { model, activePdfName } = useSettings();
  const { activeChunk } = useAssistant();
  const serverStatus = useServerHealth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const statusLabel =
    serverStatus === 'online'   ? 'Server Connected' :
    serverStatus === 'offline'  ? 'Server Disconnected' : 'Checking…';
  const statusClass =
    serverStatus === 'online'   ? styles.statusOnline :
    serverStatus === 'offline'  ? styles.statusOffline : styles.statusChecking;
  const StatusIcon = serverStatus === 'checking' ? RefreshCw : Activity;

  return (
    <div className={styles.shell}>
      {/* Backdrop for mobile drawer */}
      {mobileSidebarOpen && (
        <div 
          className={styles.backdrop} 
          onClick={() => setMobileSidebarOpen(false)} 
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileSidebarOpen ? styles.mobileOpen : ''}`}>
        {/* Logo */}
        <Link to="/" className={styles.brand} onClick={() => setMobileSidebarOpen(false)}>
          <div className={styles.logoMark}><BookOpen size={18} /></div>
          {!collapsed && <span className={styles.brandLabel}>Paper Explorer</span>}
        </Link>

        {/* Active doc chip */}
        {!collapsed && (
          <div className={styles.docChip}>
            <span className={styles.docChipLabel}>Active Document</span>
            <span className={styles.docChipName}>{activePdfName}</span>
          </div>
        )}

        {/* Navigation Links */}
        <nav className={styles.nav}>
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navActive : ''}`
              }
              title={collapsed ? label : undefined}
              onClick={() => setMobileSidebarOpen(false)}
            >
              <Icon size={17} className={styles.navIcon} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer status */}
        <div className={styles.sidebarFooter}>
          <div className={styles.footerRow}>
            <span className={`${styles.statusDot} ${statusClass}`} />
            {!collapsed && <span className={styles.footerLabel}>
              {model === 'fast' ? <Zap size={12} /> : <BrainCircuit size={12} />}
              {model === 'fast' ? ' Fast Mode' : ' Smart Mode'}
            </span>}
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          className={styles.collapseBtn}
          onClick={() => setCollapsed(v => !v)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </aside>

      {/* ── Main Panel ── */}
      <div className={styles.mainPanel}>
        {/* Top Header */}
        <header className={styles.topHeader}>
          <div className={styles.headerLeft}>
            <button 
              className={styles.hamburgerBtn}
              onClick={() => setMobileSidebarOpen(true)}
              title="Open Menu"
            >
              <Menu size={20} />
            </button>
            <span className={styles.headerRoute}>Research Paper Assistant</span>
          </div>
          <div className={styles.headerRight}>
            <span className={`${styles.statusPill} ${statusClass}`}>
              <StatusIcon size={12} className={serverStatus === 'checking' ? styles.spin : ''} />
              {statusLabel}
            </span>
          </div>
        </header>

        {/* Page Content + Inspector */}
        <div className={styles.contentArea}>
          <main className={styles.pageArea}>
            <Outlet />
          </main>

          {/* Citation Inspector drawer */}
          <div className={`${styles.inspectorPanel} ${activeChunk ? styles.inspectorOpen : ''}`}>
            <CitationInspector />
          </div>
        </div>
      </div>
    </div>
  );
};


export default WorkspaceLayout;
