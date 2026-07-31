import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, FileText, Zap, ArrowRight, Sparkles } from 'lucide-react';
import styles from './LandingPage.module.css';

export const LandingPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.brand}>
          <div className={styles.logoMark}>
            <BookOpen size={22} />
          </div>
          <span className={styles.brandName}>Research Paper Explorer</span>
        </Link>
        <div className={styles.navActions}>
          <Link to="/workspace" className={styles.btnGhost}>
            Sign In
          </Link>
          <Link to="/workspace" className={styles.btnPrimary}>
            Open Workspace <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <Sparkles size={14} /> RAG-Powered Research Assistant
        </div>
        <h1 className={styles.heroTitle}>
          Ask smarter questions about your research papers
        </h1>
        <p className={styles.heroSub}>
          Semantic search over your academic documents with page-level citations,
          dual LLM modes, and a built-in citation inspector — all in one workspace.
        </p>
        <div className={styles.heroCtas}>
          <Link to="/workspace" className={styles.btnPrimary}>
            Open Workspace <ArrowRight size={16} />
          </Link>
          <Link to="/document" className={styles.btnGhost}>
            View Document
          </Link>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.featureCard}>
          <div className={`${styles.featureIcon} ${styles.iconSearch}`}>
            <Search size={22} />
          </div>
          <h3>Semantic Search</h3>
          <p>
            Vector embeddings find the most relevant passages in your paper,
            not just keyword matches.
          </p>
        </div>
        <div className={styles.featureCard}>
          <div className={`${styles.featureIcon} ${styles.iconCite}`}>
            <FileText size={22} />
          </div>
          <h3>Built-in Citations</h3>
          <p>
            Every answer links back to source chunks with page markers and
            a dedicated citation inspector panel.
          </p>
        </div>
        <div className={styles.featureCard}>
          <div className={`${styles.featureIcon} ${styles.iconModel}`}>
            <Zap size={22} />
          </div>
          <h3>Dual LLM Modes</h3>
          <p>
            Fast Mode for quick answers via Llama, Smart Mode for deeper reasoning
            via Gemini — with automatic fallback.
          </p>
        </div>
      </section>

      <section className={styles.preview}>
        <div className={styles.previewCard}>
          <div className={styles.previewLabel}>Example interaction</div>
          <div className={styles.previewQ}>
            What are the core methodologies proposed in the paper?
          </div>
          <div className={styles.previewA}>
            The paper proposes a Retrieval Augmented Generation pipeline combining
            semantic chunk retrieval with LLM synthesis. Key methods include
            embedding-based search and context-grounded prompting [1][2]…
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        Research Paper Explorer · Retrieval Augmented Assistant
      </footer>
    </div>
  );
};

export default LandingPage;
