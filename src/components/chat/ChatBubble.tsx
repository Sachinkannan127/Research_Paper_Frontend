import React, { useState } from 'react';
import { Message, useAssistant } from '../../state/AssistantContext';
import { ModelBadge } from './ModelBadge';
import { Volume2, VolumeX, Check, Copy } from 'lucide-react';
import { ThinkingState } from '../common/ThinkingState';
import styles from './ChatBubble.module.css';

interface ChatBubbleProps {
  message: Message;
  playingMessageId?: string | null;
  isPlaying?: boolean;
  onPlayAudio?: (id: string, base64: string) => void;
  suggestedQuestions?: string[];
  onSuggestedClick?: (question: string) => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ 
  message, 
  playingMessageId, 
  isPlaying, 
  onPlayAudio,
  suggestedQuestions,
  onSuggestedClick
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
    // Split by markdown links: [linkText](linkUrl)
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    const parts = chunkText.split(linkRegex);
    const renderedElements: React.ReactNode[] = [];
    
    for (let i = 0; i < parts.length; i += 3) {
      const textBefore = parts[i];
      const linkText = parts[i + 1];
      const linkUrl = parts[i + 2];
      
      if (textBefore) {
        renderedElements.push(...parseBoldAndCitations(textBefore));
      }
      
      if (linkText && linkUrl) {
        renderedElements.push(
          <a 
            key={`link-${i}`} 
            href={linkUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.contentLink}
          >
            {linkText}
          </a>
        );
      }
    }
    
    return renderedElements;
  };

  const parseBoldAndCitations = (text: string) => {
    const boldParts = text.split(/\*\*([^*]+)\*\*/g);
    return boldParts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className={styles.boldText}>{part}</strong>;
      }
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

  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getThinkingRows = () => {
    if (!message.pipelineSteps) return [];
    return message.pipelineSteps.map(step => {
      let secondary = "pending";
      if (step.status === "cached") secondary = "cached";
      else if (step.status === "done") secondary = "complete";
      else if (step.status === "active") secondary = "active";
      else if (step.status === "failed") secondary = "failed";
      return {
        primary: step.label,
        secondary: secondary,
        mono: false
      };
    });
  };

  const hasSteps = message.pipelineSteps && message.pipelineSteps.length > 0;
  const isPipelineActive = message.pipelineSteps?.some(s => s.status === 'active');
  const isPipelineFailed = message.pipelineSteps?.some(s => s.status === 'failed');
  const isPipelineDone = message.pipelineSteps?.every(s => s.status === 'done' || s.status === 'cached');
  
  const customTitleActive = isPipelineActive ? "Executing vector pipeline..." : "Thinking...";
  const customTitleDone = isPipelineFailed ? "Pipeline execution failed" : "RAG Pipeline Complete";

  return (
    <div className={`${styles.bubbleWrapper} ${isUser ? styles.userWrapper : styles.assistantWrapper}`}>
      <div className={styles.avatar}>
        {isUser ? (
          <div className={styles.userAvatarIcon}>U</div>
        ) : (
          <svg className={styles.assistantAvatarIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.5a1 1 0 1 1-2 0V11a1 1 0 1 1 2 0v5.5zm0-7.75a1.25 1.25 0 1 1-2 0 1.25 1.25 0 0 1 2 0z" fill="currentColor"/>
          </svg>
        )}
      </div>

      <div className={styles.bubbleContent}>
        {!isUser && (
          <div className={styles.metaRow}>
            <ModelBadge 
              modelName={message.modelName} 
              attempts={message.retryAttempts} 
            />
          </div>
        )}

        <div className={`${styles.body} ${message.isStreaming ? styles.isStreaming : ''}`}>
          {isUser ? (
            <p className={styles.userText}>{message.content}</p>
          ) : (
            <>
              {hasSteps && (
                <div className={styles.thinkingContainer}>
                  <ThinkingState 
                    customRows={getThinkingRows()} 
                    customTitleActive={customTitleActive}
                    customTitleDone={customTitleDone}
                    isWorking={!isPipelineDone && (isPipelineActive || !message.content)}
                  />
                </div>
              )}
              
              <div className={styles.assistantMarkdownContent}>
                {renderMarkdown(message.content)}
              </div>
              
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

              {!message.isStreaming && message.content.length > 0 && (
                <div className={styles.actionRow}>
                  <button
                    onClick={handleCopy}
                    className={styles.actionBtn}
                    title="Copy text"
                  >
                    {copied ? <Check size={14} className={styles.greenText} /> : <Copy size={14} />}
                  </button>
                  <button
                    onClick={() => setLiked(liked === true ? null : true)}
                    className={`${styles.actionBtn} ${liked === true ? styles.liked : ''}`}
                    title="Thumbs up"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={liked === true ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setLiked(liked === false ? null : false)}
                    className={`${styles.actionBtn} ${liked === false ? styles.disliked : ''}`}
                    title="Thumbs down"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={liked === false ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm12-7h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
                    </svg>
                  </button>
                </div>
              )}

              {/* follow-up questions inline */}
              {!message.isStreaming && suggestedQuestions && suggestedQuestions.length > 0 && (
                <div className={styles.followUpsWrapper}>
                  <p className={styles.followUpsTitle}>Suggested Follow-ups</p>
                  <div className={styles.followUpsList}>
                    {suggestedQuestions.map((text, i) => (
                      <button
                        key={text}
                        onClick={() => onSuggestedClick && onSuggestedClick(text)}
                        className={styles.followUpBtn}
                        style={{ animation: `fade-up 350ms cubic-bezier(0.23,1,0.32,1) ${i * 90}ms both` }}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0">
                          <path d="M9 10l-5 5 5 5" />
                          <path d="M20 4v7a4 4 0 0 1-4 4H4" />
                        </svg>
                        {text}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default ChatBubble;
