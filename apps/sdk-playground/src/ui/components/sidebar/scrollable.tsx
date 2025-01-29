import useScroll from '@/ui/hooks/use-scroll'
import { cn } from '@/ui/utils/classnames.js'
import { useRef } from 'react'

function Scrollable({ children }) {
  const ref = useRef(null)

  const { isOverflowing, isScrolledToStart, isScrolledToEnd } = useScroll(ref)

  return (
    <div className="relative isolate -ml-5 flex size-full w-[calc(100%+40px)] flex-col overflow-hidden">
      <div
        className={cn(
          'pointer-events-none absolute -left-6 -right-6 top-0 z-[1] h-24 bg-gradient-to-b from-deep-400 to-transparent transition-all',
          isOverflowing && !isScrolledToStart ? 'opacity-100' : 'opacity-0'
        )}
      />

      <div ref={ref} className="w-full overflow-y-auto px-5 pb-8 scrollbar-hide">
        {children}
      </div>

      <div
        className={cn(
          'pointer-events-none absolute -left-6 -right-6 bottom-0 z-[1] h-24 bg-gradient-to-t from-deep-400 to-transparent transition-all',
          isOverflowing && !isScrolledToEnd ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  )
}

export default Scrollable
