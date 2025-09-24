import { useEffect, useRef } from 'react'
import { useLocation } from 'wouter'

/**
 * Hook that resets scroll position to top when the route changes
 * @returns ref to attach to the scrollable container
 */
export function useScrollReset<T extends HTMLElement>() {
  const [location] = useLocation()
  const scrollRef = useRef<T>(null)

  useEffect(() => {
    // Reset scroll position when location changes
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, 0)
    }
  }, [location])

  return scrollRef
}
