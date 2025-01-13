/* eslint-disable import/no-unresolved */

import reduxWatch from 'redux-watch'
import { bindActionCreators as _bindActionCreators } from 'redux'

export const bindActionCreators = (store, actions, deps, onError) => {
  const boundActionCreators = {}

  const wrapErrorHandling =
    (fn) =>
    (...args) => {
      if (!onError) return fn(...args)

      let result

      try {
        result = fn(...args)
      } catch (error) {
        onError(error)
        return
      }

      if (result instanceof Promise) {
        return result.catch(onError)
      }

      return result
    }

  Object.keys(actions).forEach((ac) => {
    const action = _bindActionCreators(actions[ac](deps), store.dispatch)
    boundActionCreators[ac] = wrapErrorHandling(action)
  })

  return boundActionCreators
}

export const bindSelectors = (store, selectors) => {
  const boundSelectors = {}

  Object.keys(selectors).forEach((ac) => {
    const fnName = ac.replace(/Selector$/, '')

    boundSelectors[fnName] = (...args) => {
      const result = selectors[ac](store.getState())
      return typeof result === 'function' ? result(...args) : result
    }
  })

  return boundSelectors
}

export const bindHooks = (store, hooks, deps) => {
  Object.values(hooks).forEach(([selector, handler]) => {
    const watch = reduxWatch(() => selector(store.getState()))
    const hook = handler(deps)
    store.subscribe(watch(hook))
  })
}
