import { useEffect } from 'react'

// Shortcut to useEffect without deps that runs once per mount
//
// ```javascript
// useMountEffect(() => {
//     ...some code for mounted state only
// })
// ```
const useMountEffect = (callback) => useEffect(callback, []) // oxlint-disable-line react/exhaustive-deps

export default useMountEffect
