import React, { useState } from 'react';
import { SlidersHorizontal, Key, ToggleRight, ToggleLeft } from 'lucide-react';
import { useSettings } from '../state/SettingsContext';
import styles from './SettingsPage.module.css';

export const SettingsPage: React.FC = () => {
  const { model, setModel, useStream, setUseStream, voiceAutoplay, setVoiceAutoplay } = useSettings();
  const [topK, setTopK] = useState(3);
  const [autoIngest, setAutoIngest] = useState(true);
  const [telemetry, setTelemetry] = useState(true);
  const [geminiKey, setGeminiKey] = useState('');
  const [groqKey, setGroqKey] = useState('');

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
            <span className={styles.settingDesc}>Choose between Groq Llama (fast) and Gemini 2.5 (smart).</span>
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
          <label className={styles.keyLabel}>Groq API Key</label>
          <input
            type="password"
            className={styles.keyField}
            placeholder="gsk_…"
            value={groqKey}
            onChange={e => setGroqKey(e.target.value)}
          />
        </div>
      </section>

      {/* Interface Toggles */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <ToggleRight size={16} className={styles.sectionIcon} />
          <h3>Interface Preferences</h3>
        </div>

        {[
          { label: 'Auto-Ingest on Drop',  desc: 'Automatically ingest dropped PDFs into vector store.', val: autoIngest, set: setAutoIngest },
          { label: 'Voice Response Autoplay', desc: 'Automatically read aloud synthesized responses.', val: voiceAutoplay, set: setVoiceAutoplay },
          { label: 'Usage Telemetry',      desc: 'Log anonymised query metrics for performance insight.', val: telemetry,   set: setTelemetry },
        ].map(({ label, desc, val, set }) => (
          <div key={label} className={styles.settingRow}>
            <div className={styles.settingMeta}>
              <span className={styles.settingLabel}>{label}</span>
              <span className={styles.settingDesc}>{desc}</span>
            </div>
            <button className={styles.toggleSwitch} onClick={() => set(!val)} aria-label={label}>
              {val
                ? <ToggleRight size={32} className={styles.toggleOn} />
                : <ToggleLeft  size={32} className={styles.toggleOff} />}
            </button>
          </div>
        ))}
      </section>
    </div>
  );
};

export default SettingsPage;
