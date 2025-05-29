import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface CameraTestProps {
  selectedVideoDevice: string | null
  selectedAudioDevice: string | null
  onTestComplete?: () => void
  onTestCancel?: () => void
}

export function CameraTest({
  selectedVideoDevice,
  selectedAudioDevice,
  onTestComplete,
  onTestCancel
}: CameraTestProps) {
  const [testStream, setTestStream] = useState<MediaStream | null>(null)
  const [cameraTestPassed, setCameraTestPassed] = useState(false)
  const [micTestPassed, setMicTestPassed] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  
  const testVideoRef = useRef<HTMLVideoElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const startCameraTest = async () => {
    try {
      // Build constraints with selected devices
      const constraints: MediaStreamConstraints = {
        video: selectedVideoDevice ? { deviceId: { exact: selectedVideoDevice } } : true,
        audio: selectedAudioDevice ? { deviceId: { exact: selectedAudioDevice } } : true
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      
      setTestStream(mediaStream)
      
      // Ensure video element is ready and assign stream
      setTimeout(() => {
        if (testVideoRef.current) {
          console.log('Assigning stream to test video element:', mediaStream)
          testVideoRef.current.srcObject = mediaStream
          // Force video to play
          testVideoRef.current.play().catch(err => {
            console.log('Video play failed:', err)
          })
        } else {
          console.log('Test video ref not ready')
        }
      }, 100)

      // Set up audio level monitoring
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(mediaStream)
      
      analyser.smoothingTimeConstant = 0.8
      analyser.fftSize = 1024
      microphone.connect(analyser)
      
      audioContextRef.current = audioContext
      analyserRef.current = analyser
      
      // Start monitoring audio levels
      monitorAudioLevel()
      
      // Auto-mark camera as passed after a brief delay
      setTimeout(() => {
        setCameraTestPassed(true)
      }, 1000)

    } catch (error) {
      console.error('Error accessing camera/microphone:', error)
      alert('Could not access camera and microphone. Please check permissions and try again.')
    }
  }

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)
    
    // Calculate average volume
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
    const normalizedLevel = Math.min(average / 128, 1) // Normalize to 0-1
    
    setAudioLevel(normalizedLevel)
    
    // Auto-mark mic as passed if we detect sound above threshold
    if (normalizedLevel > 0.1) {
      setMicTestPassed(true)
    }
    
    animationFrameRef.current = requestAnimationFrame(monitorAudioLevel)
  }

  const stopCameraTest = () => {
    // Stop test stream
    if (testStream) {
      testStream.getTracks().forEach(track => track.stop())
      setTestStream(null)
    }
    
    // Clean up audio monitoring
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    
    analyserRef.current = null
    setAudioLevel(0)
    setCameraTestPassed(false)
    setMicTestPassed(false)
  }

  // Auto-start test when component mounts
  useEffect(() => {
    startCameraTest()
    return () => {
      stopCameraTest()
    }
  }, [selectedVideoDevice, selectedAudioDevice])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCameraTest()
    }
  }, [])

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {/* Test Video Preview */}
      <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-900">
        <video 
          ref={testVideoRef}
          autoPlay 
          playsInline
          muted
          className="w-full aspect-video object-cover"
        />
        
        {/* Video Loading Indicator */}
        {!cameraTestPassed && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-sm">Starting camera...</p>
            </div>
          </div>
        )}
        
        {/* Test Status Overlay */}
        <div className="absolute top-2 left-2 space-y-1">
          <div className={`flex items-center space-x-2 px-2 py-1 rounded text-xs font-medium ${
            cameraTestPassed 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              cameraTestPassed ? 'bg-green-500' : 'bg-yellow-500'
            }`}></div>
            <span>Camera {cameraTestPassed ? 'Working' : 'Testing...'}</span>
          </div>
          
          <div className={`flex items-center space-x-2 px-2 py-1 rounded text-xs font-medium ${
            micTestPassed 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              micTestPassed ? 'bg-green-500' : 'bg-yellow-500'
            }`}></div>
            <span>Microphone {micTestPassed ? 'Working' : 'Speak to test'}</span>
          </div>
        </div>
      </div>

      {/* Audio Level Indicator */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Audio Level:</span>
          <span className="text-xs text-gray-500">
            {micTestPassed ? '✓ Microphone detected' : 'Speak into your microphone'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-150 ${
              audioLevel > 0.5 ? 'bg-green-500' : 
              audioLevel > 0.2 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.max(audioLevel * 100, 5)}%` }}
          ></div>
        </div>
      </div>

      {/* Test Instructions */}
      <div className="text-sm text-gray-600 space-y-1">
        <p>• You should see yourself in the video preview</p>
        <p>• Speak normally - the audio level bar should move and turn green</p>
        <p>• Both indicators should show "Working" when ready</p>
      </div>

      {/* Troubleshooting */}
      {!cameraTestPassed && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <h5 className="font-medium text-yellow-800 mb-2">Troubleshooting Camera Issues:</h5>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Make sure you've allowed camera permissions in your browser</li>
            <li>• Check that no other apps are using your camera</li>
            <li>• Try refreshing the page if the video doesn't appear</li>
            <li>• Ensure your camera is properly connected</li>
          </ul>
        </div>
      )}

      {/* Test Controls */}
      <div className="flex justify-center space-x-3">
        <Button 
          onClick={stopCameraTest}
          variant="outline"
          size="sm"
        >
          Stop Test
        </Button>
        <Button 
          onClick={onTestCancel}
          variant="outline"
          size="sm"
          className="bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
        >
          🔧 Change Devices
        </Button>
        {cameraTestPassed && micTestPassed && (
          <Button 
            onClick={onTestComplete}
            className="bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            ✓ Test Complete
          </Button>
        )}
      </div>
    </div>
  )
} 