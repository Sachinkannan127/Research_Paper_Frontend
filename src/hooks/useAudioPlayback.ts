import { useState, useRef, useCallback, useEffect } from 'react';

export const useAudioPlayback = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setPlayingMessageId(null);
  }, []);

  const playMessageAudio = useCallback((messageId: string, base64Data: string) => {
    // If clicking the current playing message, toggle/stop it
    if (isPlaying && playingMessageId === messageId) {
      stopAudio();
      return;
    }

    // Stop currently running playback first
    stopAudio();

    try {
      const audio = new Audio(`data:audio/mp3;base64,${base64Data}`);
      audioRef.current = audio;
      setPlayingMessageId(messageId);
      setIsPlaying(true);

      audio.onended = () => {
        setIsPlaying(false);
        setPlayingMessageId(null);
        audioRef.current = null;
      };

      audio.onerror = (e) => {
        console.error("Audio playback error:", e);
        setIsPlaying(false);
        setPlayingMessageId(null);
        audioRef.current = null;
      };

      audio.play().catch((err) => {
        console.error("Autoplay/play failed:", err);
        setIsPlaying(false);
        setPlayingMessageId(null);
        audioRef.current = null;
      });
    } catch (err) {
      console.error("Failed to play audio:", err);
    }
  }, [isPlaying, playingMessageId, stopAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return {
    isPlaying,
    playingMessageId,
    playMessageAudio,
    stopAudio,
  };
};
