import React, { useState } from 'react';
import { SlidersHorizontal, Key, ToggleRight, ToggleLeft, Laptop } from 'lucide-react';
import { useSettings } from '../state/SettingsContext';
import { usePWA } from '../state/PWAContext';
import styles from './SettingsPage.module.css';

export const SettingsPage: React.FC = () => {
  const { model, setModel, useStream, setUseStream, voiceAutoplay, setVoiceAutoplay, theme, toggleTheme } = useSettings();
  const [topK, setTopK] = useState(3);
  const [autoIngest, setAutoIngest] = useState(true);
  const [telemetry, setTelemetry] = useState(true);
  const [geminiKey, setGeminiKey] = useState('');
  const [mistralKey, setMistralKey] = useState('');

  const { isOffline, isInstallable, isStandalone, installApp } = usePWA();

  const handleCheckForUpdates = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        if (registrations.length === 0) {
          alert('Browser Client Mode: No service worker registered.');
          return;
        }
        for (let registration of registrations) {
          registration.update().then(() => {
            alert('Service Worker update check complete! If a new version was found, a prompt will appear.');
          }).catch(err => {
            console.error('Update check failed:', err);
          });
        }
      });
    } else {
      alert('Service Worker updates not supported in this browser.');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Settings</h2>
        <p className={styles.pageSub}>Fine-tune retrieval, model, and interface preferences.</p>
      </div>

      {/* RAG Controls */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <SlidersHorizontal size={16} className={styles.sectionIcon} />
          <h3>RAG Retrieval Controls</h3>
        </div>

        <div className={styles.settingRow}>
          <div className={styles.settingMeta}>
            <span className={styles.settingLabel}>Top-K Matches</span>
            <span className={styles.settingDesc}>Number of vector chunks retrieved per query.</span>
          </div>
          <div className={styles.sliderGroup}>
            <span className={styles.sliderVal}>{topK}</span>
            <input
              type="range" min={1} max={10} value={topK}
              onChange={e => setTopK(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
        </div>

        <div className={styles.settingRow}>
          <div className={styles.settingMeta}>
            <span className={styles.settingLabel}>Active LLM Model</span>
            <span className={styles.settingDesc}>Choose between Mistral (fast) and Gemini 2.5 (smart).</span>
          </div>
          <div className={styles.modelToggle}>
            <button
              className={`${styles.toggleBtn} ${model === 'fast' ? styles.toggleActive : ''}`}
              onClick={() => setModel('fast')}
            >⚡ Fast</button>
            <button
              className={`${styles.toggleBtn} ${model === 'smart' ? styles.toggleActiveSmart : ''}`}
              onClick={() => setModel('smart')}
            >🧠 Smart</button>
          </div>
        </div>

        <div className={styles.settingRow}>
          <div className={styles.settingMeta}>
            <span className={styles.settingLabel}>Streaming Mode</span>
            <span className={styles.settingDesc}>Token-by-token streaming via Server-Sent Events.</span>
          </div>
          <button
            className={styles.toggleSwitch}
            onClick={() => setUseStream(!useStream)}
            aria-label="Toggle streaming"
          >
            {useStream
              ? <ToggleRight size={32} className={styles.toggleOn} />
              : <ToggleLeft size={32} className={styles.toggleOff} />}
          </button>
        </div>
      </section>

      {/* API Keys */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <Key size={16} className={styles.sectionIcon} />
          <h3>API Keys</h3>
        </div>

        <div className={styles.keyInput}>
          <label className={styles.keyLabel}>Gemini API Key</label>
          <input
            type="password"
            className={styles.keyField}
            placeholder="AIza…"
            value={geminiKey}
            onChange={e => setGeminiKey(e.target.value)}
          />
        </div>

        <div className={styles.keyInput}>
          <label className={styles.keyLabel}>Mistral API Key</label>
          <input
            type="password"
            className={styles.keyField}
            placeholder="Mistral key..."
            value={mistralKey}
            onChange={e => setMistralKey(e.target.value)}
          />
        </div>
      </section>

      {/* Interface Toggles */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <ToggleRight size={16} className={styles.sectionIcon} />
          <h3>Interface Preferences</h3>
        </div>

        <div className={styles.settingRow}>
          <div className={styles.settingMeta}>
            <span className={styles.settingLabel}>Dark Mode Theme</span>
            <span className={styles.settingDesc}>Toggle between dark and light themes for the workspace.</span>
          </div>
          <button className={styles.toggleSwitch} onClick={toggleTheme} aria-label="Toggle dark mode">
            {theme === 'dark'
              ? <ToggleRight size={32} className={styles.toggleOn} />
              : <ToggleLeft size={32} className={styles.toggleOff} />}
          </button>
        </div>

        {[
          { label: 'Auto-Ingest on Drop', desc: 'Automatically ingest dropped PDFs into vector store.', val: autoIngest, set: setAutoIngest },
          { label: 'Voice Response Autoplay', desc: 'Automatically read aloud synthesized responses.', val: voiceAutoplay, set: setVoiceAutoplay },
          { label: 'Usage Telemetry', desc: 'Log anonymised query metrics for performance insight.', val: telemetry, set: setTelemetry },
        ].map(({ label, desc, val, set }) => (
          <div key={label} className={styles.settingRow}>
            <div className={styles.settingMeta}>
              <span className={styles.settingLabel}>{label}</span>
              <span className={styles.settingDesc}>{desc}</span>
            </div>
            <button className={styles.toggleSwitch} onClick={() => set(!val)} aria-label={label}>
              {val
                ? <ToggleRight size={32} className={styles.toggleOn} />
                : <ToggleLeft size={32} className={styles.toggleOff} />}
            </button>
          </div>
        ))}
      </section>

      {/* App Integration & PWA status section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <Laptop size={16} className={styles.sectionIcon} />
          <h3>App Status & Integration</h3>
        </div>

        <div className={styles.settingRow}>
          <div className={styles.settingMeta}>
            <span className={styles.settingLabel}>Network Connectivity</span>
            <span className={styles.settingDesc}>
              {isOffline 
                ? 'Currently offline. Relying on local cached sessions and offline index.' 
                : 'Online connection active. Able to access remote AI models and full vector stores.'}
            </span>
          </div>
          <span className={`${styles.statusBadge} ${isOffline ? styles.offlineBadge : styles.onlineBadge}`}>
            {isOffline ? 'Offline' : 'Connected'}
          </span>
        </div>

        <div className={styles.settingRow}>
          <div className={styles.settingMeta}>
            <span className={styles.settingLabel}>Desktop App Standalone</span>
            <span className={styles.settingDesc}>
              {isStandalone 
                ? 'Running inside a native app shell. Titlebars, safe regions, and gestures are optimized.' 
                : isInstallable 
                  ? 'Add Research Explorer to your home screen or system dock for offline integration.' 
                  : 'Installed or running in unsupported PWA browser client.'}
            </span>
          </div>
          {isInstallable && (
            <button className={styles.installBtn} onClick={installApp}>
              Install App
            </button>
          )}
          {!isInstallable && (
            <span className={styles.installedLabel}>
              {isStandalone ? 'Standalone Shell' : 'Browser Tab'}
            </span>
          )}
        </div>

        <div className={styles.settingRow}>
          <div className={styles.settingMeta}>
            <span className={styles.settingLabel}>Application Cache Updates</span>
            <span className={styles.settingDesc}>
              Force reload resources from deployment server.
            </span>
          </div>
          <button className={styles.checkUpdateBtn} onClick={handleCheckForUpdates}>
            Check Updates
          </button>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;
