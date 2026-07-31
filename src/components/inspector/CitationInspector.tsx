import React from 'react';
import { useAssistant } from '../../state/AssistantContext';
import { FileText, Compass, XCircle, ArrowUpRight } from 'lucide-react';
import styles from './CitationInspector.module.css';

export const CitationInspector: React.FC = () => {
  const { activeChunk, setActiveChunk } = useAssistant();

  if (!activeChunk) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyGraphic}>
          <Compass className={styles.compassIcon} size={48} />
          <div className={styles.glowingCore} />
        </div>
        <h3>Citation Inspector</h3>
        <p className={styles.emptyExplain}>
          Select a source citation badge or a retrieved card inside replies to explore original research snippets, match indexes, and page markers.
        </p>
      </div>
    );
  }

  const filename = activeChunk.source ? activeChunk.source.split(/[\\/]/).pop() : 'Research_paper.pdf';
  // Standard ChromaDB distance output for cosine/l2 similarity
  const distancePct = Math.max(0, Math.min(100, (1 - activeChunk.score) * 100));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <FileText size={18} className={styles.headerIcon} />
          <h3>Reference Inspector</h3>
        </div>
        <button 
          className={styles.closeBtn} 
          onClick={() => setActiveChunk(null)}
          title="Clear inspector selection"
        >
          <XCircle size={18} />
        </button>
      </div>

      <div className={styles.cardGroup}>
        {/* Source File Card */}
        <div className={styles.metaCard}>
          <span className={styles.label}>Source Document</span>
          <div className={styles.valueGroup}>
            <span className={styles.valueText}>{filename}</span>
            <a 
              href={`#`} 
              className={styles.docLink}
              onClick={(e) => e.preventDefault()}
              title="Click to view doc"
            >
              <ArrowUpRight size={14} />
            </a>
          </div>
        </div>

        {/* Page / Position */}
        <div className={styles.metaGrid}>
          <div className={styles.metaSubCard}>
            <span className={styles.label}>Page Location</span>
            <span className={styles.numValue}>{activeChunk.page || 'N/A'}</span>
          </div>

          <div className={styles.metaSubCard}>
            <span className={styles.label}>Closeness Score</span>
            <div className={styles.scoreRow}>
              <span className={styles.numValue}>{activeChunk.score.toFixed(4)}</span>
              <span className={styles.percentageIndicator}>
                ~{distancePct.toFixed(0)}% match
              </span>
            </div>
          </div>
        </div>

        {/* Visual score matches bar */}
        <div className={styles.metricCard}>
          <span className={styles.label}>Similarity Metric</span>
          <div className={styles.progressBarWrapper}>
            <div 
              className={styles.progressBarFill} 
              style={{ width: `${distancePct}%` }}
            />
          </div>
        </div>

        {/* Original Chunk Snippet Text */}
        <div className={styles.textSection}>
          <span className={styles.textHeading}>EXTRACTED PORTION</span>
          <div className={styles.textContainer}>
            <p className={styles.snippetContent}>
              {activeChunk.text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CitationInspector;
