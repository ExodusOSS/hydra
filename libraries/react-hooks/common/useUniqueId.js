import { useState } from 'react'

let id = 0

// Unique id for SVG generator
//
// ```javascript
// const id = useUniqueId()
// ```

const useUniqueId = () => {
  const [res] = useState(() => id++)

  // svg id's should start with a letter
  return `a${res}`
}

export default useUniqueId
