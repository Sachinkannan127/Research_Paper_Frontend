import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { useSettings } from '../../state/SettingsContext';
import { useAssistant } from '../../state/AssistantContext';
import { useChatService } from '../../hooks/useChatService';
import { Send, Trash2, Zap, BrainCircuit, AudioLines } from 'lucide-react';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import styles from './ChatInput.module.css';

export const ChatInput: React.FC = () => {
  const [question, setQuestion] = useState('');
  
  const { model, setModel } = useSettings();
  const { isLoading, clearChat } = useAssistant();
  const { sendQuestionStream, sendVoiceQuestion } = useChatService();
  const { isRecording, startRecording, stopRecording, cancelRecording } = useAudioRecorder();
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

  // Auto-resize textarea when text is typed
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
    }
  }, [question]);

  // Listen for suggested question clicks
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

  return (
    <div className={styles.container}>
      {/* Toggles bar */}
      <div className={styles.optionsRow}>
        <div className={styles.modelToggles}>
          <button
            className={`${styles.optionBtn} ${model === 'fast' ? styles.optionBtnActiveFast : ''}`}
            onClick={() => setModel('fast')}
            title="Fast Mode: Primary Llama 3.1, Fallback Gemini"
            disabled={isLoading}
          >
            <Zap size={14} />
            <span>Fast Mode</span>
          </button>
          <button
            className={`${styles.optionBtn} ${model === 'smart' ? styles.optionBtnActiveSmart : ''}`}
            onClick={() => setModel('smart')}
            title="Smart Mode: Primary Gemini 2.5, Fallback Llama"
            disabled={isLoading}
          >
            <BrainCircuit size={14} />
            <span>Smart Mode</span>
          </button>
        </div>

        <div className={styles.utilityActions}>
          <button
            className={styles.trashBtn}
            onClick={clearChat}
            title="Reset active chat logs"
            disabled={isLoading}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Input textbox area */}
      <div className={styles.inputBoxWrapper}>
        {!isRecording && (
          <button
            className={styles.micBtn}
            onClick={handleMicClick}
            disabled={isLoading}
            title="Ask via Voice"
            type="button"
          >
            <AudioLines size={16} />
          </button>
        )}

        {isRecording ? (
          <div className={styles.recordingState} onClick={handleMicClick} title="Stop and submit query">
            <div>
              <span className={styles.pulsingWave} />
              <span>Recording... Click box to stop &amp; send</span>
            </div>
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
            placeholder="Ask a question about the research paper..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading}
          />
        )}

        {!isRecording && (
          <button
            className={`${styles.sendBtn} ${question.trim() && !isLoading ? styles.sendBtnActive : ''}`}
            onClick={handleSubmit}
            disabled={!question.trim() || isLoading}
            title="Send query"
          >
            <Send size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
export default ChatInput;
