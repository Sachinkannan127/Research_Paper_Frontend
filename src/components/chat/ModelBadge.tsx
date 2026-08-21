import React from 'react';
import styles from './ModelBadge.module.css';

interface ModelBadgeProps {
  modelName?: string;
  attempts?: number;
}

export const ModelBadge: React.FC<ModelBadgeProps> = ({ modelName, attempts = 1 }) => {
  if (!modelName) return null;

  const isGemini = modelName.toLowerCase().includes('gemini');
  const isMistral = modelName.toLowerCase().includes('mistral') || modelName.toLowerCase().includes('llama') || modelName.toLowerCase().includes('groq');

  let cleanName = modelName;
  if (isGemini) {
    cleanName = 'Gemini 2.5 Flash';
  } else if (isMistral) {
    cleanName = 'Mistral Small';
  }

  const badgeClass = isGemini ? styles.gemini : isMistral ? styles.mistral : styles.generic;

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
