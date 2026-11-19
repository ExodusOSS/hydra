import type {
  ActionsDefinition,
  Reducer,
  ReduxModuleDefinition,
  SelectorDefinition,
} from './types.js'

type ReduxModuleBaseInput<ModuleId extends string, ModuleState extends Record<string, unknown>> = {
  id: ModuleId
  eventReducers: Record<string, Reducer<ModuleState>>
  actionReducers?: Record<string, Reducer<ModuleState>>
  actionsDefinition?: ActionsDefinition
}

export function defineReduxModule<
  const ModuleId extends string,
  InitialState extends Record<string, unknown>,
  const SelectorDefs extends SelectorDefinition,
>(
  definition: {
    initialState: InitialState
    selectorDefinitions: readonly SelectorDefs[]
  } & ReduxModuleBaseInput<ModuleId, InitialState>
): ReduxModuleDefinition<InitialState, SelectorDefs, ModuleId>

export function defineReduxModule<
  const ModuleId extends string,
  const SelectorDefs extends SelectorDefinition,
>(
  definition: {
    initialState?: undefined
    selectorDefinitions: readonly SelectorDefs[]
  } & ReduxModuleBaseInput<ModuleId, Record<string, unknown>>
): ReduxModuleDefinition<Record<string, unknown>, SelectorDefs, ModuleId>

export function defineReduxModule<
  const ModuleId extends string,
  const SelectorDefs extends SelectorDefinition,
>(
  definition: {
    initialState?: Record<string, unknown>
    selectorDefinitions: readonly SelectorDefs[]
  } & ReduxModuleBaseInput<ModuleId, Record<string, unknown>>
): ReduxModuleDefinition<Record<string, unknown>, SelectorDefs, ModuleId> {
  return {
    ...definition,
    type: 'redux-module',
  }
}
