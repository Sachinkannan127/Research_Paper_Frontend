import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, FileText, Trash2, Save, CheckCircle2, 
  Loader2, Check, AlertCircle 
} from 'lucide-react';
import { useSettings } from '../state/SettingsContext';
import styles from './FormsPage.module.css';

interface IngestionStep {
  name: 'text_extract' | 'chunking' | 'embedding' | 'vector_store';
  label: string;
  status: 'pending' | 'active' | 'done' | 'failed';
}

export const FormsPage: React.FC = () => {
  const { apiBaseUrl, refreshConfig } = useSettings();
  const [isDragging, setIsDragging] = useState(false);
  const [fileObject, setFileObject] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState('You are an expert research assistant. Answer questions strictly based on the provided context from academic papers.');
  const [welcomeMsg, setWelcomeMsg] = useState('Ask me anything about the uploaded research paper!');
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Ingestion State
  const [ingesting, setIngesting] = useState(false);
  const [ingestError, setIngestError] = useState<string | null>(null);
  const [ingestSuccess, setIngestSuccess] = useState<string | null>(null);
  const [ingestSteps, setIngestSteps] = useState<IngestionStep[]>([
    { name: 'text_extract', label: 'Extracting PDF Text', status: 'pending' },
    { name: 'chunking',     label: 'Semantic Text Chunking', status: 'pending' },
    { name: 'embedding',    label: 'Generating Vector Embeddings', status: 'pending' },
    { name: 'vector_store', label: 'Saving to Vector Search Index', status: 'pending' },
  ]);

  // Load configuration on mount
  useEffect(() => {
    let isMounted = true;
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/config`);
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data.system_prompt) setSystemPrompt(data.system_prompt);
          if (data.welcome_message) setWelcomeMsg(data.welcome_message);
          if (data.active_pdf_name) setUploadedFile(data.active_pdf_name);
        }
      } catch (err) {
        console.error('Failed to fetch config', err);
      }
    };
    fetchConfig();
    return () => { isMounted = false; };
  }, [apiBaseUrl]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith('.pdf')) {
      setFileObject(file);
      setUploadedFile(file.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileObject(file);
      setUploadedFile(file.name);
    }
  };

  const handleIngest = async () => {
    setIngesting(true);
    setIngestError(null);
    setIngestSuccess(null);
    setIngestSteps([
      { name: 'text_extract', label: 'Extracting PDF Text', status: 'pending' },
      { name: 'chunking',     label: 'Semantic Text Chunking', status: 'pending' },
      { name: 'embedding',    label: 'Generating Vector Embeddings', status: 'pending' },
      { name: 'vector_store', label: 'Saving to Vector Search Index', status: 'pending' },
    ]);

    try {
      // 1. Upload the file first if we selected a local file
      if (fileObject) {
        const formData = new FormData();
        formData.append('file', fileObject);

        const uploadRes = await fetch(`${apiBaseUrl}/config/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json();
          throw new Error(errData.detail || 'Failed to upload PDF doc to server');
        }
        
        await refreshConfig();
      }

      // 2. Stream the ingestion process
      const ingestRes = await fetch(`${apiBaseUrl}/config/ingest/stream`);
      if (!ingestRes.ok) {
        throw new Error('Failed to initiate vector ingestion stream on backend');
      }

      const reader = ingestRes.body?.getReader();
      if (!reader) {
        throw new Error('No stream response from server');
      }

      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('__STEP__:')) {
            const parts = trimmed.split(':');
            const stepName = parts[1];
            const status = parts[2] as IngestionStep['status'];

            setIngestSteps(prev => prev.map(step => 
              step.name === stepName ? { ...step, status } : step
            ));
          } else if (trimmed.startsWith('Error:')) {
            throw new Error(trimmed.replace('Error:', '').trim());
          } else if (trimmed.startsWith('Successfully ingested')) {
            setIngestSuccess(trimmed);
          }
        }
      }
    } catch (err: any) {
      setIngestError(err.message || 'Ingestion failed');
      // Mark current pending or active steps as failed
      setIngestSteps(prev => prev.map(step => 
        step.status === 'active' || step.status === 'pending'
          ? { ...step, status: 'failed' }
          : step
      ));
    } finally {
      setIngesting(false);
      setFileObject(null);
      await refreshConfig();
    }
  };

  const handleClearDatabase = async () => {
    if (!window.confirm('Are you sure you want to clear the vector database? All stored index embeddings will be deleted.')) {
      return;
    }
    
    try {
      const res = await fetch(`${apiBaseUrl}/config/clear-database`, {
        method: 'POST',
      });
      if (res.ok) {
        setUploadedFile(null);
        setFileObject(null);
        setIngestSuccess('Vector store successfully cleared');
        setIngestError(null);
        alert('Database cleared!');
        await refreshConfig();
      } else {
        const data = await res.json();
        alert(`Failed to clear database: ${data.detail || 'Internal server error'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error clearing database');
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_prompt: systemPrompt,
          welcome_message: welcomeMsg,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        alert('Failed to save configuration settings');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving configuration');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Upload &amp; Configure</h2>
        <p className={styles.pageSub}>Ingest documents, tune system prompts, and manage the vector database.</p>
      </div>

      {/* Drop Zone */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Document Ingestion</h3>
        <div
          className={`${styles.dropZone} ${isDragging ? styles.dragging : ''} ${uploadedFile ? styles.uploaded : ''}`}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !ingesting && fileRef.current?.click()}
          style={{ pointerEvents: ingesting ? 'none' : 'auto' }}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            disabled={ingesting}
          />
          {uploadedFile ? (
            <div className={styles.uploadedState}>
              <FileText size={36} className={styles.uploadedIcon} />
              <span className={styles.uploadedName}>{uploadedFile}</span>
              <span className={styles.uploadedSub}>
                {ingesting ? 'Processing pipeline active...' : 'Ready to ingest · click to replace'}
              </span>
            </div>
          ) : (
            <div className={styles.dropState}>
              <UploadCloud size={40} className={styles.dropIcon} />
              <span className={styles.dropTitle}>Drag &amp; drop a PDF or click to browse</span>
              <span className={styles.dropSub}>Only .pdf files are supported</span>
            </div>
          )}
        </div>

        <div className={styles.ingestActions}>
          <button 
            className={`${styles.btn} ${styles.btnPrimary}`} 
            disabled={!uploadedFile || ingesting}
            onClick={handleIngest}
          >
            {ingesting ? (
              <><Loader2 size={15} className={styles.iconActive} /> Ingesting...</>
            ) : (
              <><UploadCloud size={15} /> Ingest Document</>
            )}
          </button>
          <button 
            className={`${styles.btn} ${styles.btnDanger}`}
            onClick={handleClearDatabase}
            disabled={ingesting}
          >
            <Trash2 size={15} /> Clear Database
          </button>
        </div>

        {/* Stepper Pipeline Progress Display */}
        {(ingesting || ingestSuccess || ingestError) && (
          <div className={styles.progressContainer}>
            <div className={styles.progressTitle}>
              {ingesting ? (
                <><Loader2 size={16} className={styles.iconActive} /> Vectorizing Document Collection...</>
              ) : ingestError ? (
                <><AlertCircle size={16} className={styles.iconFailed} /> Ingestion Terminated</>
              ) : (
                <><CheckCircle2 size={16} className={styles.iconDone} /> Ingestion Task Complete</>
              )}
            </div>

            <div className={styles.stepsList}>
              {ingestSteps.map(step => {
                const isActive = step.status === 'active';
                const isDone = step.status === 'done';
                const isFailed = step.status === 'failed';

                return (
                  <div 
                    key={step.name} 
                    className={`${styles.stepRow} ${isActive ? styles.active : ''} ${isDone ? styles.done : ''}`}
                  >
                    <div className={styles.stepStatusIcon}>
                      {isActive && <Loader2 size={14} className={styles.iconActive} />}
                      {isDone && <Check size={14} className={styles.iconDone} />}
                      {isFailed && <AlertCircle size={14} className={styles.iconFailed} />}
                      {step.status === 'pending' && <div className={styles.iconPending} />}
                    </div>
                    <span className={styles.stepNameLabel}>{step.label}</span>
                  </div>
                );
              })}
            </div>

            {ingestSuccess && (
              <div className={styles.successText}>
                <Check size={14} /> {ingestSuccess}
              </div>
            )}

            {ingestError && (
              <div className={styles.errorText}>
                <AlertCircle size={14} /> {ingestError}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Prompt Config */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Prompt Templates</h3>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>RAG System Prompt</label>
          <textarea
            className={styles.textarea}
            rows={6}
            value={systemPrompt}
            onChange={e => setSystemPrompt(e.target.value)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Welcome Message</label>
          <textarea
            className={styles.textarea}
            rows={2}
            value={welcomeMsg}
            onChange={e => setWelcomeMsg(e.target.value)}
          />
        </div>

        <div className={styles.formActions}>
          <button className={`${styles.btn} ${styles.btnSave}`} onClick={handleSave}>
            {saved
              ? <><CheckCircle2 size={15} /> Saved!</>
              : <><Save size={15} /> Save Templates</>}
          </button>
        </div>
      </section>
    </div>
  );
};

export default FormsPage;
