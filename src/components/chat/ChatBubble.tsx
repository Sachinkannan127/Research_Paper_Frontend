import React, { useState, useEffect } from 'react';
import { Message, useAssistant, PipelineStep } from '../../state/AssistantContext';
import { ModelBadge } from './ModelBadge';
import { FileText, Check, Loader2, Database, AlertCircle, ChevronDown, ChevronUp, Cpu, Network, Volume2, VolumeX, Clock } from 'lucide-react';
import styles from './ChatBubble.module.css';

interface ChatBubbleProps {
  message: Message;
  playingMessageId?: string | null;
  isPlaying?: boolean;
  onPlayAudio?: (id: string, base64: string) => void;
}

const PipelineStepper: React.FC<{ steps: PipelineStep[]; message: Message }> = ({ steps, message }) => {
  const [isOpen, setIsOpen] = useState(true);

  // Group steps into Ingestion and Query phases
  const ingestionSteps = steps.filter(s =>
    ['text_extract', 'chunking', 'embedding', 'vector_store'].includes(s.name)
  );
  const querySteps = steps.filter(s =>
    ['query_embedding', 'similarity_search', 'top_k'].includes(s.name)
  );

  // Status summaries
  const isAnyActive = steps.some(s => s.status === 'active');
  const isAnyFailed = steps.some(s => s.status === 'failed');
  const isAllDone = steps.every(s => s.status === 'done' || s.status === 'cached');

  // Auto collapse when generation starts
  useEffect(() => {
    if (isAllDone && message.content.length > 0) {
      setIsOpen(false);
    }
  }, [isAllDone, message.content]);

  const getOverviewText = () => {
    if (isAnyFailed) return 'Vector Pipeline execution failed';
    if (isAnyActive) {
      const activeStep = steps.find(s => s.status === 'active');
      return `Pipeline active: ${activeStep?.label || 'Processing'}`;
    }
    if (isAllDone) {
      const cachedCount = steps.filter(s => s.status === 'cached').length;
      return cachedCount > 4
        ? 'Pipeline execution complete (cached)'
        : 'Pipeline execution complete';
    }
    return 'Pipeline initializing...';
  };

  const renderStepIcon = (status: PipelineStep['status']) => {
    switch (status) {
      case 'active':
        return <Loader2 className={styles.iconActive} size={14} />;
      case 'done':
        return <Check className={styles.iconDone} size={14} />;
      case 'cached':
        return <Database className={styles.iconCached} size={14} />;
      case 'failed':
        return <AlertCircle className={styles.iconFailed} size={14} />;
      default:
        return <div className={styles.iconPending} />;
    }
  };

  return (
    <div className={styles.stepperContainer}>
      <button 
        className={styles.stepperHeader} 
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <div className={styles.headerLabel}>
          <Cpu className={`${styles.cpuIcon} ${isAnyActive ? styles.cpuSpinning : ''}`} size={14} />
          <span>{getOverviewText()}</span>
        </div>
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {isOpen && (
        <div className={styles.stepperContent}>
          <div className={styles.pipelineSection}>
            <div className={styles.sectionTitle}>
              <Database size={11} className={styles.secIcon} />
              <span>Document Processing</span>
            </div>
            <div className={styles.stepsList}>
              {ingestionSteps.map(step => (
                <div key={step.name} className={`${styles.stepRow} ${styles[step.status]}`}>
                  <div className={styles.stepStatusIcon}>
                    {renderStepIcon(step.status)}
                  </div>
                  <span className={styles.stepNameLabel}>{step.label}</span>
                  {step.status === 'cached' && <span className={styles.cachedBadge}>cached</span>}
                  {step.latency_ms !== undefined && step.latency_ms > 0 && (
                    <span className={styles.stepLatency}>{step.latency_ms.toFixed(0)}ms</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.pipelineDivider} />

          <div className={styles.pipelineSection}>
            <div className={styles.sectionTitle}>
              <Network size={11} className={styles.secIcon} />
              <span>User Query Processing</span>
            </div>
            <div className={styles.stepsList}>
              {querySteps.map(step => (
                <div key={step.name} className={`${styles.stepRow} ${styles[step.status]}`}>
                  <div className={styles.stepStatusIcon}>
                    {renderStepIcon(step.status)}
                  </div>
                  <span className={styles.stepNameLabel}>{step.label}</span>
                  {step.latency_ms !== undefined && step.latency_ms > 0 && (
                    <span className={styles.stepLatency}>{step.latency_ms.toFixed(0)}ms</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ChatBubble: React.FC<ChatBubbleProps> = ({ 
  message, 
  playingMessageId, 
  isPlaying, 
  onPlayAudio 
}) => {
  const { setActiveChunk, activeChunk } = useAssistant();
  const isUser = message.role === 'user';

  // Basic custom markdown renderer to parse headers, bolding, lists, and code logs without massive library sizes
  const renderMarkdown = (text: string) => {
    if (!text) return null;

    const lines = text.split('\n');
    return lines.map((line, index) => {
      // 1. Detect headers
      if (line.startsWith('### ')) {
        return <h4 key={index} className={styles.mdH4}>{line.substring(4)}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={index} className={styles.mdH3}>{line.substring(3)}</h3>;
      }
      if (line.startsWith('# ')) {
        return <h2 key={index} className={styles.mdH2}>{line.substring(2)}</h2>;
      }

      // 2. Detect bullet points
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        return (
          <ul key={index} className={styles.mdUl}>
            <li>{parseInlineStyles(line.trim().substring(2))}</li>
          </ul>
        );
      }

      // 3. Keep empty lines tidy
      if (line.trim() === '') {
        return <div key={index} className={styles.mdSpacing} />;
      }

      // 4. Default Paragraph
      return <p key={index} className={styles.mdP}>{parseInlineStyles(line)}</p>;
    });
  };

  const parseInlineStyles = (chunkText: string) => {
    // Basic bold parsing: **text**
    const parts = chunkText.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, index) => {
      // Bold alternate indexes
      if (index % 2 === 1) {
        return <strong key={index} className={styles.boldText}>{part}</strong>;
      }

      // Render citation index tags like [1] or [Source: ...]
      return parseCitations(part);
    });
  };

  const parseCitations = (text: string) => {
    // Parse citation links like [1] or matches to source lists:
    const citationRegex = /\[(\d+)\]/g;
    const parts = text.split(citationRegex);
    if (parts.length <= 1) return text;

    return parts.map((part, index) => {
      // Odd indices are the digits captured (e.g. 1, 2)
      if (index % 2 === 1) {
        const citationNum = parseInt(part, 10);
        // Map citation number to target chunk index: [1] -> chunk 0
        const chunkIndex = citationNum - 1;
        const targetChunk = message.retrievedChunks?.[chunkIndex] || message.retrievedChunks?.[0];

        if (targetChunk) {
          const isSelected = activeChunk?.text === targetChunk.text;
          return (
            <button
              key={index}
              className={`${styles.citationBadge} ${isSelected ? styles.citationBadgeActive : ''}`}
              onClick={() => setActiveChunk(targetChunk)}
              title="Click to view full reference context"
            >
              [{part}]
            </button>
          );
        }
        return `[${part}]`;
      }
      return part;
    });
  };

  return (
    <div className={`${styles.bubbleWrapper} ${isUser ? styles.userWrapper : styles.assistantWrapper}`}>
      <div className={styles.avatar}>
        {isUser ? 'ME' : 'AI'}
      </div>

      <div className={styles.bubbleContent}>
        {!isUser && (
          <div className={styles.metaRow}>
            <ModelBadge 
              modelName={message.modelName} 
              attempts={message.retryAttempts} 
            />
            {message.latencyMetrics && (
              <span 
                className={styles.latencyBadge} 
                title={`RAG processing timer: ${message.latencyMetrics.rag_latency_ms.toFixed(0)}ms, LLM answer generation: ${message.latencyMetrics.llm_latency_ms.toFixed(0)}ms`}
              >
                <Clock size={11} />
                <span>
                  {message.latencyMetrics.total_latency_ms > 1000 
                    ? `${(message.latencyMetrics.total_latency_ms / 1000).toFixed(2)}s` 
                    : `${message.latencyMetrics.total_latency_ms.toFixed(0)}ms`}
                </span>
              </span>
            )}
          </div>
        )}

        <div className={styles.body}>
          {isUser ? (
            <p className={styles.userText}>{message.content}</p>
          ) : (
            <>
              {message.pipelineSteps && message.pipelineSteps.length > 0 && (
                <PipelineStepper steps={message.pipelineSteps} message={message} />
              )}
              {renderMarkdown(message.content)}
              
              {message.audioBase64 && onPlayAudio && (
                <button
                  className={`${styles.playAudioBtn} ${playingMessageId === message.id && isPlaying ? styles.playAudioBtnActive : ''}`}
                  onClick={() => onPlayAudio(message.id, message.audioBase64!)}
                  title={playingMessageId === message.id && isPlaying ? "Silence voice response" : "Read response aloud"}
                  type="button"
                >
                  {playingMessageId === message.id && isPlaying ? (
                    <VolumeX size={13} />
                  ) : (
                    <Volume2 size={13} />
                  )}
                  <span>{playingMessageId === message.id && isPlaying ? "Pause response" : "Listen Response"}</span>
                </button>
              )}
            </>
          )}
        </div>

        {/* Performance Statistics */}
        {!isUser && message.latencyMetrics && (
          <div className={styles.performanceStatsCard}>
            <div className={styles.perfHeader}>
              <Cpu size={13} />
              <span>Pipeline latency breakdown</span>
            </div>
            <div className={styles.perfGrid}>
              <div className={styles.perfItem}>
                <span className={styles.perfLabel}>RAG Retrieval:</span>
                <span className={styles.perfVal}>{message.latencyMetrics.rag_latency_ms.toFixed(0)}ms</span>
              </div>
              <div className={styles.perfItem}>
                <span className={styles.perfLabel}>LLM Inference:</span>
                <span className={styles.perfVal}>{message.latencyMetrics.llm_latency_ms.toFixed(0)}ms</span>
              </div>
              <div className={styles.perfItem}>
                <span className={styles.perfLabel}>Total delay:</span>
                <span className={styles.perfValHighlight}>
                  {message.latencyMetrics.total_latency_ms > 1000 
                    ? `${(message.latencyMetrics.total_latency_ms / 1000).toFixed(2)}s` 
                    : `${message.latencyMetrics.total_latency_ms.toFixed(0)}ms`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* References Panel included at bottom of Bubble */}
        {!isUser && message.retrievedChunks && message.retrievedChunks.length > 0 && (
          <div className={styles.referencesArea}>
            <div className={styles.refHeader}>
              <FileText size={14} />
              <span>Retrieved Paper Contexts ({message.retrievedChunks.length})</span>
            </div>
            <div className={styles.refList}>
              {message.retrievedChunks.map((chunk, idx) => {
                const isSelected = activeChunk?.text === chunk.text;
                // Parse filename from full path
                const filename = chunk.source ? chunk.source.split(/[\\/]/).pop() : 'Research_paper.pdf';
                return (
                  <div
                    key={idx}
                    className={`${styles.refCardSimple} ${isSelected ? styles.refCardActive : ''}`}
                    onClick={() => setActiveChunk(chunk)}
                  >
                    <div className={styles.refIndicator}>[{idx + 1}]</div>
                    <div className={styles.refMetaText}>
                      <span className={styles.refName}>{filename}</span>
                      <span className={styles.refPage}>Page {chunk.page || 'N/A'}</span>
                    </div>
                    <div 
                      className={styles.refScore} 
                      title={`Metric check: ${chunk.metric || 'L2 Distance'}`}
                    >
                      {chunk.similarity_percentage !== undefined ? (
                        <span>Match: {chunk.similarity_percentage.toFixed(1)}%</span>
                      ) : (
                        <span>Dist: {chunk.score.toFixed(3)}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ChatBubble;
