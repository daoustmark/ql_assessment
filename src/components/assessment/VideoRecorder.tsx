'use client';

import React, { useEffect, useRef, useState } from 'react';
import { uploadVideo } from '@/lib/supabase/storage';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface VideoRecorderProps {
  userId: string;
  attemptId: string;
  questionId: string;
  onUploadComplete: (path: string | null) => void;
  maxDuration?: number; // in seconds
}

export default function VideoRecorder({
  userId,
  attemptId,
  questionId,
  onUploadComplete,
  maxDuration = 120, // Default 2 minutes
}: VideoRecorderProps) {
  const [status, setStatus] = useState<'idle' | 'recording' | 'recorded' | 'uploading' | 'uploaded' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      stopRecording();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);
  
  const startRecording = async () => {
    try {
      // Reset state
      chunksRef.current = [];
      setError(null);
      setRecordingTime(0);
      setStatus('recording');
      
      // Request permission to use camera and microphone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      // Store the stream reference
      streamRef.current = stream;
      
      // Display the stream in the video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Initialize the media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        // Create a blob from all chunks
        const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
        setBlob(videoBlob);
        
        // Create a URL for the blob
        const url = URL.createObjectURL(videoBlob);
        setVideoUrl(url);
        
        // Update the video element source
        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.src = url;
        }
        
        setStatus('recorded');
      };
      
      // Start recording
      mediaRecorder.start();
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          // Auto-stop recording if max duration is reached
          if (prev + 1 >= maxDuration) {
            stopRecording();
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            return maxDuration;
          }
          return prev + 1;
        });
      }, 1000);
      
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Could not access camera or microphone');
      setStatus('error');
    }
  };
  
  const stopRecording = () => {
    // Stop the timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Stop the media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    // Stop all tracks on the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };
  
  const resetRecording = () => {
    stopRecording();
    setStatus('idle');
    setRecordingTime(0);
    setBlob(null);
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
    if (videoRef.current) {
      videoRef.current.src = '';
    }
  };
  
  const uploadRecording = async () => {
    if (!blob) {
      setError('No recording to upload');
      return;
    }
    
    try {
      setStatus('uploading');
      
      // Create a File object from the blob
      const file = new File([blob], `video-${Date.now()}.webm`, { type: 'video/webm' });
      
      // Upload the file
      const path = await uploadVideo(file, userId, attemptId, questionId);
      
      if (path) {
        setStatus('uploaded');
        onUploadComplete(path);
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      console.error('Error uploading video:', err);
      setError('Failed to upload video. Please try again.');
      setStatus('error');
      onUploadComplete(null);
    }
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Card className="overflow-hidden">
      <div className="relative bg-bespoke-navy-25 rounded-lg overflow-hidden mb-4">
        <video 
          ref={videoRef} 
          className="w-full rounded-lg aspect-video bg-bespoke-navy-75" 
          autoPlay={status === 'recording'} 
          muted={status === 'recording'} 
          playsInline
          controls={status === 'recorded' || status === 'uploaded'}
        />
        
        {status === 'recording' && (
          <div className="absolute top-4 right-4 bg-error px-3 py-1 rounded-full text-white flex items-center">
            <span className="mr-2 w-3 h-3 rounded-full bg-white animate-pulse"></span>
            {formatTime(recordingTime)} / {formatTime(maxDuration)}
          </div>
        )}
      </div>
      
      {error && (
        <div className="p-4 mb-4 text-sm text-error bg-error bg-opacity-10 border border-error rounded-lg">
          {error}
        </div>
      )}
      
      <div className="flex flex-wrap gap-3 justify-center">
        {status === 'idle' && (
          <Button 
            variant="secondary"
            onClick={startRecording}
            icon={(
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="6" fill="currentColor" />
              </svg>
            )}
          >
            Start Recording
          </Button>
        )}
        
        {status === 'recording' && (
          <Button 
            variant="error"
            onClick={stopRecording}
            icon={(
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="8" y="8" width="8" height="8" fill="currentColor" />
              </svg>
            )}
          >
            Stop Recording
          </Button>
        )}
        
        {status === 'recorded' && (
          <>
            <Button 
              variant="outline"
              onClick={resetRecording}
            >
              Record Again
            </Button>
            <Button 
              variant="secondary"
              onClick={uploadRecording}
              icon={(
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              )}
            >
              Upload Video
            </Button>
          </>
        )}
        
        {status === 'uploading' && (
          <div className="flex items-center gap-3 py-2">
            <span className="loading loading-spinner loading-md text-nomad-blue"></span>
            <span>Uploading video...</span>
          </div>
        )}
        
        {status === 'uploaded' && (
          <div className="flex items-center gap-2 text-constant-green py-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Video uploaded successfully!</span>
          </div>
        )}
      </div>
      
      <div className="text-xs text-bespoke-navy-50 text-center mt-4">
        {status === 'idle' && "Click 'Start Recording' when you're ready. You'll have up to " + formatTime(maxDuration) + " to record."}
        {status === 'recorded' && "Review your recording before uploading. You can re-record if needed."}
      </div>
    </Card>
  );
} 