# @exodus/react-native-hooks

React hooks which uses specific react-native API

## Usage

## useClipboard

```javascript
import useClipboard from '@exodus/react-native-hooks/useClipboard'
```

use Clipboard from react-native api

usage

```javascript
const { handleCopyPress, copied } = useClipboard({ onCopyPress, copyValue })
```

## useWindowSize

```javascript
import useWindowSize from '@exodus/react-native-hooks/useWindowSize'
```

return window dimensions using optional uiScale

```javascript
const { width, height } = useWindowSize(1)
```
