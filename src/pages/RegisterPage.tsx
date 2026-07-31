import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Key, Mail, User, ShieldCheck, ArrowRight } from 'lucide-react';
import styles from './RegisterPage.module.css';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate successful registration, redirect to login page
    navigate('/login');
  };

  // Simple visual validation
  const getPasswordStrength = () => {
    if (!password) return { label: 'Empty', color: '#64748b', pct: 0 };
    if (password.length < 6) return { label: 'Weak', color: '#EF4444', pct: 33 };
    if (password.length < 10) return { label: 'Medium', color: '#F59E0B', pct: 66 };
    return { label: 'Strong', color: '#10B981', pct: 100 };
  };

  const strength = getPasswordStrength();

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
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Join Explorer Workspace</h2>
            <p>Setup your account credentials to configure prompts and collections.</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="name" className={styles.label}>Full Name</label>
              <div className={styles.inputWrapper}>
                <User size={16} className={styles.inputIcon} />
                <input
                  type="text"
                  id="name"
                  className={styles.input}
                  placeholder="Dr. Evelyn Carter"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>Email Address</label>
              <div className={styles.inputWrapper}>
                <Mail size={16} className={styles.inputIcon} />
                <input
                  type="email"
                  id="email"
                  className={styles.input}
                  placeholder="evelyn@mit.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>Create Password</label>
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
              
              {/* Micro validation strength bar */}
              {password && (
                <div className={styles.strengthRow}>
                  <span className={styles.strengthText}>Security: <strong style={{ color: strength.color }}>{strength.label}</strong></span>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill} 
                      style={{ width: `${strength.pct}%`, backgroundColor: strength.color }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className={styles.termsAgreement}>
              <input type="checkbox" id="terms" className={styles.checkbox} required />
              <label htmlFor="terms" className={styles.checkboxLabel}>
                I agree to the academic terms of data use and local ingestion privacy.
              </label>
            </div>

            <button type="submit" className={styles.submitBtn}>
              Create Account <ArrowRight size={16} />
            </button>
          </form>

          <div className={styles.footer}>
            <span>Already have an account? </span>
            <Link to="/login" className={styles.accentLink}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
