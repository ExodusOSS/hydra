import {
  type ContainerDependency,
  type ReduxModuleDefinition,
  type SelectorDefinition,
  setupRedux,
} from '@exodus/redux-dependency-injection'
import { createStore } from 'redux'

import assetsReduxDefinition from '../../../assets-feature/redux/index.js'
import availableAssetsReduxDefinition from '../../../available-assets/redux/index.js'
import enabledAssetsReduxDefinition from '../../../enabled-assets/redux/index.js'
import assetSourcesReduxDefinition from '../index.js'

// The three JS-only deps below import as JS-inferred shapes whose `type` field
// is widened to `string`, failing the `type: 'redux-module'` discriminant on
// `ReduxModuleDefinition` and forcing TS to compare them against
// `DependencyNodeDefinition`. We cast to `ReduxModuleDefinition<…, literal id>`
// so the array typechecks and `setupRedux`'s `InitialState` keeps the literal
// id keys. Removable once those packages ship literal types (e.g. by adding
// hand-written `.d.ts` files matching `features/assets-feature/redux/index.d.ts`).
type ModuleAs<Id extends string> = ReduxModuleDefinition<
  Record<string, unknown>,
  SelectorDefinition,
  Id
>

export function setup<const Deps extends readonly ContainerDependency[] = readonly []>({
  dependencies,
}: { dependencies?: Deps } = {}) {
  const allDependencies = [
    ...(dependencies ?? []),
    assetSourcesReduxDefinition,
    enabledAssetsReduxDefinition as ModuleAs<'enabledAssets'>,
    assetsReduxDefinition as ModuleAs<'assets'>,
    availableAssetsReduxDefinition as ModuleAs<'availableAssets'>,
  ]

  const redux = setupRedux({
    dependencies: allDependencies.filter(
      (dep, i) => allDependencies.findIndex((other) => dep.id === other.id) === i
    ),
  })

  const { createHandleEvent, combinedReducer } = redux
  const store = createStore(combinedReducer)
  const handleEvent = createHandleEvent(store)

  const emitAvailableAssetNames = (value: string[]) => handleEvent('availableAssetNames', value)

  const emitAvailableAssetNamesByWalletAccount = (value: Record<string, string[]>) =>
    handleEvent('availableAssetNamesByWalletAccount', value)

  const emitEnabledAssets = (data: Record<string, boolean>) => handleEvent('enabledAssets', data)
  const emitAssets = (data: Record<string, unknown>) => handleEvent('assets', { assets: data })

  return {
    ...redux,
    store,
    emitAvailableAssetNamesByWalletAccount,
    emitEnabledAssets,
    emitAssets,
    emitAvailableAssetNames,
  }
}
