import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./ThinkingState.module.css";

const STAGES = [800, 600, 1800, 2600, 1600];

function useSequence(steps: number[]) {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    if (stage >= steps.length - 1) return;
    const t = setTimeout(() => setStage((s) => s + 1), steps[stage]);
    return () => clearTimeout(t);
  }, [stage, steps]);
  return stage;
}

type Row = {
  primary: string;
  secondary?: string;
  mono?: boolean;
  add?: number;
  del?: number;
  href?: string;
};

const VARIANTS: Record<
  string,
  { active: string; done: string; rows: Row[]; query?: string }
> = {
  Steps: {
    active: "Thinking",
    done: "Thought for 4 seconds",
    rows: [
      { primary: "Reading flavor briefs" },
      { primary: "Scanning supplier lists" },
      { primary: "Comparing tasting notes", secondary: "6 flavors" },
      { primary: "Writing the scoop report" },
    ],
  },
  Reasoning: {
    active: "Thinking",
    done: "Thought for 4 seconds",
    rows: [
      { primary: "Summer demand spikes for stone-fruit flavors — peach and apricot lead." },
      { primary: "I should check cone inventory before promoting a waffle-bowl special." },
    ],
  },
  Search: {
    active: "Searching the web",
    done: "Searched the web",
    query: "best waffle cone supplier",
    rows: [
      { primary: "Joy Cone", secondary: "joycone.com", href: "https://joycone.com/fs_products/waffle-cones/" },
      { primary: "WebstaurantStore", secondary: "webstaurantstore.com", href: "https://www.webstaurantstore.com/ice-cream-shop-supplies.html" },
      { primary: "The Konery", secondary: "thekonery.com", href: "https://www.thekonery.com/" },
    ],
  },
  Coding: {
    active: "Running tools",
    done: "Ran 3 tools",
    rows: [
      { primary: "Read", secondary: "flavors.ts", mono: true },
      { primary: "Edit", secondary: "ChurnSchedule.tsx", mono: true, add: 74, del: 41 },
      { primary: "Run", secondary: "npm run freeze", mono: true },
    ],
  },
};

function Dot({ tone }: { tone: string }) {
  return (
    <span className={`${styles.dot} ${tone}`}>
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="9" />
        <path d="M3.5 12h17M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </svg>
    </span>
  );
}

const TONES = [styles.bgAccent, styles.bgOrange, styles.bgGreen];

interface ThinkingStateProps {
  variant?: string;
  onSettled?: () => void;
  customRows?: Row[];
  customTitleActive?: string;
  customTitleDone?: string;
  isWorking?: boolean;
}

export const ThinkingState: React.FC<ThinkingStateProps> = ({ 
  variant = "Steps", 
  onSettled,
  customRows,
  customTitleActive,
  customTitleDone,
  isWorking
}) => {
  const stage = useSequence(STAGES);
  const [manualExpanded, setManualExpanded] = useState<boolean | null>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const v = VARIANTS[variant] ?? VARIANTS.Steps;
  
  const rows = customRows ?? v.rows;
  const working = isWorking !== undefined ? isWorking : (stage < 3);
  const activeTitle = customTitleActive ?? v.active;
  const doneTitle = customTitleDone ?? v.done;
  const visible = customRows ? customRows.length : (stage < 2 ? 0 : stage === 2 ? Math.min(2, rows.length) : rows.length);
  const autoExpanded = false;
  
  const expanded = manualExpanded ?? autoExpanded;
  const traceRef = useRef<HTMLDivElement>(null);
  const [lineHeight, setLineHeight] = useState(0);
  useLayoutEffect(() => {
    if (traceRef.current) setLineHeight(traceRef.current.offsetHeight);
  }, [visible, expanded, variant, stage, rows]);

  /* let embedders sequence content after the trace settles */
  const settledRef = useRef(false);
  useEffect(() => {
    if (working || settledRef.current) return;
    settledRef.current = true;
    onSettled?.();
  }, [working, onSettled]);

  return (
    <div
      key={variant}
      className={styles.container}
      style={{
        minHeight: working || expanded ? 176 : undefined,
        transition: "min-height 400ms cubic-bezier(0.23,1,0.32,1)",
      }}
    >
      {/* header — shared across variants */}
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setManualExpanded((current) => !(current ?? autoExpanded))}
        className={styles.headerBtn}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--text-muted)">
          <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
        </svg>
        <span role="status" className="contents">
          {working ? (
            <span className={styles.shimmerLabel}>
              {activeTitle}
            </span>
          ) : (
            <span className={styles.doneLabel}>
              {doneTitle}
            </span>
          )}
        </span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          className="transition-transform duration-300"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0)" }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* expandable trace */}
      <div
        className={styles.expandableGrid}
        style={{
          gridTemplateRows: expanded ? "1fr" : "0fr",
          opacity: expanded ? 1 : 0,
        }}
      >
        <div className={styles.innerContent}>
          <div className={styles.traceWrapper}>
            <span
              aria-hidden
              className={styles.timelineLine}
              style={{ height: lineHeight ? lineHeight - 2 : 0 }}
            />
            <div ref={traceRef} className={styles.traceList}>
            {v.query && (
              <div className={styles.queryRow} style={{ animation: expanded ? "fade-up 300ms cubic-bezier(0.23,1,0.32,1) both" : undefined }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" className="shrink-0">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
                <span className={styles.queryText}>{v.query}</span>
              </div>
            )}
            {rows.slice(0, visible).map((row, i) => {
              const selected = selectedTool === row.primary;
              const content = (
                <>
                {variant === "Search" && <Dot tone={TONES[i % 3]} />}
                {variant === "Steps" && (
                  i < visible - 1 || !working ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    <span className={styles.spinner} />
                  )
                )}
                <span className={`${styles.rowPrimaryText} ${variant === "Reasoning" ? styles.reasoningText : styles.standardText} ${variant === "Search" ? styles.searchText : ""}`}>
                  {row.primary}
                </span>
                {row.secondary && (
                  <span className={`${styles.rowSecondaryText} ${row.mono ? styles.fontMono : ""}`}>
                    {row.secondary}
                  </span>
                )}
                {row.add !== undefined && (
                  <span className={styles.changeNumbers}>
                    <span className={styles.textGreen}>+{row.add}</span>{" "}
                    <span className={styles.textRed}>−{row.del}</span>
                  </span>
                )}
                </>
              );
              
              const combinedRowClass = `${styles.rowBase} ${variant === "Search" || variant === "Coding" ? styles.rowInteractive : ""} ${selected ? styles.rowSelected : ""}`;
              const animationStyle = { animation: `fade-up 320ms cubic-bezier(0.23,1,0.32,1) ${i * 120}ms both` };

              if (variant === "Search") {
                return (
                  <a
                    key={row.primary}
                    href={row.href}
                    target="_blank"
                    rel="noreferrer"
                    className={combinedRowClass}
                    style={animationStyle}
                  >
                    {content}
                  </a>
                );
              }

              if (variant === "Coding") {
                return (
                  <button
                    key={row.primary}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSelectedTool(selected ? null : row.primary)}
                    className={combinedRowClass}
                    style={animationStyle}
                  >
                    {content}
                  </button>
                );
              }

              return (
                <div key={row.primary} className={combinedRowClass} style={animationStyle}>
                  {content}
                </div>
              );
            })}
            {variant === "Search" && stage >= 3 && (
              <span className={styles.moreCount} style={{ animation: "fade-in 300ms ease-out both" }}>
                +7 more
              </span>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThinkingState;
