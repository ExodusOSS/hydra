// generate definitions for each redux module's selectors so that
// they can be consumed by selectors as moduleId.selectorName, e.g. 'walletAccounts.loaded'
// and from the top level as moduleId.selectors.selectorName, e.g. 'walletAccounts.selectors.loaded'

import typeforce from '@exodus/typeforce'
import lodash from 'lodash'
import { createSelector } from 'reselect'
import { MY_STATE } from './constants.js'
import type { Logger } from '@exodus/logger'
import type { SelectorDefinition, SelectorDependency } from './types.js'

const { identity } = lodash

const OPTIONAL_SELECTOR_FALLBACK = () => {}
Object.defineProperty(OPTIONAL_SELECTOR_FALLBACK, 'isFallback', {
  value: true,
  writable: false,
})

type GeneratedDependency = {
  id: string
  type: string
  dependencies?: string[]
  factory: (...deps: unknown[]) => unknown
}

const createSelectorFromDependencies = (
  dependencies: ((...args: unknown[]) => unknown)[],
  resultFunction: (...args: unknown[]) => unknown
) => {
  return (createSelector as (...args: unknown[]) => unknown)(...dependencies, resultFunction)
}

const expandSelectorDependencyId = ({
  moduleId,
  dependency,
}: {
  moduleId: string
  dependency: SelectorDependency
}) => {
  typeforce(
    {
      module: (value: unknown) =>
        value == null || (typeof value === 'string' && !value.includes('.')),
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

type SelectorDependencyInput = {
  id: string
  initialState: unknown
  selectorDefinitions?: readonly SelectorDefinition[]
  createLogger: (scope: string) => Logger
}

const generateSelectorDependencies = ({
  id: moduleId,
  initialState,
  selectorDefinitions = [],
  createLogger,
}: SelectorDependencyInput): GeneratedDependency[] => {
  const moduleSelectorDependencies: GeneratedDependency[] = selectorDefinitions.map(
    (selectorDefinition) => {
      const dependencies = (selectorDefinition.dependencies || []).map((dependency) =>
        expandSelectorDependencyId({ moduleId, dependency })
      )

      return {
        id: `${moduleId}.selectors.${selectorDefinition.id}`,
        type: 'selector',
        dependencies,
        factory: (...deps: unknown[]) => {
          const mappedDeps = deps.map((dep) => dep || OPTIONAL_SELECTOR_FALLBACK) as ((
            ...args: unknown[]
          ) => unknown)[]

          if ('resultFunction' in selectorDefinition) {
            return createSelectorFromDependencies(mappedDeps, selectorDefinition.resultFunction)
          }

          return selectorDefinition.selectorFactory(...mappedDeps)
        },
      }
    }
  )

  const selfStateSelector = createSelector(
    (state: Record<string, unknown>) => state[moduleId] || initialState,
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
    factory: (...dependencies: unknown[]) => {
      const selectors: Record<string, unknown> = Object.create(null)
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
