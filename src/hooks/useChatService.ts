import { useAssistant, PipelineStep } from '../state/AssistantContext';
import { useSettings } from '../state/SettingsContext';

export const useChatService = () => {
  const {
    messages,
    addMessage,
    updateMessageContent,
    setIsLoading,
    setError,
  } = useAssistant();

  const { model, apiBaseUrl } = useSettings();

  const getInitialSteps = (): PipelineStep[] => [
    { name: 'text_extract', label: 'text extract', status: 'pending' },
    { name: 'chunking', label: 'chunking', status: 'pending' },
    { name: 'embedding', label: 'Embedding', status: 'pending' },
    { name: 'vector_store', label: 'vector store', status: 'pending' },
    { name: 'query_embedding', label: 'query Embedding', status: 'pending' },
    { name: 'similarity_search', label: 'vector similarity search', status: 'pending' },
    { name: 'top_k', label: 'top-k', status: 'pending' },
  ];

  const sendQuestionSync = async (question: string) => {
    setIsLoading(true);
    setError(null);

    // 1. Prepare history list from existing messages
    const historyRequest = messages
      .filter((msg) => !msg.content.startsWith('Error:') && !msg.content.startsWith('Initializing') && msg.content !== '')
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

    // 2. Add User Message
    addMessage({
      role: 'user',
      content: question,
    });

    const initialSteps = getInitialSteps();

    // 3. Prepare Assistant Message Placeholder
    const assistantMsgId = addMessage({
      role: 'assistant',
      content: '',
      isStreaming: false,
      pipelineSteps: initialSteps,
    });

    try {
      const response = await fetch(
        `${apiBaseUrl}/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question,
            model_name: model,
            history: historyRequest,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();

      const responseSteps = data.pipeline_steps
        ? data.pipeline_steps.map((s: any) => ({
            name: s.name,
            label: s.name === 'text_extract' ? 'text extract' :
                   s.name === 'chunking' ? 'chunking' :
                   s.name === 'embedding' ? 'Embedding' :
                   s.name === 'vector_store' ? 'vector store' :
                   s.name === 'query_embedding' ? 'query Embedding' :
                   s.name === 'similarity_search' ? 'vector similarity search' :
                   s.name === 'top_k' ? 'top-k' : s.name,
            status: s.status,
            latency_ms: s.latency_ms,
          }))
        : initialSteps.map(step => ({ ...step, status: 'done' as const }));

      updateMessageContent(assistantMsgId, data.answer, {
        modelName: data.model_name,
        retryAttempts: data.retry_attempts,
        retrievedChunks: data.retrieved_chunks,
        pipelineSteps: responseSteps,
        latencyMetrics: data.latency_metrics,
      });
    } catch (err: any) {
      console.error('Error fetching chat response:', err);
      setError(err.message || 'Failed to get a response from the server.');
      updateMessageContent(assistantMsgId, 'Error: Failed to fetch response. Please verify the backend is running.', {
        isStreaming: false,
        pipelineSteps: initialSteps.map(step => ({ ...step, status: 'failed' as const })),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendQuestionStream = async (question: string) => {
    setIsLoading(true);
    setError(null);

    // 1. Prepare history list from existing messages
    const historyRequest = messages
      .filter((msg) => !msg.content.startsWith('Error:') && !msg.content.startsWith('Initializing') && msg.content !== '')
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

    // 2. Add User Message
    addMessage({
      role: 'user',
      content: question,
    });

    let currentSteps = getInitialSteps();

    // 3. Prepare Assistant Message Placeholder (Streaming starts immediately)
    const assistantMsgId = addMessage({
      role: 'assistant',
      content: '',
      isStreaming: true,
      pipelineSteps: currentSteps,
    });

    try {
      const response = await fetch(
        `${apiBaseUrl}/chat/stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question,
            model_name: model,
            history: historyRequest,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Readable stream not supported by server response.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      let done = false;
      let streamBuffer = '';
      let assistantText = '';
      let detectedModel = '';
      let detectedAttempts = 1;
      let isMetadataPhase = true;
      let retrievedChunksList: any[] = [];
      let latencyMetricsVal: any = undefined;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          streamBuffer += chunk;

          // Parse metadata phase lines
          while (isMetadataPhase) {
            const lineEnd = streamBuffer.indexOf('\n');
            if (lineEnd === -1) {
              break; 
            }
            const line = streamBuffer.substring(0, lineEnd).trim();
            streamBuffer = streamBuffer.substring(lineEnd + 1);

            if (line.startsWith('__STEP__:')) {
              const parts = line.split(':');
              if (parts.length >= 3) {
                const stepName = parts[1];
                const stepStatus = parts[2].trim() as 'active' | 'done' | 'cached' | 'failed';
                const latencyMs = parts[3] ? parseFloat(parts[3]) : undefined;
                currentSteps = currentSteps.map(step => 
                  step.name === stepName ? { ...step, status: stepStatus, latency_ms: latencyMs } : step
                );
                
                updateMessageContent(assistantMsgId, '', {
                  isStreaming: true,
                  pipelineSteps: [...currentSteps],
                });
              }
            } else if (line.startsWith('__RETRIEVED_CHUNKS__:')) {
              const jsonStr = line.substring('__RETRIEVED_CHUNKS__:'.length);
              try {
                retrievedChunksList = JSON.parse(jsonStr);
              } catch (e) {
                console.error("Failed to parse retrieved chunks:", e);
              }
            } else if (line.startsWith('__LATENCY_METRICS__:')) {
              const jsonStr = line.substring('__LATENCY_METRICS__:'.length);
              try {
                latencyMetricsVal = JSON.parse(jsonStr);
              } catch (e) {
                console.error("Failed to parse latency metrics:", e);
              }
            } else if (line.startsWith('Model:')) {
              detectedModel = line.substring(6).trim();
            } else if (line.startsWith('Attempts:')) {
              detectedAttempts = parseInt(line.substring(9).trim(), 10) || 1;
            } else if (line === '') {
              if (detectedModel) {
                isMetadataPhase = false;
              }
            } else {
              isMetadataPhase = false;
              // Put the line back so it can be parsed as LLM response content
              streamBuffer = line + '\n' + streamBuffer;
            }
          }

          // Consume LLM answer chunks
          if (!isMetadataPhase && streamBuffer.length > 0) {
            if (streamBuffer.includes('Model:') && streamBuffer.includes('Attempts:')) {
              const lines = streamBuffer.split('\n');
              const remainingLines: string[] = [];
              for (const l of lines) {
                if (l.startsWith('Model:')) {
                  detectedModel = l.substring(6).trim();
                } else if (l.startsWith('Attempts:')) {
                  detectedAttempts = parseInt(l.substring(9).trim(), 10) || 1;
                } else {
                  remainingLines.push(l);
                }
              }
              streamBuffer = remainingLines.join('\n');
            }

            assistantText += streamBuffer;
            streamBuffer = '';

            updateMessageContent(assistantMsgId, assistantText, {
              isStreaming: true,
              modelName: detectedModel,
              retryAttempts: detectedAttempts,
              pipelineSteps: [...currentSteps],
              retrievedChunks: retrievedChunksList.length > 0 ? retrievedChunksList : undefined,
              latencyMetrics: latencyMetricsVal,
            });
          }
        }
      }

      // Final closure update
      updateMessageContent(assistantMsgId, assistantText, {
        isStreaming: false,
        modelName: detectedModel || undefined,
        retryAttempts: detectedAttempts || undefined,
        pipelineSteps: currentSteps.map(step => 
          step.status === 'active' || step.status === 'pending'
            ? { ...step, status: 'done' as const }
            : step
        ),
        retrievedChunks: retrievedChunksList.length > 0 ? retrievedChunksList : undefined,
        latencyMetrics: latencyMetricsVal,
      });

    } catch (err: any) {
      console.error('Error fetching stream response:', err);
      setError(err.message || 'Stream connection failed.');
      updateMessageContent(
        assistantMsgId,
        'Error: Streaming connection failed. Please ensure the backend is running.',
        {
          isStreaming: false,
          pipelineSteps: currentSteps.map(step => 
            step.status === 'pending' || step.status === 'active'
              ? { ...step, status: 'failed' as const }
              : step
          ),
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const sendVoiceQuestion = async (audioBlob: Blob) => {
    setIsLoading(true);
    setError(null);

    // 1. Add User Message placeholder
    const userMsgId = addMessage({
      role: 'user',
      content: '🎙️ Sending voice query...',
    });

    const initialSteps = getInitialSteps();

    // 2. Prepare Assistant Message Placeholder
    const assistantMsgId = addMessage({
      role: 'assistant',
      content: '',
      isStreaming: false,
      pipelineSteps: initialSteps,
    });

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');

      const response = await fetch(`${apiBaseUrl}/voice/process`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();

      // Update User Message content with transcribed text
      updateMessageContent(userMsgId, data.transcription || '🎙️ (Audio Query)');

      const responseSteps = data.pipeline_steps
        ? data.pipeline_steps.map((s: any) => ({
            name: s.name,
            label: s.name === 'text_extract' ? 'text extract' :
                   s.name === 'chunking' ? 'chunking' :
                   s.name === 'embedding' ? 'Embedding' :
                   s.name === 'vector_store' ? 'vector store' :
                   s.name === 'query_embedding' ? 'query Embedding' :
                   s.name === 'similarity_search' ? 'vector similarity search' :
                   s.name === 'top_k' ? 'top-k' : s.name,
            status: s.status,
            latency_ms: s.latency_ms,
          }))
        : initialSteps.map(step => ({ ...step, status: 'done' as const }));

      // Update Assistant Message with answer and base64 audio
      updateMessageContent(assistantMsgId, data.answer, {
        audioBase64: data.audio_base64,
        modelName: data.model_name || 'Gemini (Voice Mode)',
        retryAttempts: data.retry_attempts || 1,
        retrievedChunks: data.retrieved_chunks,
        pipelineSteps: responseSteps,
        latencyMetrics: data.latency_metrics,
      });

      return {
        assistantMsgId,
        audioBase64: data.audio_base64,
        transcription: data.transcription,
        answer: data.answer,
      };
    } catch (err: any) {
      console.error('Error fetching voice response:', err);
      setError(err.message || 'Failed to process voice command.');
      
      updateMessageContent(userMsgId, '🎙️ (Voice Recording)');
      updateMessageContent(assistantMsgId, 'Error: Failed to process voice query. Please verify the backend is running.', {
        isStreaming: false,
        pipelineSteps: initialSteps.map(step => ({ ...step, status: 'failed' as const })),
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendQuestionSync,
    sendQuestionStream,
    sendVoiceQuestion,
  };
};
