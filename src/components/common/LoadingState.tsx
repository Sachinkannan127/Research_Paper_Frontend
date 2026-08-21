import React, { useEffect, useState } from "react";
import styles from "./LoadingState.module.css";

const chevron = Array.from({ length: 9 }, (_, i) => {
  const r = Math.floor(i / 3), c = i % 3;
  return (c + Math.abs(r - 1)) * 90;
});

const ORBIT_ORDER = [0, 1, 2, 5, 8, 7, 6, 3];
const orbit = Array.from({ length: 9 }, (_, i) => {
  const k = ORBIT_ORDER.indexOf(i);
  return k === -1 ? null : k * 110;
});

const PATTERNS: Record<string, { delays: (number | null)[]; dur: number; round: boolean }> = {
  Drive: { delays: chevron, dur: 650, round: false },
  Dots: { delays: chevron, dur: 650, round: true },
  Orbit: { delays: orbit, dur: 950, round: false },
};

interface LoaderGridProps {
  delays: (number | null)[];
  dur: number;
  round: boolean;
}

function LoaderGrid({ delays, dur, round }: LoaderGridProps) {
  return (
    <span aria-hidden className={styles.grid}>
      {delays.map((delay, index) => (
        <span
          key={index}
          className={`${styles.cell} ${round ? styles.roundedFull : styles.roundedOne}`}
          style={{
            opacity: delay === null ? 0.07 : 0.15,
            animation: delay === null ? "none" : `pixel-on ${dur}ms ease-in-out ${delay}ms infinite`,
          }}
        />
      ))}
    </span>
  );
}

function useElapsed() {
  const [ds, setDs] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setDs((d) => d + 1), 100);
    return () => clearInterval(t);
  }, []);
  const total = ds / 10;
  if (total < 60) return `${total.toFixed(1)}s`;
  return `${Math.floor(total / 60)}m ${(total % 60).toFixed(1)}s`;
}

interface LoadingStateProps {
  label?: string;
  variant?: string;
  videoSrc?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  label,
  variant = "Drive",
  videoSrc = "/subway-surfers.mp4",
}) => {
  const elapsed = useElapsed();
  const surfer = variant === "Surfer";
  const resolvedLabel = label ?? (surfer ? "Subway surfing" : "Churning");
  const [videoOk, setVideoOk] = useState(true);
  const { delays, dur, round } = PATTERNS[variant] ?? PATTERNS.Drive;

  const labelEl = (
    <span className={styles.label}>
      {resolvedLabel}
    </span>
  );
  
  const elapsedEl = (
    <span className={styles.elapsed}>
      {elapsed}
    </span>
  );

  if (surfer) {
    return (
      <div role="status" className={styles.surferContainer}>
        <div className={styles.headerRow}>
          <LoaderGrid {...PATTERNS.Drive} />
          {labelEl}
          {elapsedEl}
        </div>

        <div className={styles.videoCard}>
          <div className={styles.videoWrapper}>
            {videoOk ? (
              <video
                src={videoSrc}
                autoPlay
                muted
                loop
                playsInline
                onError={() => setVideoOk(false)}
                className={styles.video}
              />
            ) : (
              <div className={styles.videoFallback}>
                <LoaderGrid {...PATTERNS.Drive} />
                <span className={styles.videoFallbackText}>
                  Video unavailable
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div role="status" className={styles.container}>
      <LoaderGrid delays={delays} dur={dur} round={round} />
      {labelEl}
      {elapsedEl}
    </div>
  );
};

export default LoadingState;
