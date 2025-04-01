import React, { useState, useRef } from 'react';
import { useTestSession } from '../../../contexts/TestSessionContext';
import { useNavigate } from 'react-router-dom';
import { Timer } from '../../test/Timer';
import { ProgressIndicator } from '../../test/ProgressIndicator';
import { QuestionContainer } from '../../test/QuestionContainer';
import { Button } from '../../ui/Button';
import { cn } from '../../../utils/cn';

export function VideoRecording() {
  const { session, updateSession } = useTestSession();
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!session) {
    return <div>No active session found</div>;
  }

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        // TODO: Upload video to server
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleNext = async () => {
    try {
      await updateSession({
        ...session,
        currentSection: 'ROLE_PLAY',
      });
      navigate('/test/session');
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <Timer duration={30 * 60} onTimeUp={handleNext} />
        <ProgressIndicator current={2} total={3} />
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Video Recording Section</h2>
        <p className="text-gray-600 mb-6">
          You will have 30 minutes to complete this section. Please ensure your camera and microphone are working properly before starting.
        </p>

        <div className="aspect-video bg-gray-100 rounded-lg mb-6">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover rounded-lg"
          />
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            variant={isRecording ? 'destructive' : 'default'}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Button>
        </div>

        <QuestionContainer
          sessionId={session.id}
          testId={session.testId}
          currentSection="VIDEO_RECORDING"
          onAnswerSubmit={async (questionId, answer) => {
            // TODO: Handle answer submission
          }}
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNext}>Next Section</Button>
      </div>
    </div>
  );
} 