import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  },
}))

// Mock Supabase
jest.mock('@/lib/supabase/queries', () => ({
  saveUserAnswer: jest.fn(),
  getAssessmentAttempt: jest.fn(),
  getAssessmentById: jest.fn(),
  updateAssessmentAttemptProgress: jest.fn(),
  completeAssessmentAttempt: jest.fn(),
}))

// Mock MediaRecorder API
global.MediaRecorder = class MockMediaRecorder {
  constructor() {
    this.state = 'inactive'
    this.ondataavailable = null
    this.onstop = null
  }
  
  start() {
    this.state = 'recording'
  }
  
  stop() {
    this.state = 'inactive'
    if (this.onstop) this.onstop()
  }
  
  pause() {
    this.state = 'paused'
  }
  
  resume() {
    this.state = 'recording'
  }
}

// Mock getUserMedia
global.navigator.mediaDevices = {
  getUserMedia: jest.fn(() => 
    Promise.resolve({
      getTracks: () => [],
      getVideoTracks: () => [],
      getAudioTracks: () => [],
    })
  ),
  enumerateDevices: jest.fn(() => Promise.resolve([])),
}

// Mock window.URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url')
global.URL.revokeObjectURL = jest.fn()

// Suppress console warnings in tests
const originalWarn = console.warn
beforeAll(() => {
  console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning:')) {
      return
    }
    originalWarn.call(console, ...args)
  }
})

afterAll(() => {
  console.warn = originalWarn
}) 