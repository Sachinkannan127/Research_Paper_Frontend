import React from 'react';
import { usePWA } from '../../state/PWAContext';
import { WifiOff, RefreshCw } from 'lucide-react';
import styles from './PWANotification.module.css';

export const PWANotification: React.FC = () => {
  const { needRefresh, updateServiceWorker, closeUpdatePrompt } = usePWA();

  if (!needRefresh) return null;

  return (
    <div className={styles.updateToast} role="alert" aria-live="assertive">
      <div className={styles.toastHeader}>
        <div className={styles.iconWrapper}>
          <RefreshCw size={16} className={styles.updateIcon} />
        </div>
        <span className={styles.toastTitle}>System Update Available</span>
      </div>
      <p className={styles.toastBody}>
        A new optimized build of Research Explorer is ready. Update now to refresh and apply changes without losing your local session.
      </p>
      <div className={styles.toastActions}>
        <button className={styles.updateBtn} onClick={updateServiceWorker}>
          Update Now
        </button>
        <button className={styles.dismissBtn} onClick={closeUpdatePrompt}>
          Later
        </button>
      </div>
    </div>
  );
};

export const OfflineBanner: React.FC = () => {
  const { isOffline } = usePWA();

  if (!isOffline) return null;

  return (
    <div className={styles.offlineBanner} role="status">
      <div className={styles.offlineContent}>
        <WifiOff size={14} className={styles.offlineIcon} />
        <span>
          <strong>Offline Mode:</strong> Connected to local cache. You can view existing sessions, but search and live generation are limited.
        </span>
      </div>
    </div>
  );
};
