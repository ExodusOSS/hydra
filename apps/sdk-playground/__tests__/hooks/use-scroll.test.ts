import { act, renderHook } from '@testing-library/react'
import { useRef } from 'react'

import useScroll from '@/ui/hooks/use-scroll'

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}))

describe('useScroll', () => {
  let mockElement: HTMLDivElement

  beforeEach(() => {
    jest.useFakeTimers()

    // Create a mock element
    mockElement = {
      scrollTop: 0,
      scrollLeft: 0,
      scrollHeight: 200,
      scrollWidth: 200,
      clientHeight: 100,
      clientWidth: 100,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    } as any
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  test('initializes with correct default state', () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null)
      ref.current = mockElement
      return useScroll(ref)
    })

    // Fast forward to let debounced function execute
    act(() => {
      jest.advanceTimersByTime(100)
    })

    expect(result.current.isOverflowing).toBe(true) // scrollHeight > clientHeight
    expect(result.current.isScrolledToStart).toBe(true) // scrollTop === 0
    expect(result.current.isScrolledToEnd).toBe(false) // not at bottom
  })

  test('detects when scrolled to end (y-axis)', () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null)
      ref.current = mockElement
      return useScroll(ref)
    })

    // Simulate scrolling to bottom
    act(() => {
      mockElement.scrollTop = 100 // scrollTop + clientHeight (100) = scrollHeight (200)
      // Trigger scroll event manually since we can't actually scroll in tests
      const scrollCallback = (mockElement.addEventListener as jest.Mock).mock.calls.find(
        (call) => call[0] === 'scroll'
      )?.[1]

      if (scrollCallback) {
        scrollCallback()
      }

      jest.advanceTimersByTime(100)
    })

    expect(result.current.isScrolledToStart).toBe(false)
    expect(result.current.isScrolledToEnd).toBe(true)
  })

  test('works with x-axis scrolling', () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null)
      ref.current = mockElement
      return useScroll(ref, { axis: 'x' })
    })

    act(() => {
      jest.advanceTimersByTime(100)
    })

    expect(result.current.isOverflowing).toBe(true) // scrollWidth > clientWidth
    expect(result.current.isScrolledToStart).toBe(true) // scrollLeft === 0
    expect(result.current.isScrolledToEnd).toBe(false)

    // Simulate scrolling to right
    act(() => {
      mockElement.scrollLeft = 100 // scrollLeft + clientWidth (100) = scrollWidth (200)
      const scrollCallback = (mockElement.addEventListener as jest.Mock).mock.calls.find(
        (call) => call[0] === 'scroll'
      )?.[1]

      if (scrollCallback) {
        scrollCallback()
      }

      jest.advanceTimersByTime(100)
    })

    expect(result.current.isScrolledToStart).toBe(false)
    expect(result.current.isScrolledToEnd).toBe(true)
  })

  test('handles non-overflowing content', () => {
    // Set up element that doesn't overflow
    mockElement.scrollHeight = 100
    mockElement.clientHeight = 100

    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null)
      ref.current = mockElement
      return useScroll(ref)
    })

    act(() => {
      jest.advanceTimersByTime(100)
    })

    expect(result.current.isOverflowing).toBe(false)
    expect(result.current.isScrolledToStart).toBe(true)
    expect(result.current.isScrolledToEnd).toBe(true) // When not overflowing, both start and end are true
  })

  test('adds and removes event listeners correctly', () => {
    const { unmount } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null)
      ref.current = mockElement
      return useScroll(ref)
    })

    // Should add scroll event listener
    expect(mockElement.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function), {
      passive: true,
    })

    // Should set up ResizeObserver
    expect(ResizeObserver).toHaveBeenCalled()

    unmount()

    // Should remove scroll event listener
    expect(mockElement.removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function))
  })

  test('handles null ref gracefully', () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null)
      // ref.current remains null
      return useScroll(ref)
    })

    // Should not crash and return default state
    expect(result.current.isOverflowing).toBe(false)
    expect(result.current.isScrolledToStart).toBe(true)
    expect(result.current.isScrolledToEnd).toBe(false)
  })

  test('updates when ref changes', () => {
    const { result, rerender } = renderHook(
      ({ element }) => {
        const ref = useRef<HTMLDivElement>(null)
        ref.current = element
        return useScroll(ref)
      },
      { initialProps: { element: mockElement } }
    )

    act(() => {
      jest.advanceTimersByTime(100)
    })

    expect(result.current.isOverflowing).toBe(true)

    // Change to non-overflowing element
    const newElement = {
      ...mockElement,
      scrollHeight: 50,
      clientHeight: 100,
    } as any

    rerender({ element: newElement })

    act(() => {
      jest.advanceTimersByTime(100)
    })

    expect(result.current.isOverflowing).toBe(false)
  })

  test('debounces scroll position checks', () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null)
      ref.current = mockElement
      return useScroll(ref)
    })

    const scrollCallback = (mockElement.addEventListener as jest.Mock).mock.calls.find(
      (call) => call[0] === 'scroll'
    )?.[1]

    // Simulate rapid scroll events
    act(() => {
      if (scrollCallback) {
        scrollCallback()
        scrollCallback()
        scrollCallback()
      }

      // Should not execute immediately due to debouncing
      expect(result.current.isScrolledToStart).toBe(true)

      // Execute after debounce delay
      jest.advanceTimersByTime(100)
    })

    // Should have processed the scroll events
    expect(result.current.isScrolledToStart).toBe(true)
  })
})
