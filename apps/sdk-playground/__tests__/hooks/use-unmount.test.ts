import { renderHook } from '@testing-library/react'

import useUnmount from '@/ui/hooks/use-unmount'

describe('useUnmount', () => {
  test('calls cleanup function on unmount', () => {
    const cleanup = jest.fn()

    const { unmount } = renderHook(() => useUnmount(cleanup))

    // Should not be called initially
    expect(cleanup).not.toHaveBeenCalled()

    // Should be called when component unmounts
    unmount()
    expect(cleanup).toHaveBeenCalledTimes(1)
  })

  test('calls the latest cleanup function', () => {
    const cleanup1 = jest.fn()
    const cleanup2 = jest.fn()

    const { rerender, unmount } = renderHook(({ fn }) => useUnmount(fn), {
      initialProps: { fn: cleanup1 },
    })

    // Update to a new cleanup function
    rerender({ fn: cleanup2 })

    unmount()

    // Should call the latest function, not the first one
    expect(cleanup1).not.toHaveBeenCalled()
    expect(cleanup2).toHaveBeenCalledTimes(1)
  })

  test('does not call cleanup function during renders', () => {
    const cleanup = jest.fn()

    const { rerender } = renderHook(({ fn }) => useUnmount(fn), { initialProps: { fn: cleanup } })

    // Rerender multiple times
    rerender({ fn: cleanup })
    rerender({ fn: cleanup })

    // Cleanup should not be called during renders
    expect(cleanup).not.toHaveBeenCalled()
  })

  test('hook functionality exists', () => {
    const cleanup = jest.fn()

    const { result, unmount } = renderHook(() => useUnmount(cleanup))

    // Hook should not return anything
    expect(result.current).toBeUndefined()

    unmount()
    expect(cleanup).toHaveBeenCalledTimes(1)
  })
})
