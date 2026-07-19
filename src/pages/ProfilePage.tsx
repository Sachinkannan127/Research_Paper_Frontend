import React from 'react';
import { User, Mail, ShieldCheck, Download, RefreshCw, BookOpen, MessageSquare, Clock } from 'lucide-react';
import styles from './ProfilePage.module.css';

const stats = [
  { icon: BookOpen,       label: 'Pages Ingested',  value: '483',   unit: 'pages' },
  { icon: MessageSquare,  label: 'Queries This Month', value: '1,280', unit: 'queries' },
  { icon: Clock,          label: 'Avg. Latency',    value: '0.34',  unit: 'sec' },
];

export const ProfilePage: React.FC = () => (
  <div className={styles.page}>
    <div className={styles.pageHeader}>
      <h2 className={styles.pageTitle}>Your Profile</h2>
      <p className={styles.pageSub}>Manage identity, key access, and usage metrics.</p>
    </div>

    {/* Identity Card */}
    <div className={styles.identityCard}>
      <div className={styles.avatarWrapper}>
        <div className={styles.avatar}>
          <User size={36} />
        </div>
        <div className={styles.avatarBadge}>
          <ShieldCheck size={12} />
        </div>
      </div>
      <div className={styles.identityInfo}>
        <h3 className={styles.displayName}>Dr. Evelyn Carter</h3>
        <div className={styles.emailRow}>
          <Mail size={14} className={styles.emailIcon} />
          <span>evelyn@university.edu</span>
        </div>
        <span className={styles.roleBadge}>Academic Premium</span>
      </div>
    </div>

    {/* Telemetry Stats Grid */}
    <div className={styles.statsGrid}>
      {stats.map(({ icon: Icon, label, value, unit }) => (
        <div key={label} className={styles.statCard}>
          <div className={styles.statIconWrapper}>
            <Icon size={18} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{value}</span>
            <span className={styles.statUnit}>{unit}</span>
          </div>
          <span className={styles.statLabel}>{label}</span>
        </div>
      ))}
    </div>

    {/* Actions */}
    <div className={styles.actionsSection}>
      <h4 className={styles.sectionTitle}>Account Actions</h4>
      <div className={styles.actionBtns}>
        <button className={styles.actionBtn}>
          <RefreshCw size={15} /> Change Password
        </button>
        <button className={styles.actionBtn}>
          <ShieldCheck size={15} /> Revoke API Token
        </button>
        <button className={`${styles.actionBtn} ${styles.actionBtnTeal}`}>
          <Download size={15} /> Export Usage Report
        </button>
      </div>
    </div>
  </div>
);

export default ProfilePage;
