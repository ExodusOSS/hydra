import { useRef } from 'react'

function Scrollable({ children }) {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div className="relative flex size-full flex-col overflow-hidden">
      <div ref={ref} className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-2">
        {children}
      </div>
    </div>
  )
}

export default Scrollable
