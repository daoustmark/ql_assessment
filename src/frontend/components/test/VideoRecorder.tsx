import React, { useRef, useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { VideoPlayer } from './VideoPlayer';
import { useMediaRecorder } from '../../hooks/useMediaRecorder';
import { cn } from '../../utils/cn';

interface VideoRecorderProps {
  maxDuration?: number;
  onRecordingComplete: (blob: Blob) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function VideoRecorder({
  maxDuration = 300,
  onRecordingComplete,
  onError,
  className,
}: VideoRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    isRecording,
    isPaused,
    error,
    stream,
    duration,
  } = useMediaRecorder({
    maxDuration,
    onComplete: (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      onRecordingComplete(blob);
    },
    onError,
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    video.srcObject = stream;
    return () => {
      video.srcObject = null;
    };
  }, [stream]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
        {previewUrl ? (
          <VideoPlayer
            src={previewUrl}
            className="h-full w-full"
            controls
          />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover"
            />
            {isRecording && (
              <div className="absolute top-4 right-4 rounded-full bg-red-500 px-3 py-1 text-sm font-medium text-white">
                {formatDuration(duration)}
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex justify-center space-x-4">
        {!previewUrl ? (
          <>
            {!isRecording ? (
              <Button
                onClick={startRecording}
                variant="default"
                disabled={!!error}
              >
                Start Recording
              </Button>
            ) : (
              <>
                {isPaused ? (
                  <Button onClick={resumeRecording} variant="outline">
                    Resume
                  </Button>
                ) : (
                  <Button onClick={pauseRecording} variant="outline">
                    Pause
                  </Button>
                )}
                <Button onClick={stopRecording} variant="ghost">
                  Stop
                </Button>
              </>
            )}
          </>
        ) : (
          <Button
            onClick={() => {
              setPreviewUrl(null);
              startRecording();
            }}
            variant="outline"
          >
            Record Again
          </Button>
        )}
      </div>

      {error && (
        <p className="text-center text-sm text-red-600">
          {error.message}
        </p>
      )}
    </div>
  );
} 