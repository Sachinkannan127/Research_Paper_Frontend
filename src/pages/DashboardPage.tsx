import React, { useRef, useEffect, useState } from 'react';
import { useAssistant } from '../state/AssistantContext';
import { ChatBubble } from '../components/chat/ChatBubble';
import { ChatInput } from '../components/chat/ChatInput';
import { Loader } from '../components/common/Loader';
import { 
  BookOpen, Plus, Trash2, Edit3, Check, X, Download, RotateCcw, 
  MessageSquare, Sparkles 
} from 'lucide-react';
import styles from './DashboardPage.module.css';

export const DashboardPage: React.FC = () => {
  const { 
    sessions, 
    activeSessionId, 
    messages, 
    isLoading, 
    createSession, 
    deleteSession, 
    renameSession, 
    setActiveSessionId,
    clearChat 
  } = useAssistant();
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Renaming State
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Auto-scroll to bottom of thread
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleStartRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(id);
    setEditingTitle(currentTitle);
  };

  const handleSaveRename = (id: string, e?: React.FormEvent) => {
    e?.preventDefault();
    if (editingTitle.trim()) {
      renameSession(id, editingTitle.trim());
    }
    setEditingSessionId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(null);
  };

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
      {/* Sub Sidebar: Chat sessions list */}
      <aside className={styles.subSidebar}>
        <div className={styles.subSidebarHeader}>
          <button className={styles.newChatBtn} onClick={() => createSession()}>
            <Plus size={16} />
            <span>New Chat</span>
          </button>
        </div>
        
        <div className={styles.sessionList}>
          {sessions.map((s) => {
            const isActive = s.id === activeSessionId;
            const isEditing = s.id === editingSessionId;

            return (
              <div
                key={s.id}
                className={`${styles.sessionItem} ${isActive ? styles.sessionItemActive : ''}`}
                onClick={() => !isEditing && setActiveSessionId(s.id)}
              >
                {isEditing ? (
                  <form 
                    className={styles.renameForm} 
                    onSubmit={(e) => handleSaveRename(s.id, e)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      className={styles.renameInput}
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      autoFocus
                    />
                    <button type="submit" className={styles.iconVerifyBtn} title="Save">
                      <Check size={13} />
                    </button>
                    <button type="button" className={styles.iconVerifyBtn} onClick={handleCancelRename} title="Cancel">
                      <X size={13} />
                    </button>
                  </form>
                ) : (
                  <>
                    <div className={styles.sessionIconLabel}>
                      <MessageSquare size={14} className={styles.bubbleIcon} />
                      <span className={styles.sessionTitle}>{s.title}</span>
                    </div>
                    {isActive && (
                      <div className={styles.sessionActions}>
                        <button
                          className={styles.sessionActionBtn}
                          onClick={(e) => handleStartRename(s.id, s.title, e)}
                          title="Rename Session"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          className={styles.sessionActionBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSession(s.id);
                          }}
                          title="Delete Session"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className={styles.chatContentPanel}>
        {/* Workspace controls header */}
        {messages.length > 0 && (
          <header className={styles.chatContentHeader}>
            <span className={styles.chatHeaderTitle}>
              Active Conversation: {sessions.find(s => s.id === activeSessionId)?.title}
            </span>
            <div className={styles.chatHeaderControls}>
              <button 
                className={styles.controlHeaderBtn} 
                onClick={exportToMarkdown}
                title="Export Active Chat to Markdown"
              >
                <Download size={14} />
                <span>Export Session</span>
              </button>
              <button 
                className={styles.controlHeaderBtn} 
                onClick={clearChat}
                title="Clear Current Conversation Thread"
              >
                <RotateCcw size={14} />
                <span>Reset Chat</span>
              </button>
            </div>
          </header>
        )}

        <div className={styles.chatWorkspace}>
          {messages.length === 0 ? (
            <div className={styles.welcomePanel}>
              <div className={styles.welcomeGraphic}>
                <BookOpen size={48} className={styles.graphicIcon} />
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
                  <li>What are the core methodologies proposed in the paper?</li>
                  <li>Summarize the primary contributions or results of this paper.</li>
                  <li>What is Retrieval Augmented Generation (RAG)?</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className={styles.messagesList}>
              {messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}
              
              {isLoading && !messages.some(msg => msg.role === 'assistant' && (msg.isStreaming || msg.pipelineSteps)) && (
                <div className={styles.loadingContainer}>
                  <Loader message="Querying RAG Vector pipeline..." />
                </div>
              )}

              {/* Suggestions Panel */}
              {!isLoading && suggestedQuestions.length > 0 && (
                <div className={styles.suggestionsContainer}>
                  <div className={styles.suggestHeader}>
                    <Sparkles size={13} className={styles.suggestSparkle} />
                    <span>Suggested follow-up questions:</span>
                  </div>
                  <div className={styles.suggestList}>
                    {suggestedQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        className={styles.suggestCard}
                        onClick={() => handleSuggestedClick(q)}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
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
