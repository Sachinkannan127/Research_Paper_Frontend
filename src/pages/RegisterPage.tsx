import React from 'react';
import { BookOpen, ShieldCheck } from 'lucide-react';
import { SignUp } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import styles from './RegisterPage.module.css';

export const RegisterPage: React.FC = () => {
  return (
    <div className={styles.container}>
      {/* Left constellation brand panel */}
      <div className={styles.decorPanel}>
        <div className={styles.glowOverlay} />
        <div className={styles.constellationGrid} />
        <div className={styles.brandTitle}>
          <div className={styles.logoBadge}>
            <BookOpen size={28} />
          </div>
          <h1>Create Your Workspace</h1>
          <p>Join researchers worldwide querying papers semantically in real time.</p>
        </div>
        <div className={styles.telemetryTag}>
          <ShieldCheck size={14} className={styles.tealIcon} />
          <span>Local vector store and remote model acceleration verified.</span>
        </div>
      </div>

      {/* Right onboarding form panel */}
      <div className={styles.formPanel}>
        <SignUp 
          signInUrl="/login" 
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

export default RegisterPage;
