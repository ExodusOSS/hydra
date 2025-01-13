import { useEffect, useState } from 'react'
import { Clipboard } from 'react-native'

/* use Clipboard from react-native api

usage
```javascript

const { handleCopyPress, copied } = useClipboard({ onCopyPress, copyValue })

```
*/

const useClipboard = ({ onCopyPress, copyValue } = {}) => {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return

    const id = setTimeout(() => setCopied(false), 1000)
    return () => clearTimeout(id)
  }, [copied, setCopied])

  const handleCopyPress = () => {
    if (onCopyPress) {
      onCopyPress()
    }

    Clipboard.setString(copyValue)
    setCopied(true)
  }

  return {
    handleCopyPress,
    copied,
  }
}

export default useClipboard
