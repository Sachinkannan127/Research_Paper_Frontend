import React, { useState, useEffect } from 'react';
import { BookOpen, ShieldCheck, AlertCircle } from 'lucide-react';
import { SignIn } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import styles from './LoginPage.module.css';

export const LoginPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedError = sessionStorage.getItem('backend_sync_error');
    if (storedError) {
      setError(storedError);
      sessionStorage.removeItem('backend_sync_error');
    }
  }, []);

  return (
    <div className={styles.container}>
      {/* Left decorative/constellation panel */}
      <div className={styles.decorPanel}>
        <div className={styles.glowOverlay} />
        <div className={styles.constellationGrid}>
          {/* Mock floating constellation points */}
          <div className={`${styles.node} ${styles.n1}`} />
          <div className={`${styles.node} ${styles.n2}`} />
          <div className={`${styles.node} ${styles.n3}`} />
          <div className={`${styles.node} ${styles.n4}`} />
        </div>
        <div className={styles.brandTitle}>
          <div className={styles.logoBadge}>
            <BookOpen size={28} />
          </div>
          <h1>Research Paper Explorer</h1>
          <p>The semantic gateway to your scientific and engineering PDF libraries.</p>
        </div>
        <div className={styles.telemetryTag}>
          <ShieldCheck size={14} className={styles.tealIcon} />
          <span>Secured with Advanced RAG Dual Model Fallbacks</span>
        </div>
      </div>

      {/* Right Form Card Panel */}
      <div className={styles.formPanel}>
        {error && (
          <div style={{
            margin: '0 24px 16px 24px',
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontFamily: 'sans-serif',
            maxWidth: '400px',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}
        <SignIn 
          signUpUrl="/register" 
          forceRedirectUrl="/workspace/dashboard"
          appearance={{
            baseTheme: dark,
            elements: {
              card: {
                boxShadow: 'none',
                backgroundColor: 'transparent',
              },
              formButtonPrimary: {
                backgroundColor: '#6366f1',
                '&:hover': {
                  backgroundColor: '#4f46e5',
                }
              },
              footerActionLink: {
                color: '#6366f1',
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default LoginPage;
