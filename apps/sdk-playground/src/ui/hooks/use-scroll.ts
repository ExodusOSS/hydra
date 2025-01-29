import { useCallback, useEffect, useState, type RefObject } from 'react'

import useDebounceCallback from './use-debounce-callback'

type Axis = 'x' | 'y'

interface UseScrollOptions {
  axis?: Axis
}

interface ScrollState {
  isOverflowing: boolean
  isScrolledToStart: boolean
  isScrolledToEnd: boolean
}

function useScroll(
  scrollRef: RefObject<HTMLDivElement | null>,
  { axis = 'y' }: UseScrollOptions = {}
): ScrollState {
  // State variables
  const [isOverflowing, setIsOverflowing] = useState(false)
  const [isScrolledToStart, setIsScrolledToStart] = useState(true)
  const [isScrolledToEnd, setIsScrolledToEnd] = useState(false)

  const checkScrollPosition = useCallback(() => {
    const element = scrollRef.current
    if (!element) return

    if (axis === 'y') {
      const { scrollTop, scrollHeight, clientHeight } = element

      const isContentOverflowing = scrollHeight > clientHeight
      setIsOverflowing(isContentOverflowing)

      setIsScrolledToStart(scrollTop === 0)
      setIsScrolledToEnd(scrollTop + clientHeight >= scrollHeight)
    } else {
      const { scrollLeft, scrollWidth, clientWidth } = element

      const isContentOverflowing = scrollWidth > clientWidth
      setIsOverflowing(isContentOverflowing)

      setIsScrolledToStart(scrollLeft === 0)
      setIsScrolledToEnd(scrollLeft + clientWidth >= scrollWidth)
    }
  }, [scrollRef, axis])

  const debouncedCheckScrollPosition = useDebounceCallback(checkScrollPosition, 100, {
    leading: true,
  })

  // Add scroll event listener.
  useEffect(() => {
    const element = scrollRef.current
    if (!element) return

    // Perform initial check.
    checkScrollPosition()

    element.addEventListener('scroll', debouncedCheckScrollPosition, {
      passive: true,
    })

    return () => {
      element.removeEventListener('scroll', debouncedCheckScrollPosition)
    }
  }, [scrollRef, checkScrollPosition, debouncedCheckScrollPosition])

  // Add resize observer to watch for scrollable element size changes.
  useEffect(() => {
    const element = scrollRef.current
    if (!element) return

    const resizeObserver = new ResizeObserver(debouncedCheckScrollPosition)

    resizeObserver.observe(element)

    return () => {
      resizeObserver.disconnect()
    }
  }, [scrollRef, debouncedCheckScrollPosition])

  return {
    isOverflowing,
    isScrolledToStart,
    isScrolledToEnd,
  }
}

export default useScroll
