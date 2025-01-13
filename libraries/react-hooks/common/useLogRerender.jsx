import React, { useEffect, useRef, forwardRef } from 'react'

// Print which prop is changed, caused the re-render
//
// withLogRerender(Component)
// useLogRerender('Component', props)

export const useLogRerender = (name, props) => {
  const prevProps = useRef(null)
  useEffect(() => {
    if (prevProps.current) {
      for (const [key, currentProp] of Object.entries(props)) {
        const prevProp = prevProps.current[key]
        if (currentProp !== prevProp) {
          console.log(`rerender: <${name}>`, key, [currentProp, prevProp])
        }
      }
    }

    prevProps.current = props
  }, [name, props])
}

export const withLogRerender = (Component) => {
  return forwardRef((props, ref) => {
    useLogRerender(Component.name, props)
    return <Component {...props} ref={ref} />
  })
}
