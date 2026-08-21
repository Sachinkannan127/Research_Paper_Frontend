import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useBackendAuth } from '../state/AuthContext';
import { 
  BookOpen, Search, FileText, ArrowRight, Sparkles, 
  Cpu
} from 'lucide-react';
import styles from './LandingPage.module.css';

export const LandingPage: React.FC = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { backendAuthenticated } = useBackendAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && backendAuthenticated) {
        navigate('/workspace/dashboard', { replace: true });
      }
    }
  }, [isLoaded, isSignedIn, backendAuthenticated, navigate]);

  return (
    <div className={styles.page}>
      {/* Decorative background grid and gradient glows */}
      <div className={styles.ambientGlow1} />
      <div className={styles.ambientGlow2} />
      <div className={styles.gridOverlay} />

      <nav className={styles.nav}>
        <Link to="/" className={styles.brand}>
          <div className={styles.logoMark}>
            <BookOpen size={20} />
          </div>
          <span className={styles.brandName}>Research Explorer</span>
        </Link>
        <div className={styles.navActions}>
          <Link to="/login" className={styles.btnGhost}>
            Sign In
          </Link>
          <Link to="/workspace" className={styles.btnPrimary}>
            Enter Workspace <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <Sparkles size={13} className={styles.sparkleIcon} />
          <span>Advanced RAG Semantic Engine</span>
        </div>
        <h1 className={styles.heroTitle}>
          Smarter Literature Analysis <br />
          <span className={styles.heroTitleAccent}>Powered by Dual-Model RAG</span>
        </h1>
        <p className={styles.heroSub}>
          Instantly query complex scientific, engineering, and academic PDFs.
          Get context-grounded synthesis with precise page-level citations, custom prompt presets, and dual model fallback.
        </p>
        <div className={styles.heroCtas}>
          <Link to="/workspace" className={styles.btnPrimaryLarge}>
            Launch Console <ArrowRight size={18} />
          </Link>
          <Link to="/register" className={styles.btnSecondaryLarge}>
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Stats/Badges Banner */}
      <section className={styles.statsBanner}>
        <div className={styles.statItem}>
          <span className={styles.statVal}>99.4%</span>
          <span className={styles.statLbl}>Citation Accuracy</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={styles.statVal}>&lt; 0.3s</span>
          <span className={styles.statLbl}>Fast Mode Latency</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={styles.statVal}>100%</span>
          <span className={styles.statLbl}>Private Vector Stores</span>
        </div>
      </section>

      {/* Features Grid */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Engineered for Modern Academic Workflows</h2>
          <p className={styles.sectionSubtitle}>Combining advanced embeddings with state-of-the-art LLMs to deliver reliable answers.</p>
        </div>
        
        <div className={styles.features}>
          <div className={styles.featureCard}>
            <div className={`${styles.featureIcon} ${styles.iconSearch}`}>
              <Search size={22} />
            </div>
            <h3>Dense Vector Retrieval</h3>
            <p>
              Performs semantic search over your library using high-dimensional embeddings to capture deep contextual matches rather than simple keywords.
            </p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={`${styles.featureIcon} ${styles.iconCite}`}>
              <FileText size={22} />
            </div>
            <h3>Verifiable Source Citations</h3>
            <p>
              Every response is generated directly from paper chunks, complete with clickable page-level references and an interactive inspection drawer.
            </p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={`${styles.featureIcon} ${styles.iconModel}`}>
              <Cpu size={22} />
            </div>
            <h3>Dual Model Fallbacks</h3>
            <p>
              Leverage fast inference using optimized Llama endpoints, or toggle Smart Mode for deeper logical reasoning powered by Gemini.
            </p>
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className={styles.previewSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Verifiable AI Synthesis</h2>
          <p className={styles.sectionSubtitle}>Interact with your research library using the semantic RAG interface.</p>
        </div>

        <div className={styles.previewCard}>
          <div className={styles.previewHeader}>
            <div className={styles.windowDots}>
              <span className={styles.dotRed} />
              <span className={styles.dotYellow} />
              <span className={styles.dotGreen} />
            </div>
            <span className={styles.windowTitle}>Research Explorer Chat Console</span>
          </div>
          <div className={styles.previewBody}>
            <div className={styles.previewQ}>
              What are the core methodologies proposed in the paper?
            </div>
            <div className={styles.previewA}>
              <div className={styles.assistantBadge}>
                <Sparkles size={12} style={{ color: '#818cf8' }} />
                <span>AI Assistant (Smart Mode)</span>
              </div>
              <p>
                The paper proposes a **Retrieval-Augmented Generation (RAG)** pipeline. The workflow consists of three main steps:
              </p>
              <ol style={{ paddingLeft: '20px', margin: '8px 0' }}>
                <li>**Dense Passage Retrieval**: Translating user queries into embeddings and finding matching chunks in MongoDB Atlas [Page 4].</li>
                <li>**Context Compression**: Filtering retrieved snippets by similarity metrics [Page 5].</li>
                <li>**Grounded Generation**: Passing the query and context to the dual LLM fallback engine [Page 7].</li>
              </ol>
              <div className={styles.citationChips}>
                <span className={styles.citationChip}>[1] Section 3.2: Retrieval Pipeline (Page 4)</span>
                <span className={styles.citationChip}>[2] Section 4.1: Evaluation Parameters (Page 7)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <BookOpen size={16} />
          <span>Research Explorer</span>
        </div>
        <p className={styles.footerText}>
          A secure, RAG-grounded workspace designed for semantic paper indexing and academic intelligence.
        </p>
        <div className={styles.footerDivider} />
        <div className={styles.footerCopyright}>
          &copy; {new Date().getFullYear()} Research Explorer. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
