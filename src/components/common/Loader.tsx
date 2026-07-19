import React from 'react';
import styles from './Loader.module.css';

interface LoaderProps {
  message?: string;
}

export const Loader: React.FC<LoaderProps> = ({ message = 'Thinking' }) => {
  return (
    <div className={styles.container}>
      <div className={styles.pulsar}>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
      </div>
      {message && <span className={styles.text}>{message}</span>}
    </div>
  );
};
export default Loader;
