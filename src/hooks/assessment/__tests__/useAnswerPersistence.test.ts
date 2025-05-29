import { renderHook, act } from '@testing-library/react'
import { useAnswerPersistence } from '../useAnswerPersistence'
import { saveUserAnswer } from '@/lib/supabase/queries'

// Mock the saveUserAnswer function
jest.mock('@/lib/supabase/queries', () => ({
  saveUserAnswer: jest.fn(),
}))

const mockSaveUserAnswer = saveUserAnswer as jest.MockedFunction<typeof saveUserAnswer>

describe('useAnswerPersistence', () => {
  const mockAttemptId = 123
  const mockAttempt = {
    id: mockAttemptId,
    assessment_id: 1,
    user_id: 'user-123',
    started_at: '2024-01-01T00:00:00Z',
    completed_at: null,
    current_part_id: null,
    auth_users_id: 'auth-123',
    user_answers: [
      {
        id: 1,
        attempt_id: mockAttemptId,
        question_id: 1,
        mcq_option_id: 2,
        text_answer: null,
        likert_rating: null,
        video_response_path: null,
        scenario_id: null,
        scenario_option_id: null,
        answered_at: '2024-01-01T00:05:00Z'
      }
    ]
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockSaveUserAnswer.mockResolvedValue({
      id: 1,
      attempt_id: mockAttemptId,
      question_id: 1,
      mcq_option_id: null,
      text_answer: null,
      likert_rating: null,
      video_response_path: null,
      scenario_id: null,
      scenario_option_id: null,
      answered_at: '2024-01-01T00:05:00Z'
    })
  })

  it('should initialize with empty answers when no attempt provided', () => {
    const { result } = renderHook(() => 
      useAnswerPersistence({ attemptId: mockAttemptId, attempt: null })
    )

    expect(result.current.answers.size).toBe(0)
    expect(result.current.saveStatus).toBe('saved')
  })

  it('should load existing answers from attempt', () => {
    const { result } = renderHook(() => 
      useAnswerPersistence({ attemptId: mockAttemptId, attempt: mockAttempt })
    )

    expect(result.current.answers.size).toBe(1)
    expect(result.current.getAnswer(1)).toEqual({
      text_answer: null,
      mcq_option_id: 2,
      scenario_id: null,
      scenario_option_id: null,
      likert_rating: null,
      video_response_path: null
    })
  })

  it('should handle multiple choice answer changes', async () => {
    const { result } = renderHook(() => 
      useAnswerPersistence({ attemptId: mockAttemptId, attempt: null })
    )

    await act(async () => {
      result.current.handleAnswerChange(1, 'mcq', '3')
    })

    expect(mockSaveUserAnswer).toHaveBeenCalledWith(mockAttemptId, 1, {
      mcq_option_id: 3
    })
  })

  it('should handle text answer changes with debouncing', async () => {
    jest.useFakeTimers()
    
    const { result } = renderHook(() => 
      useAnswerPersistence({ attemptId: mockAttemptId, attempt: null })
    )

    act(() => {
      result.current.handleAnswerChange(1, 'text', 'Test answer')
    })

    // Should not save immediately for text inputs
    expect(mockSaveUserAnswer).not.toHaveBeenCalled()
    expect(result.current.saveStatus).toBe('unsaved')

    // Fast-forward timers to trigger debounced save
    await act(async () => {
      jest.advanceTimersByTime(1000)
    })

    expect(mockSaveUserAnswer).toHaveBeenCalledWith(mockAttemptId, 1, {
      text_answer: 'Test answer'
    })

    jest.useRealTimers()
  })

  it('should handle likert scale answer changes', async () => {
    const { result } = renderHook(() => 
      useAnswerPersistence({ attemptId: mockAttemptId, attempt: null })
    )

    await act(async () => {
      result.current.handleAnswerChange(1, 'likert', '4')
    })

    expect(mockSaveUserAnswer).toHaveBeenCalledWith(mockAttemptId, 1, {
      likert_rating: 4
    })
  })

  it('should handle video answer changes', async () => {
    const { result } = renderHook(() => 
      useAnswerPersistence({ attemptId: mockAttemptId, attempt: null })
    )

    await act(async () => {
      result.current.handleAnswerChange(1, 'video', 'video-url')
    })

    expect(mockSaveUserAnswer).toHaveBeenCalledWith(mockAttemptId, 1, {
      video_response_path: 'video-url'
    })
  })

  it('should update save status when save fails', async () => {
    mockSaveUserAnswer.mockResolvedValue(null)
    
    const { result } = renderHook(() => 
      useAnswerPersistence({ attemptId: mockAttemptId, attempt: null })
    )

    await act(async () => {
      result.current.handleAnswerChange(1, 'mcq', '3')
    })

    expect(result.current.saveStatus).toBe('unsaved')
  })

  it('should handle save errors gracefully', async () => {
    mockSaveUserAnswer.mockRejectedValue(new Error('Network error'))
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    
    const { result } = renderHook(() => 
      useAnswerPersistence({ attemptId: mockAttemptId, attempt: null })
    )

    await act(async () => {
      result.current.handleAnswerChange(1, 'mcq', '3')
    })

    expect(result.current.saveStatus).toBe('unsaved')
    expect(consoleSpy).toHaveBeenCalledWith('Error saving answer:', expect.any(Error))
    
    consoleSpy.mockRestore()
  })

  it('should update lastSavedAt when save succeeds', async () => {
    const { result } = renderHook(() => 
      useAnswerPersistence({ attemptId: mockAttemptId, attempt: null })
    )

    const beforeTime = new Date()
    
    await act(async () => {
      result.current.handleAnswerChange(1, 'mcq', '3')
    })

    const afterTime = new Date()
    
    expect(result.current.lastSavedAt).toBeInstanceOf(Date)
    expect(result.current.lastSavedAt!.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime())
    expect(result.current.lastSavedAt!.getTime()).toBeLessThanOrEqual(afterTime.getTime())
  })
}) 