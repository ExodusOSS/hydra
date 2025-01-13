// generate definitions for each redux module's selectors so that
// they can be consumed by selectors as moduleId.selectorName, e.g. 'walletAccounts.loaded'
// and from the top level as moduleId.selectors.selectorName, e.g. 'walletAccounts.selectors.loaded'

import typeforce from '@exodus/typeforce'
import lodash from 'lodash'
import { createSelector } from 'reselect'
import { MY_STATE } from './constants.js'

const { identity } = lodash

const OPTIONAL_SELECTOR_FALLBACK = () => {}
Object.defineProperty(OPTIONAL_SELECTOR_FALLBACK, 'isFallback', {
  value: true,
  writable: false,
})

const expandSelectorDependencyId = ({ moduleId, dependency }) => {
  typeforce(
    {
      module: (value) => value == null || (typeof value === 'string' && !value.includes('.')),
      selector: 'String',
      optional: '?Boolean',
    },
    dependency,
    true
  )

  // if `module` is absent, default to your own selectors
  // { module: 'moduleId', selector: 'selectorId' } -> `moduleId.selectors.selectorId`
  // { selector: 'selectorId' } -> `ownModuleId.selectors.selectorId`
  return `${dependency.module || moduleId}.selectors.${dependency.selector}${
    dependency.optional ? '?' : ''
  }`
}

const generateSelectorDependencies = ({
  id: moduleId,
  initialState,
  selectorDefinitions = [],
  createLogger,
}) => {
  const moduleSelectorDependencies = selectorDefinitions.map(
    ({ id: selectorId, resultFunction, selectorFactory, dependencies = [] }) => {
      return {
        id: `${moduleId}.selectors.${selectorId}`,
        type: 'selector',
        dependencies: dependencies.map((dependency) =>
          expandSelectorDependencyId({ moduleId, dependency })
        ),
        factory: (...deps) => {
          deps = deps.map((dep) => dep || OPTIONAL_SELECTOR_FALLBACK)
          return resultFunction ? createSelector(...deps, resultFunction) : selectorFactory(...deps)
        },
      }
    }
  )

  const selfStateSelector = createSelector(
    //
    (state) => state[moduleId] || initialState,
    identity
  )

  moduleSelectorDependencies.push(
    {
      id: `${moduleId}.selectors.${MY_STATE}`,
      type: 'selector',
      factory: () => selfStateSelector,
    },
    {
      id: `${moduleId}.selectors.logger`,
      type: 'selector',
      factory: () => () => createLogger(`exodus:${moduleId}:redux`),
    }
  )

  const moduleSelectorDependenciesIds = moduleSelectorDependencies.map(({ id }) => id)
  moduleSelectorDependencies.push({
    id: `${moduleId}.selectors`,
    dependencies: moduleSelectorDependenciesIds,
    type: 'selectors',
    factory: (...dependencies) => {
      const selectors = Object.create(null)
      selectorDefinitions.forEach(({ id }, i) => {
        if (id !== MY_STATE) {
          selectors[id] = dependencies[i]
        }
      })

      return selectors
    },
  })

  return moduleSelectorDependencies
}

export default generateSelectorDependencies
