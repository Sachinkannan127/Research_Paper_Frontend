import React from 'react';
import { BookOpen, ShieldCheck } from 'lucide-react';
import { SignIn } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import styles from './LoginPage.module.css';

export const LoginPage: React.FC = () => {
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
