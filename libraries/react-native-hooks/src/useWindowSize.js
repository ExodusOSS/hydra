import { useMemo } from 'react'
import { useWindowDimensions } from 'react-native'

// return window dimensions using optional uiScale
//
// ```javascript
// const { width, height } = useWindowSize(1)
// ```
const useWindowSize = (uiScale = 1) => {
  const state = useWindowDimensions()

  return useMemo(
    () => ({
      width: state.width / uiScale,
      height: state.height / uiScale,
    }),
    [state, uiScale]
  )
}

export default useWindowSize
