import React, { useRef, useEffect } from 'react';
import { useAssistant } from '../state/AssistantContext';
import { ChatBubble } from '../components/chat/ChatBubble';
import { ChatInput } from '../components/chat/ChatInput';
import { LoadingState } from '../components/common/LoadingState';
import { useAudioPlayback } from '../hooks/useAudioPlayback';
import { useSettings } from '../state/SettingsContext';
import { BookOpen, Download, RotateCcw, Cpu, FileText } from 'lucide-react';
import styles from './DashboardPage.module.css';

export const DashboardPage: React.FC = () => {
  const { 
    sessions, 
    activeSessionId, 
    messages, 
    isLoading, 
    clearChat 
  } = useAssistant();
  
  const { voiceAutoplay } = useSettings();
  const { isPlaying, playingMessageId, playMessageAudio } = useAudioPlayback();

  const chatEndRef = useRef<HTMLDivElement>(null);
  const lastPlayedMessageIdRef = useRef<string | null>(null);

  // Auto-play TTS when a new voice assistant message is received
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];

    if (
      lastMsg.role === 'assistant' &&
      lastMsg.audioBase64 &&
      voiceAutoplay &&
      lastPlayedMessageIdRef.current !== lastMsg.id
    ) {
      lastPlayedMessageIdRef.current = lastMsg.id;
      playMessageAudio(lastMsg.id, lastMsg.audioBase64);
    }
  }, [messages, voiceAutoplay, playMessageAudio]);
  
  // Auto-scroll to bottom of thread
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Export Chat to Markdown
  const exportToMarkdown = () => {
    if (messages.length === 0) return;
    
    let markdown = `# Research Assistant Chat Session\n\n`;
    markdown += `*Date: ${new Date().toLocaleDateString()}*\n\n`;
    markdown += `---\n\n`;

    messages.forEach((msg) => {
      const roleName = msg.role === 'user' ? '### User' : '### AI Assistant';
      markdown += `${roleName}\n\n${msg.content}\n\n`;
      if (msg.modelName) {
        markdown += `*Model: ${msg.modelName} | Net Retrieval Chunks: ${msg.retrievedChunks?.length || 0}*\n\n`;
      }
      markdown += `---\n\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const session = sessions.find(s => s.id === activeSessionId);
    const titleClean = session ? session.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'chat_session';
    link.setAttribute('download', `${titleClean}_export.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Suggested Follow-up Questions
  const getSuggestedQuestions = () => {
    if (messages.length === 0) return [];
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'assistant' || !lastMessage.content) return [];

    const text = lastMessage.content.toLowerCase();
    const suggestions: string[] = [];

    if (text.includes('method') || text.includes('propose') || text.includes('approach')) {
      suggestions.push("Can you detail the mathematical formulations of this method?");
      suggestions.push("What datasets were used to evaluate this algorithm?");
    } else if (text.includes('results') || text.includes('evaluat') || text.includes('perform')) {
      suggestions.push("How does it compare against competitive baselines?");
      suggestions.push("What were the main limitations observed in evaluation metrics?");
    } else if (text.includes('rag') || text.includes('retriev') || text.includes('documents')) {
      suggestions.push("What is the chunking strategy and embedding model used?");
      suggestions.push("Explain how the retrieval distance score is calculated.");
    } else {
      suggestions.push("Explain the implications of this finding in detail.");
      suggestions.push("Does the paper address future work or scalability?");
    }
    
    return suggestions.slice(0, 2);
  };

  const handleSuggestedClick = (question: string) => {
    const event = new CustomEvent('ask-suggested-question', { detail: question });
    window.dispatchEvent(event);
  };

  const suggestedQuestions = getSuggestedQuestions();

  return (
    <div className={styles.container}>
      {/* Main Workspace Frame */}
      <div className={styles.chatContentPanel}>
        {/* Workspace controls header */}
        <header className={styles.chatContentHeader}>
          <div className={styles.chatHeaderLeft}>
            <span className={styles.chatHeaderTitle}>
              {messages.length > 0 
                ? `Active: ${sessions.find(s => s.id === activeSessionId)?.title || ''}`
                : 'New Conversation'}
            </span>
          </div>
          {messages.length > 0 && (
            <div className={styles.chatHeaderControls}>
              <button 
                className={styles.controlHeaderBtn} 
                onClick={exportToMarkdown}
                title="Export Active Chat to Markdown"
              >
                <Download size={14} />
                <span className={styles.btnText}>Export Session</span>
              </button>
              <button 
                className={styles.controlHeaderBtn} 
                onClick={clearChat}
                title="Clear Current Conversation Thread"
              >
                <RotateCcw size={14} />
                <span className={styles.btnText}>Reset Chat</span>
              </button>
            </div>
          )}
        </header>

        <div className={`${styles.chatWorkspace} ${messages.length === 0 ? styles.chatWorkspaceEmpty : ''}`}>
          {messages.length === 0 ? (
            <div className={styles.welcomePanel}>
              <div className={styles.welcomeGraphic}>
                <BookOpen size={40} className={styles.graphicIcon} />
                <div className={`${styles.ring} ${styles.glow1}`} />
                <div className={`${styles.ring} ${styles.glow2}`} />
              </div>
              <h2>Explore Your Academic Documents</h2>
              <p>
                Ask deep, context-aware questions from your research papers. The semantic pipeline will search and supply page citations alongside the answer.
              </p>
              <div className={styles.guideCard}>
                <h4>💡 Example questions to try:</h4>
                <ul>
                  <li onClick={() => handleSuggestedClick("What are the core methodologies proposed in the paper?")}>What are the core methodologies proposed in the paper?</li>
                  <li onClick={() => handleSuggestedClick("Summarize the primary contributions or results of this paper.")}>Summarize the primary contributions or results of this paper.</li>
                  <li onClick={() => handleSuggestedClick("What is Retrieval Augmented Generation (RAG)?")}>What is Retrieval Augmented Generation (RAG)?</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className={styles.messagesList}>
              {messages.map((msg, index) => {
                const isLast = index === messages.length - 1;
                const isLastAssistant = isLast && msg.role === 'assistant';
                return (
                  <ChatBubble 
                    key={msg.id} 
                    message={msg}
                    isPlaying={isPlaying}
                    playingMessageId={playingMessageId}
                    onPlayAudio={playMessageAudio}
                    suggestedQuestions={isLastAssistant ? suggestedQuestions : undefined}
                    onSuggestedClick={handleSuggestedClick}
                  />
                );
              })}
              
              {isLoading && !messages.some(msg => msg.role === 'assistant' && (msg.isStreaming || msg.pipelineSteps)) && (
                <div className={styles.loadingContainer}>
                  <LoadingState label="Querying RAG Vector pipeline..." variant="Drive" />
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        <footer className={styles.footerWrapper}>
          <ChatInput />
        </footer>
      </div>
    </div>
  );
};

export default DashboardPage;
