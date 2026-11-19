import type { Selectors, ReduxModuleDefinition } from '@exodus/redux-dependency-injection'
import type { ActionCreatorsMapObject, StoreEnhancer, ReducersMapObject } from 'redux'
import type { Logger } from '@exodus/logger'

export type ReduxIOCParams = {
  createLogger?: () => Logger
  enhancer?: StoreEnhancer<any, any>
  actionCreators: ActionCreatorsMapObject
  reducers: ReducersMapObject<any, any>
}

export type ResolvedReduxIOC<Modules extends ReduxModuleDefinition> = {
  store: any
  selectors: Selectors<Modules>
  actionCreators: ActionCreatorsMapObject
  handleEvent: (event: any, payload: any) => void
}

// Fluent, typed IOC: each `use(module)` accumulates `module` into the union of
// registered modules, so `resolve().selectors` is the intersection of every
// registered module's selectors (`Selectors<Modules>`).
export type ReduxIOC<Modules extends ReduxModuleDefinition = never> = {
  use<Module extends ReduxModuleDefinition>(reduxModule: Module): ReduxIOC<Modules | Module>
  resolve: () => ResolvedReduxIOC<Modules>
}

export default function createReduxIOC(params: ReduxIOCParams): ReduxIOC
