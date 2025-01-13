# common

## useAsync

```javascript
import useAsync from '@exodus/react-hooks/common/useAsync'
```

Use to handle any async loading process

```javascript
const { value, loading, error } = useAsync(() => fetch('something'), [])
```

## useCurrentCallback

```javascript
import useCurrentCallback from '@exodus/react-hooks/common/useCurrentCallback'
```

Use to prevent race-conditions in async operations, when you are not sure callback is same in exact moment as on start

```javascript
const onSearchOrders = useCurrentCallback(
  (isCurrent) => (searchParams) => {
    api.searchOrders(customerId, searchParams).then((results) => {
      if (isCurrent()) {
        setSearchResults(results)
      }
    })
  },
  [customerId]
)
```

See: https://flufd.github.io/avoiding-race-conditions-use-current-effect
https://github.com/Flufd/use-current-effect/blob/master/src/useCurrentCallback.ts

## useCurrentEffect

```javascript
import useCurrentEffect from '@exodus/react-hooks/common/useCurrentEffect'
```

See: https://flufd.github.io/avoiding-race-conditions-use-current-effect

```javascript
useCurrentEffect(
  (isCurrent) => {
    api.searchOrders(customerId, searchParams).then((results) => {
      if (isCurrent()) {
        setSearchResults(results)
      }
    })
  },
  [customerId]
)
```

## useDebounceValue

```javascript
import useDebounceValue from '@exodus/react-hooks/common/useDebounceValue'
```

https://usehooks.com/useDebounce/

```javascript
const debouncedValue = useDebounceValue(value, delay)
```

## useThrottleValue

```javascript
import useThrottleValue from '@exodus/react-hooks/common/useThrottleValue'
```

https://usehooks.com/useThrottle/

```javascript
const throttledValue = useThrottleValue(value, delay)
```

## useFirstMount

```javascript
import useFirstMount from '@exodus/react-hooks/common/useFirstMount'
```

return true it's first component mount

```
const isFirstMount = useFirstMount()
```

## useFuseSearch

```javascript
import useFuseSearch from '@exodus/react-hooks/common/useFuseSearch'
```

returns search results using 'fuse.js' npm library
see https://www.fusejs.io/examples.html for examples how to use it

```
const results = useFuseSearch(data, query, fuseOptions)
```

## useHover

```javascript
import useHover from '@exodus/react-hooks/common/useHover'
```

From https://usehooks.com/useHover/

## useHover.native

```javascript
import useHover.native from '@exodus/react-hooks/common/useHover.native'
```

Not such thing as hovering in mobile

## useInterval

```javascript
import useInterval from '@exodus/react-hooks/common/useInterval'
```

https://overreacted.io/making-setinterval-declarative-with-react-hooks/

```javascript
useInterval(callback, 1000)
```

## useLogRerender

```javascript
import useLogRerender from '@exodus/react-hooks/common/useLogRerender'
```

Print which prop is changed, caused the re-render
withLogRerender(Component)
useLogRerender('Component', props)

## useMemoCompare

```javascript
import useMemoCompare from '@exodus/react-hooks/common/useMemoCompare'
```

inspired by: https://usehooks.com/useMemoCompare/

- - Similar to React.useMemo except it allows for custom/deep comparison of dependecies array.
  -
  - @param {Function} evaluate - Function to run when `deps` changes to calculate the return value.
  - @param {[]} deps - The array of dependencies
  - @param {Function[]} [compareFuncs=[]] - Optional, used to supply custom comparison functions
  - for dependencies. The function corresponding to a dependency will be at the same index
  - in this array as the dependency is in the `deps` array. As such, dependencies with
  - custom compare functions will come first, followed by functions that should use
  - @returns {any} result - Memoized version of the result of executing
  - `evaluate` since the last time `deps` changed.

## useMergeRefs

```javascript
import useMergeRefs from '@exodus/react-hooks/common/useMergeRefs'
```

https://github.com/gregberge/react-merge-refs

```javascript
const mergeRefs = useMergeRefs([ref1, ref2, ref3])
mergeRefs(value)
```

## useMountEffect

```javascript
import useMountEffect from '@exodus/react-hooks/common/useMountEffect'
```

Shortcut to useEffect without deps that runs once per mount

```javascript
useMountEffect(() => {
    ...some code for mounted state only
})
```

## useMounted

```javascript
import useMounted from '@exodus/react-hooks/common/useMounted'
```

Use to get actual mounted state of component

```javascript
const isMounted = useMounted()
```

## useNavigationState

```javascript
import useNavigationState from '@exodus/react-hooks/common/useNavigationState'
```

Manage app navigation state

```javascript
const [value, setValue] = useState() // define storage

const { navigationState, setNavigationState, clearNavigationState } = useNavigationState({
  value,
  setValue,
})
```

## usePrevious

```javascript
import usePrevious from '@exodus/react-hooks/common/usePrevious'
```

Source: https://usehooks.com/usePrevious.

```javascript
const previousValue = usePrevious(value)
const hasChanges = previousValue !== value
```

## useTimeoutFn

```javascript
import useTimeoutFn from '@exodus/react-hooks/common/useTimeoutFn'
```

From: https://github.com/streamich/react-use/blob/master/src/useTimeoutFn.ts

```javascript
const [isReady, clear, set] = useTimeoutFn(callback, 1000)
```

## useUniqueId

```javascript
import useUniqueId from '@exodus/react-hooks/common/useUniqueId'
```

Unique id for SVG generator

```javascript
const id = useUniqueId()
```

## useUpdateEffect

```javascript
import useUpdateEffect from '@exodus/react-hooks/common/useUpdateEffect'
```

useEffect that skips first mount

```javascript
useUpdateEffect(callback, deps)
```
