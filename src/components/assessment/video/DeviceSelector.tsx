import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface DeviceSelectorProps {
  selectedVideoDevice: string | null
  selectedAudioDevice: string | null
  onVideoDeviceSelect: (deviceId: string) => void
  onAudioDeviceSelect: (deviceId: string) => void
  onTestDevices: () => void
  onShowQuickTest?: () => void
}

export function DeviceSelector({
  selectedVideoDevice,
  selectedAudioDevice,
  onVideoDeviceSelect,
  onAudioDeviceSelect,
  onTestDevices,
  onShowQuickTest
}: DeviceSelectorProps) {
  const [availableVideoDevices, setAvailableVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [availableAudioDevices, setAvailableAudioDevices] = useState<MediaDeviceInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const enumerateDevices = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // First request permission to access devices
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      
      const devices = await navigator.mediaDevices.enumerateDevices()
      
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      const audioDevices = devices.filter(device => device.kind === 'audioinput')
      
      setAvailableVideoDevices(videoDevices)
      setAvailableAudioDevices(audioDevices)
      
      // Set default devices if none selected
      if (!selectedVideoDevice && videoDevices.length > 0) {
        onVideoDeviceSelect(videoDevices[0].deviceId)
      }
      if (!selectedAudioDevice && audioDevices.length > 0) {
        onAudioDeviceSelect(audioDevices[0].deviceId)
      }
      
    } catch (error) {
      console.error('Error enumerating devices:', error)
      setError('Could not access media devices. Please check permissions.')
    } finally {
      setLoading(false)
    }
  }

  // Auto-enumerate devices when component mounts
  useEffect(() => {
    enumerateDevices()
  }, [])

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Detecting devices...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 text-sm mb-3">{error}</p>
        <Button 
          onClick={enumerateDevices}
          variant="outline"
          size="sm"
          className="bg-red-100 border-red-300 text-red-700 hover:bg-red-200"
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div className="text-center mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Select Your Devices</h4>
        <p className="text-sm text-gray-600">
          Choose which camera and microphone you'd like to use for this assessment.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Video Device Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📹 Camera:
          </label>
          <select
            value={selectedVideoDevice || ''}
            onChange={(e) => onVideoDeviceSelect(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableVideoDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId.slice(0, 8)}...`}
              </option>
            ))}
          </select>
        </div>
        
        {/* Audio Device Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🎤 Microphone:
          </label>
          <select
            value={selectedAudioDevice || ''}
            onChange={(e) => onAudioDeviceSelect(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableAudioDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Microphone ${device.deviceId.slice(0, 8)}...`}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex justify-center space-x-3">
        <Button 
          onClick={onTestDevices}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          📷 Test Selected Devices
        </Button>
        
        {onShowQuickTest && (
          <Button 
            onClick={onShowQuickTest}
            variant="outline"
            size="sm"
            className="bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            📷 Quick Test
          </Button>
        )}
      </div>

      {/* Device Info */}
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
        <p className="mb-1">
          <strong>Found:</strong> {availableVideoDevices.length} camera(s), {availableAudioDevices.length} microphone(s)
        </p>
        <p>
          Make sure you've given this website permission to access your camera and microphone.
        </p>
      </div>
    </div>
  )
} 