'use client';

import React, { useEffect, useRef, useState } from 'react';
import { uploadVideo } from '@/lib/supabase/storage';

interface VideoRecorderProps {
  userId: string;
  attemptId: number;
  questionId: number;
  onUploadComplete: (path: string | null) => void;
  maxDuration?: number; // in seconds
}

export function VideoRecorder({
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
      
      // Upload the file using the utility function
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
    <div className="flex flex-col gap-4">
      <div className="relative">
        <video 
          ref={videoRef} 
          className="w-full border rounded-lg aspect-video bg-gray-900" 
          autoPlay={status === 'recording'} 
          muted={status === 'recording'} 
          playsInline
          controls={status === 'recorded' || status === 'uploaded'}
        />
        
        {/* Recording indicator */}
        {status === 'recording' && (
          <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-lg flex items-center gap-2">
            <div className="animate-pulse w-3 h-3 bg-white rounded-full"></div>
            <span>{formatTime(recordingTime)} / {formatTime(maxDuration)}</span>
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {status === 'idle' && (
          <button
            onClick={startRecording}
            className="btn btn-primary"
          >
            Start Recording
          </button>
        )}
        
        {status === 'recording' && (
          <button
            onClick={stopRecording}
            className="btn btn-error"
          >
            Stop Recording
          </button>
        )}
        
        {status === 'recorded' && (
          <>
            <button
              onClick={resetRecording}
              className="btn btn-outline"
            >
              Record Again
            </button>
            <button
              onClick={uploadRecording}
              className="btn btn-primary"
            >
              Upload Recording
            </button>
          </>
        )}
        
        {status === 'uploading' && (
          <button className="btn btn-disabled loading">
            Uploading...
          </button>
        )}
        
        {status === 'uploaded' && (
          <div className="alert alert-success">
            Video uploaded successfully!
          </div>
        )}
        
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}
      </div>
    </div>
  );
} 