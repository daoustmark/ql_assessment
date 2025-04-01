import React, { useRef, useEffect, useState } from 'react';
import { cn } from '../../utils/cn';

interface VideoPlayerProps {
  src: string | Blob;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  onEnded?: () => void;
  onError?: (error: Error) => void;
}

export function VideoPlayer({
  src,
  className,
  controls = true,
  autoPlay = false,
  muted = false,
  onEnded,
  onError,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setIsLoading(false);
    };

    const handleError = () => {
      const error = new Error('Failed to load video');
      setError(error);
      onError?.(error);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
    };
  }, [onError]);

  return (
    <div className={cn('relative w-full', className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p className="text-red-600">Failed to load video</p>
        </div>
      )}
      <video
        ref={videoRef}
        src={typeof src === 'string' ? src : URL.createObjectURL(src)}
        className={cn(
          'w-full rounded-lg bg-gray-100',
          isLoading && 'opacity-0'
        )}
        controls={controls}
        autoPlay={autoPlay}
        muted={muted}
        onEnded={onEnded}
      />
    </div>
  );
} 