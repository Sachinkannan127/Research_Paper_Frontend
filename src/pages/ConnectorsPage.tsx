import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSettings } from '../state/SettingsContext';
import { apiFetch } from '../utils/api';
import styles from './ConnectorsPage.module.css';

// Brand custom SVG icons
const GithubIcon: React.FC<React.SVGProps<SVGSVGElement> & { size?: number | string }> = ({ size = 20, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const GmailIcon: React.FC<React.SVGProps<SVGSVGElement> & { size?: number | string }> = ({ size = 20, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const SlackIcon: React.FC<React.SVGProps<SVGSVGElement> & { size?: number | string }> = ({ size = 20, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="currentColor"
    {...props}
  >
    <path d="M3.362 10.11c0 .926-.756 1.681-1.681 1.681S0 11.036 0 10.111.756 8.43 1.68 8.43h1.682zm.846 0c0-.924.756-1.68 1.681-1.68s1.681.756 1.681 1.68v4.21c0 .924-.756 1.68-1.68 1.68a1.685 1.685 0 0 1-1.682-1.68zM5.89 3.362c-.926 0-1.682-.756-1.682-1.681S4.964 0 5.89 0s1.68.756 1.68 1.68v1.682zm0 .846c.924 0 1.68.756 1.68 1.681S6.814 7.57 5.89 7.57H1.68C.757 7.57 0 6.814 0 5.89c0-.926.756-1.682 1.68-1.682zm6.749 1.682c0-.926.755-1.682 1.68-1.682S16 4.964 16 5.889s-.756 1.681-1.68 1.681h-1.681zm-.848 0c0 .924-.755 1.68-1.68 1.68A1.685 1.685 0 0 1 8.43 5.89V1.68C8.43.757 9.186 0 10.11 0c.926 0 1.681.756 1.681 1.68zm-1.681 6.748c.926 0 1.682.756 1.682 1.681S11.036 16 10.11 16s-1.681-.756-1.681-1.68v-1.682h1.68zm0-.847c-.924 0-1.68-.755-1.68-1.68s.756-1.681 1.68-1.681h4.21c.924 0 1.68.756 1.68 1.68 0 .926-.756 1.681-1.68 1.681z" />
  </svg>
);

const NotionIcon: React.FC<React.SVGProps<SVGSVGElement> & { size?: number | string }> = ({ size = 20, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="18" height="18" x="3" y="3" rx="4" />
    <path d="M10 7v10" />
    <path d="M14 7v10" />
    <path d="M10 7l4 10" />
  </svg>
);

const GoogleDriveIcon: React.FC<React.SVGProps<SVGSVGElement> & { size?: number | string }> = ({ size = 20, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 2H9L3 13.5l3 5.5h12l3-5.5L15 2z" />
    <path d="M9 13.5h12" />
    <path d="M15 2L9 13.5" />
    <path d="M3 13.5L9 2.5" />
  </svg>
);

const PostgresIcon: React.FC<React.SVGProps<SVGSVGElement> & { size?: number | string }> = ({ size = 20, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 4c-3.5 0-6 2.5-6 6 0 1.5.5 3 1.5 4-1 2-3 2.5-4.5 2.5 2.5.5 5 0 6-2 1.5.5 3 .5 4.5.5s3 0 4.5-.5c1 2 3.5 2.5 6 2-1.5 0-3.5-.5-4.5-2.5 1-1 1.5-2.5 1.5-4 0-3.5-2.5-6-6-6z" />
    <path d="M6 10c0-2 1.5-4.5 3-5M18 10c0-2-1.5-4.5-3-5" />
    <circle cx="9.5" cy="9.5" r="1" fill="currentColor" />
    <circle cx="14.5" cy="9.5" r="1" fill="currentColor" />
  </svg>
);

const GlobeIcon: React.FC<React.SVGProps<SVGSVGElement> & { size?: number | string }> = ({ size = 20, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const CalendarIcon: React.FC<React.SVGProps<SVGSVGElement> & { size?: number | string }> = ({ size = 20, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="18" height="18" x="3" y="4" rx="4" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <text x="12" y="18" fill="currentColor" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">31</text>
  </svg>
);

const ConfluenceIcon: React.FC<React.SVGProps<SVGSVGElement> & { size?: number | string }> = ({ size = 20, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12.03 16.63c.27-.27.42-.64.42-1.03v-4.8c0-.79-.65-1.44-1.44-1.44H6.2c-.39 0-.76.15-1.03.42l-2.73 2.73a1.44 1.44 0 0 0 0 2.03l2.73 2.73c.27.27.64.42 1.03.42h4.8c.79 0 1.44-.65 1.44-1.44v-.63zm9.53-5.43a1.44 1.44 0 0 0 0-2.03l-2.73-2.73a1.44 1.44 0 0 0-1.03-.42h-4.8c-.79 0-1.44.65-1.44 1.44v4.8c0 .79.65 1.44 1.44 1.44h4.8c.39 0 .76-.15 1.03-.42l2.73-2.73z" />
  </svg>
);

interface ConnectorCard {
  id: string;
  name: string;
  description: string;
  icon: React.FC<any>;
  iconColor: string;
  bgColor: string;
  comingSoon: boolean;
}

export const ConnectorsPage: React.FC = () => {
  const { apiBaseUrl } = useSettings();
  const navigate = useNavigate();

  // Settings to preserve
  const [systemPrompt, setSystemPrompt] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [similarityMetric, setSimilarityMetric] = useState('cosine');

  // Connection configurations
  const [githubToken, setGithubToken] = useState('');
  const [slackToken, setSlackToken] = useState('');
  const [slackTeamId, setSlackTeamId] = useState('');
  const [gmailId, setGmailId] = useState('');
  const [gmailSecret, setGmailSecret] = useState('');
  const [gmailRefresh, setGmailRefresh] = useState('');
  const [apifyToken, setApifyToken] = useState('');

  // UI States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch configurations
  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`${apiBaseUrl}/config`);
      const data = await res.json();

      // Preserve settings
      setSystemPrompt(data.system_prompt || '');
      setWelcomeMessage(data.welcome_message || '');
      setSimilarityMetric(data.similarity_metric || 'cosine');

      // Tokens/keys
      setGithubToken(data.github_token || '');
      setSlackToken(data.slack_token || '');
      setSlackTeamId(data.slack_team_id || '');
      setGmailId(data.gmail_client_id || '');
      setGmailSecret(data.gmail_client_secret || '');
      setGmailRefresh(data.gmail_refresh_token || '');
      setApifyToken(data.apify_token || '');

    } catch (err) {
      console.error('Failed to load connector configurations:', err);
      setErrorMsg('Failed to connect to backend server configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [apiBaseUrl]);

  // Check URL parameters for OAuth success/errors on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const successParam = params.get('success');
    const errorParam = params.get('error');

    if (successParam === 'github_connected') {
      setSuccessMsg('GitHub successfully connected via OAuth!');
      setTimeout(() => setSuccessMsg(null), 5000);
      fetchConfig();
      navigate('/workspace/connectors', { replace: true });
    } else if (errorParam) {
      if (errorParam === 'oauth_not_configured') {
        setErrorMsg('GitHub OAuth Client ID or Client Secret is not configured in backend .env');
      } else {
        setErrorMsg(`OAuth connection failed: ${decodeURIComponent(errorParam)}`);
      }
      setTimeout(() => setErrorMsg(null), 8000);
      navigate('/workspace/connectors', { replace: true });
    }
  }, [navigate]);

  // Launch GitHub OAuth redirect flow directly
  const handleConnectGithub = async () => {
    try {
      setSaving(true);
      setErrorMsg(null);
      const res = await apiFetch(`${apiBaseUrl}/config/github/authorize`, {
        method: 'POST'
      });
      if (!res.ok) {
        throw new Error('Failed to initiate GitHub connection');
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No redirect URL returned by server');
      }
    } catch (err: any) {
      console.error('Failed to connect GitHub OAuth:', err);
      setErrorMsg(err.message || 'Failed to start GitHub authentication');
      setSaving(false);
    }
  };

  // Disconnect GitHub
  const handleDisconnectGithub = async () => {
    if (!window.confirm('Are you sure you want to disconnect your GitHub integration?')) {
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);

      const res = await apiFetch(`${apiBaseUrl}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_prompt: systemPrompt,
          welcome_message: welcomeMessage,
          similarity_metric: similarityMetric,
          github_token: "", // clear token
          slack_token: slackToken || null,
          slack_team_id: slackTeamId || null,
          gmail_client_id: gmailId || null,
          gmail_client_secret: gmailSecret || null,
          gmail_refresh_token: gmailRefresh || null,
          apify_token: apifyToken || null
        })
      });

      if (!res.ok) {
        throw new Error(await res.text() || 'Failed to disconnect integration');
      }

      await fetchConfig();
      setSuccessMsg('GitHub integration disconnected successfully.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to disconnect integration.');
    } finally {
      setSaving(false);
    }
  };

  const connectors: ConnectorCard[] = [
    {
      id: 'github',
      name: 'GitHub',
      description: 'Access repositories, issues, and pull requests',
      icon: GithubIcon,
      iconColor: '#818cf8',
      bgColor: 'rgba(99, 102, 241, 0.12)',
      comingSoon: false
    },
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Connect your email for context-aware responses',
      icon: GmailIcon,
      iconColor: '#f87171',
      bgColor: 'rgba(239, 68, 68, 0.12)',
      comingSoon: true
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Search through your Slack workspace messages',
      icon: SlackIcon,
      iconColor: '#f472b6',
      bgColor: 'rgba(244, 114, 182, 0.12)',
      comingSoon: true
    },
    {
      id: 'notion',
      name: 'Notion',
      description: 'Query your Notion pages and databases',
      icon: NotionIcon,
      iconColor: '#e2e8f0',
      bgColor: 'rgba(255, 255, 255, 0.08)',
      comingSoon: true
    },
    {
      id: 'googledrive',
      name: 'Google Drive',
      description: 'Access documents, sheets, and presentations',
      icon: GoogleDriveIcon,
      iconColor: '#60a5fa',
      bgColor: 'rgba(96, 165, 250, 0.12)',
      comingSoon: true
    },
    {
      id: 'postgresql',
      name: 'PostgreSQL',
      description: 'Query your databases with natural language',
      icon: PostgresIcon,
      iconColor: '#38bdf8',
      bgColor: 'rgba(56, 189, 248, 0.12)',
      comingSoon: true
    },
    {
      id: 'websearch',
      name: 'Web Search',
      description: 'Search the web for real-time information',
      icon: GlobeIcon,
      iconColor: '#34d399',
      bgColor: 'rgba(52, 211, 153, 0.12)',
      comingSoon: true
    },
    {
      id: 'googlecalendar',
      name: 'Google Calendar',
      description: 'Check your schedule and manage events',
      icon: CalendarIcon,
      iconColor: '#fbbf24',
      bgColor: 'rgba(251, 191, 36, 0.12)',
      comingSoon: true
    },
    {
      id: 'confluence',
      name: 'Confluence',
      description: "Search your team's knowledge base",
      icon: ConfluenceIcon,
      iconColor: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.12)',
      comingSoon: true
    }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
        <RefreshCw className={styles.spin} size={32} />
        <span style={{ marginLeft: '12px' }}>Loading configurations...</span>
      </div>
    );
  }

  const isGithubConnected = githubToken && githubToken.trim().length > 0;

  return (
    <div className={styles.page}>
      {/* Page Header with navigation */}
      <div className={styles.headerRow}>
        <button className={styles.backButton} onClick={() => navigate(-1)} title="Back">
          <ArrowLeft size={20} />
        </button>
        <div className={styles.headerText}>
          <h2 className={styles.pageTitle}>Connectors</h2>
          <p className={styles.pageSub}>Connect your tools and data sources via MCP</p>
        </div>
      </div>

      {successMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px 16px', borderRadius: '12px', marginBottom: '24px', fontSize: '0.9rem' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px 16px', borderRadius: '12px', marginBottom: '24px', fontSize: '0.9rem' }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 3x3 Responsive Grid */}
      <div className={styles.grid}>
        {connectors.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.id} className={styles.card}>
              <div className={styles.cardContent}>
                {/* Circle Icon Container */}
                <div
                  className={styles.circleIcon}
                  style={{ backgroundColor: c.bgColor, color: c.iconColor, border: `1px solid rgba(${c.iconColor === '#e2e8f0' ? '255, 255, 255' : '99, 102, 241'}, 0.05)` }}
                >
                  <Icon size={24} />
                </div>
                <h3 className={styles.cardTitle}>{c.name}</h3>
                <p className={styles.cardDescription}>{c.description}</p>
              </div>

              {/* Action pill / buttons */}
              <div className={styles.actionContainer}>
                {c.comingSoon ? (
                  <span className={styles.comingSoonBadge}>
                    <span className={styles.statusDot} />
                    Coming Soon
                  </span>
                ) : (
                  <>
                    {isGithubConnected ? (
                      <div style={{ display: 'flex', gap: '8px', width: '100%', flexWrap: 'wrap' }}>
                        <span className={styles.connectedBadge}>
                          <span className={styles.connectedDot} />
                          Connected
                        </span>
                        <button
                          className={styles.disconnectBtn}
                          onClick={handleDisconnectGithub}
                          disabled={saving}
                        >
                          {saving ? 'Disconnecting...' : 'Disconnect'}
                        </button>
                      </div>
                    ) : (
                      <button className={styles.connectBtn} onClick={handleConnectGithub} disabled={saving}>
                        {saving ? 'Connecting...' : 'Connect'}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConnectorsPage;
