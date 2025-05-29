import { useState, useRef, useEffect } from 'react'

interface UseCameraTestProps {
  currentQuestionIndex: number
}

interface UseCameraTestReturn {
  showCameraTest: boolean
  testStream: MediaStream | null
  cameraTestPassed: boolean
  micTestPassed: boolean
  audioLevel: number
  testVideoRef: React.RefObject<HTMLVideoElement | null>
  startCameraTest: (selectedVideoDevice?: string, selectedAudioDevice?: string) => Promise<void>
  stopCameraTest: () => void
}

export function useCameraTest({ currentQuestionIndex }: UseCameraTestProps): UseCameraTestReturn {
  const [showCameraTest, setShowCameraTest] = useState(false)
  const [testStream, setTestStream] = useState<MediaStream | null>(null)
  const [cameraTestPassed, setCameraTestPassed] = useState(false)
  const [micTestPassed, setMicTestPassed] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)

  const testVideoRef = useRef<HTMLVideoElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Reset test states when changing questions
  useEffect(() => {
    setCameraTestPassed(false)
    setMicTestPassed(false)
    setShowCameraTest(false)
    setAudioLevel(0)
    
    // Stop any ongoing test
    if (testStream) {
      stopCameraTest()
    }
  }, [currentQuestionIndex])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (testStream) {
        testStream.getTracks().forEach(track => track.stop())
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  const startCameraTest = async (selectedVideoDevice?: string, selectedAudioDevice?: string) => {
    try {
      // Build constraints with selected devices
      const constraints: MediaStreamConstraints = {
        video: selectedVideoDevice ? { deviceId: { exact: selectedVideoDevice } } : true,
        audio: selectedAudioDevice ? { deviceId: { exact: selectedAudioDevice } } : true
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      
      setTestStream(mediaStream)
      setShowCameraTest(true)
      
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
      throw new Error('Could not access camera and microphone. Please check permissions and try again.')
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
    setShowCameraTest(false)
    setAudioLevel(0)
  }

  return {
    showCameraTest,
    testStream,
    cameraTestPassed,
    micTestPassed,
    audioLevel,
    testVideoRef,
    startCameraTest,
    stopCameraTest
  }
} 