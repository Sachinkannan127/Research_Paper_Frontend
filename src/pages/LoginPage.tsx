import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Key, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import styles from './LoginPage.module.css';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login for this prototype and redirect to workspace dashboard
    navigate('/workspace/dashboard');
  };

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
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Welcome Back</h2>
            <p>Access your research collections and query console.</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>Email Address</label>
              <div className={styles.inputWrapper}>
                <Mail size={16} className={styles.inputIcon} />
                <input
                  type="email"
                  id="email"
                  className={styles.input}
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.labelRow}>
                <label htmlFor="password" className={styles.label}>Password</label>
                <a href="#reset" className={styles.forgotLink} onClick={(e) => e.preventDefault()}>Forgot?</a>
              </div>
              <div className={styles.inputWrapper}>
                <Key size={16} className={styles.inputIcon} />
                <input
                  type="password"
                  id="password"
                  className={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.rememberRow}>
              <input type="checkbox" id="remember" className={styles.checkbox} />
              <label htmlFor="remember" className={styles.checkboxLabel}>Remember this session</label>
            </div>

            <button type="submit" className={styles.submitBtn}>
              Sign In <ArrowRight size={16} />
            </button>
          </form>

          <div className={styles.footer}>
            <span>New researcher? </span>
            <Link to="/register" className={styles.accentLink}>Create account</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
