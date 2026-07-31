import React from 'react';
import styles from './ModelBadge.module.css';

interface ModelBadgeProps {
  modelName?: string;
  attempts?: number;
}

export const ModelBadge: React.FC<ModelBadgeProps> = ({ modelName, attempts = 1 }) => {
  if (!modelName) return null;

  const isGemini = modelName.toLowerCase().includes('gemini');
  const isGroq = modelName.toLowerCase().includes('groq') || modelName.toLowerCase().includes('llama');

  let cleanName = modelName;
  if (isGemini) {
    cleanName = 'Gemini 2.5 Flash';
  } else if (isGroq) {
    cleanName = 'Llama 3.1 (Groq)';
  }

  const badgeClass = isGemini ? styles.gemini : isGroq ? styles.groq : styles.generic;

  return (
    <div className={styles.badgeWrapper}>
      <span className={`${styles.badge} ${badgeClass}`}>
        {cleanName}
      </span>
      {attempts > 1 && (
        <span className={styles.retrySnippet}>
          {attempts} attempts (Fallback)
        </span>
      )}
    </div>
  );
};
export default ModelBadge;
