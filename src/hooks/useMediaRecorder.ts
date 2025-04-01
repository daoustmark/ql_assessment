import { useState, useRef, useCallback } from 'react';

interface UseMediaRecorderOptions {
  maxDuration?: number; // in seconds
  onComplete?: (blob: Blob) => void;
  onError?: (error: Error) => void;
}

interface UseMediaRecorderReturn {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  isRecording: boolean;
  isPaused: boolean;
  error: Error | null;
  stream: MediaStream | null;
  duration: number;
}

export function useMediaRecorder({
  maxDuration = 300, // 5 minutes default
  onComplete,
  onError,
}: UseMediaRecorderOptions = {}): UseMediaRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const updateDuration = useCallback(() => {
    if (startTime) {
      const currentDuration = Math.floor((Date.now() - startTime) / 1000);
      setDuration(currentDuration);
      
      if (currentDuration >= maxDuration) {
        stopRecording();
      }
    }
  }, [startTime, maxDuration]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus',
      });

      mediaRecorderRef.current = mediaRecorder;
      streamRef.current = stream;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        onComplete?.(blob);
        cleanup();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setStartTime(Date.now());
      setError(null);

      // Start duration timer
      timerRef.current = setInterval(updateDuration, 1000);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start recording');
      setError(error);
      onError?.(error);
    }
  }, [onComplete, onError, updateDuration]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      cleanup();
    }
  }, [isRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [isRecording, isPaused]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      setStartTime(Date.now() - (duration * 1000));
      timerRef.current = setInterval(updateDuration, 1000);
    }
  }, [isRecording, isPaused, duration, updateDuration]);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
    setStartTime(null);
  }, []);

  return {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    isRecording,
    isPaused,
    error,
    stream: streamRef.current,
    duration,
  };
} 