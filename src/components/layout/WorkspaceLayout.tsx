import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen, MessageSquare, Database, UploadCloud,
  Settings, User, Activity, RefreshCw, PanelLeftClose, PanelLeft,
  Zap, BrainCircuit, Menu, Plus, Trash2, Edit3, Check, X,
  Sun, Moon,
} from 'lucide-react';
import { useSettings } from '../../state/SettingsContext';
import { useServerHealth } from '../../hooks/useServerHealth';
import { CitationInspector } from '../inspector/CitationInspector';
import { useAssistant } from '../../state/AssistantContext';
import styles from './WorkspaceLayout.module.css';

const NAV_ITEMS = [
  { to: '/workspace/dashboard', label: 'Chat Console', icon: MessageSquare },
  { to: '/workspace/database', label: 'Vector Database', icon: Database },
  { to: '/workspace/upload', label: 'Upload & Config', icon: UploadCloud },
  { to: '/workspace/settings', label: 'Settings', icon: Settings },
  { to: '/workspace/profile', label: 'Profile', icon: User },
];

export const WorkspaceLayout: React.FC = () => {
  const { model, activePdfName, theme, toggleTheme } = useSettings();
  const {
    activeChunk,
    sessions,
    activeSessionId,
    setActiveSessionId,
    createSession,
    deleteSession,
    renameSession,
  } = useAssistant();
  const serverStatus = useServerHealth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleStartRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(id);
    setEditingTitle(currentTitle);
  };

  const handleSaveRename = (id: string, e?: React.FormEvent) => {
    e?.preventDefault();
    if (editingTitle.trim()) {
      renameSession(id, editingTitle.trim());
    }
    setEditingSessionId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(null);
  };

  const handleNewChat = () => {
    createSession();
    navigate('/workspace/dashboard');
  };

  const handleSessionClick = (id: string) => {
    setActiveSessionId(id);
    navigate('/workspace/dashboard');
  };

  const statusLabel =
    serverStatus === 'online' ? 'Server Connected' :
      serverStatus === 'offline' ? 'Server Disconnected' : 'Checking…';
  const statusClass =
    serverStatus === 'online' ? styles.statusOnline :
      serverStatus === 'offline' ? styles.statusOffline : styles.statusChecking;
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

        {/* Conversations History */}
        <div className={styles.sessionsSection}>
          {!collapsed && (
            <div className={styles.sessionsHeader}>
              <span>Conversations</span>
              <button
                className={styles.newChatBtn}
                onClick={handleNewChat}
                title="New Chat Session"
              >
                <Plus size={12} />
                <span>New Chat</span>
              </button>
            </div>
          )}

          {collapsed && (
            <button
              className={styles.newChatBtnCollapsed}
              onClick={handleNewChat}
              title="New Chat Session"
            >
              <Plus size={14} />
            </button>
          )}

          <div className={styles.sessionList}>
            {sessions.map((s) => {
              const isActive = s.id === activeSessionId;
              const isEditing = s.id === editingSessionId;

              if (collapsed) {
                return (
                  <button
                    key={s.id}
                    className={`${styles.sessionItemCollapsed} ${isActive ? styles.sessionItemActive : ''}`}
                    onClick={() => handleSessionClick(s.id)}
                    title={s.title}
                  >
                    <MessageSquare size={14} />
                  </button>
                );
              }

              return (
                <div
                  key={s.id}
                  className={`${styles.sessionItem} ${isActive ? styles.sessionItemActive : ''}`}
                  onClick={() => handleSessionClick(s.id)}
                >
                  {isEditing ? (
                    <form
                      className={styles.renameForm}
                      onSubmit={(e) => handleSaveRename(s.id, e)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        className={styles.renameInput}
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        autoFocus
                      />
                      <button type="submit" className={styles.iconVerifyBtn} title="Save">
                        <Check size={11} />
                      </button>
                      <button type="button" className={styles.iconVerifyBtn} onClick={handleCancelRename} title="Cancel">
                        <X size={11} />
                      </button>
                    </form>
                  ) : (
                    <>
                      <div className={styles.sessionIconLabel}>
                        <MessageSquare size={13} className={styles.bubbleIcon} />
                        <span className={styles.sessionTitle}>{s.title}</span>
                      </div>

                      {isActive && (
                        <div className={styles.sessionActions}>
                          <button
                            className={styles.sessionActionBtn}
                            onClick={(e) => handleStartRename(s.id, s.title, e)}
                            title="Rename"
                          >
                            <Edit3 size={11} />
                          </button>
                          <button
                            className={styles.sessionActionBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSession(s.id);
                            }}
                            title="Delete"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

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
            <button
              className={styles.themeToggleBtn}
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
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
