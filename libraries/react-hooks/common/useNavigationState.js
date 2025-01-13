import { useCallback } from 'react'
import ms from 'ms'

/*
  Manage app navigation state

  ```javascript
    const [value, setValue] = useState() // define storage

    const {
      navigationState,
      setNavigationState,
      clearNavigationState,
    } = useNavigationState({ value, setValue })
  ```
*/

const useNavigationState = ({
  value,
  setValue,
  ignoredRoutes = [],
  ignoredParams = [],
  persistTime = ms('5m'),
} = {}) => {
  const clearNavigationState = () => setValue()

  const navigationState =
    value && Date.now() < value.updatedAt + persistTime ? value.state : undefined

  const setNavigationState = useCallback(
    (state) => {
      const shouldIgnore = (route) => ignoredRoutes.includes(route.name)

      const omitIgnoredRoutes = (routes) => {
        const newRoutes = routes.filter((route) => !shouldIgnore(route))
        return newRoutes.map((route) => {
          if (route.state?.routes) {
            const initialRoutesLength = route.state?.routes.length
            const omittedRoutes = omitIgnoredRoutes(route.state.routes)
            return {
              ...route,
              state: {
                ...route.state,
                index: omittedRoutes.length === initialRoutesLength ? route.state.index : 0, // reset if route omitted
                routes: omittedRoutes,
              },
            }
          }

          return route
        })
      }

      const updatedState = {
        ...state,
        routes: omitIgnoredRoutes(state.routes),
      }

      const removeIgnoredParams = ({ routes }) => {
        routes.forEach(({ params, state }) => {
          if (params) {
            Object.keys(params).forEach((param) => {
              // eslint-disable-next-line @exodus/mutable/no-param-reassign-prop-only
              if (ignoredParams.includes(param)) params[param] = undefined
            })
          }

          if (state) removeIgnoredParams(state)
        })
      }

      removeIgnoredParams(updatedState)

      setValue({
        state: updatedState,
        updatedAt: Date.now(),
      })
    },
    [ignoredParams, ignoredRoutes, setValue]
  )

  return { navigationState, setNavigationState, clearNavigationState }
}

export default useNavigationState
