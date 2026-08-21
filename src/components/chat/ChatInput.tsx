import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { useSettings } from '../../state/SettingsContext';
import { useAssistant } from '../../state/AssistantContext';
import { useChatService } from '../../hooks/useChatService';
import { ArrowUp, Globe, Trash2, AudioLines } from 'lucide-react';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import styles from './ChatInput.module.css';

export const ChatInput: React.FC = () => {
  const [question, setQuestion] = useState('');
  
  const { model, setModel } = useSettings();
  const { isLoading, clearChat } = useAssistant();
  const { sendQuestionStream, sendVoiceQuestion } = useChatService();
  const { isRecording, startRecording, stopRecording, cancelRecording } = useAudioRecorder();
  
  // Custom local state for Web Search toggle matching "Web Off" in screenshot
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleMicClick = async () => {
    if (isRecording) {
      const audioBlob = await stopRecording();
      if (audioBlob) {
        await sendVoiceQuestion(audioBlob);
      }
    } else {
      await startRecording();
    }
  };

  const handleCancelRecord = () => {
    cancelRecording();
  };

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`;
    }
  }, [question]);

  // Listen for suggested questions
  useEffect(() => {
    const handleSuggestedAsk = (e: Event) => {
      const q = (e as CustomEvent).detail;
      if (q && !isLoading) {
        sendQuestionStream(q);
      }
    };
    window.addEventListener('ask-suggested-question', handleSuggestedAsk);
    return () => {
      window.removeEventListener('ask-suggested-question', handleSuggestedAsk);
    };
  }, [isLoading, sendQuestionStream]);

  const handleSubmit = () => {
    if (!question.trim() || isLoading) return;

    const trimmedQuestion = question.trim();
    setQuestion('');
    sendQuestionStream(trimmedQuestion);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleActiveModel = () => {
    if (isLoading) return;
    setModel(model === 'fast' ? 'smart' : 'fast');
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputCard}>
        {/* Input area */}
        <div className={styles.textareaWrapper}>
          {isRecording ? (
            <div className={styles.recordingState} onClick={handleMicClick} title="Stop and submit query">
              <span className={styles.pulsingWave} />
              <span className={styles.recordText}>Recording... Click box to stop &amp; send</span>
              <button
                className={styles.cancelBtn}
                onClick={(e) => { e.stopPropagation(); handleCancelRecord(); }}
                type="button"
              >
                Cancel
              </button>
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              placeholder={`Message ${model === 'fast' ? 'Mistral (Fast)' : 'Gemini 2.5 (Smart)'}...`}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isLoading}
            />
          )}
        </div>

        {/* Bottom actions toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.leftToolbarGroup}>
            {/* Answer With Pill */}
            <button
              type="button"
              className={styles.modelPill}
              onClick={toggleActiveModel}
              disabled={isLoading}
              title="Click to toggle active model"
            >
              <span className={styles.pillLabel}>ANSWER WITH</span>
              <span className={styles.pillValue}>
                {model === 'fast' ? 'Mistral (Fast)' : 'Gemini 2.5 (Smart)'}
              </span>
            </button>

            {/* Web Search Toggle */}
            <div className={styles.webToggleWrapper}>
              <span className={styles.webToggleLabel}>Web</span>
              <button
                type="button"
                className={`${styles.webToggleButton} ${webSearchEnabled ? styles.webToggleOn : styles.webToggleOff}`}
                onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                title="Toggle Web Search"
              >
                <span className={styles.webToggleInnerLabel}>
                  {webSearchEnabled ? 'On' : 'Off'}
                </span>
                <span className={styles.webToggleSwitchDot} />
              </button>
            </div>

            {/* Voice Mic Input */}
            {!isRecording && (
              <button
                className={styles.micBtn}
                onClick={handleMicClick}
                disabled={isLoading}
                title="Ask via Voice"
                type="button"
              >
                <AudioLines size={14} />
              </button>
            )}
          </div>

          <div className={styles.rightToolbarGroup}>
            {/* Reset Chat button */}
            <button
              className={styles.trashBtn}
              onClick={clearChat}
              title="Reset active chat logs"
              disabled={isLoading}
            >
              <Trash2 size={14} />
            </button>

            {/* Send / Ask button */}
            <button
              className={`${styles.askBtn} ${question.trim() && !isLoading ? styles.askBtnActive : ''}`}
              onClick={handleSubmit}
              disabled={!question.trim() || isLoading}
              title="Send query"
            >
              <span>Ask</span>
              <ArrowUp size={15} style={{ strokeWidth: 2.5 }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
