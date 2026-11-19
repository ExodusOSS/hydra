import { difference, mapKeys } from '@exodus/basic-utils'
import { MY_STATE } from './constants.js'
import eventToAction from './event-to-action.js'
import type {
  ActionsDefinition,
  Reducer,
  SelectorDefinition,
  SelectorResultFuncDefinition,
} from './types.js'

export const createDefaultInitialState = () => ({
  error: null,
  loaded: false,
  data: Object.create(null),
})

type AnyAction = { type: string; payload: unknown }

type CreateModuleInput<
  ModuleId extends string = string,
  ModuleState extends Record<string, unknown> = Record<string, unknown>,
  SelectorDefs extends SelectorDefinition = SelectorDefinition,
> = {
  id: ModuleId
  initialState?: ModuleState
  actionsDefinition?: ActionsDefinition
  eventReducers?: Record<string, Reducer<ModuleState>>
  actionReducers?: Record<string, Reducer<ModuleState>>
  selectorDefinitions?: readonly SelectorDefs[]
}

type InitialStateSelector<ModuleState extends Record<string, unknown>> = {
  [Key in Extract<keyof ModuleState, string>]: SelectorResultFuncDefinition<
    [Record<string, unknown>],
    ModuleState[Key],
    readonly [{ selector: typeof MY_STATE }]
  > & { id: Key; type: 'selector' }
}[Extract<keyof ModuleState, string>]

type CreatedModule<
  ModuleId extends string,
  ModuleState extends Record<string, unknown>,
  SelectorDefs extends SelectorDefinition,
> = {
  id: ModuleId
  type: 'redux-module'
  initialState: ModuleState
  reducer: (state: ModuleState | undefined, action: AnyAction) => ModuleState
  eventReducers: Record<string, Reducer<ModuleState>>
  actionReducers: Record<string, Reducer<ModuleState>>
  actionsDefinition?: ActionsDefinition
  selectorDefinitions: readonly (SelectorDefs | InitialStateSelector<ModuleState>)[]
}

export const createModule = <
  ModuleId extends string = string,
  ModuleState extends Record<string, unknown> = Record<string, unknown>,
  SelectorDefs extends SelectorDefinition = SelectorDefinition,
>({
  id: moduleId,
  // oxlint-disable-next-line typescript/no-unnecessary-type-assertion -- createDefaultInitialState() returns a fixed shape that may not match a caller-provided ModuleState
  initialState = createDefaultInitialState() as unknown as ModuleState,
  actionsDefinition,
  eventReducers = Object.create(null) as Record<string, Reducer<ModuleState>>,
  actionReducers = Object.create(null) as Record<string, Reducer<ModuleState>>,
  selectorDefinitions = [] as const,
}: CreateModuleInput<ModuleId, ModuleState, SelectorDefs>): CreatedModule<
  ModuleId,
  ModuleState,
  SelectorDefs
> => {
  const actions = mapKeys(eventReducers, (_, event) => eventToAction({ moduleId, event }))
  const reducer = (state = initialState, { type, payload }: AnyAction): ModuleState =>
    (actions[type]?.(state, payload) ??
      actionReducers[type]?.(state, payload) ??
      state) as ModuleState

  const generatedInitialStateSelectors = difference(
    Object.keys(initialState),
    selectorDefinitions.map(({ id }) => id)
  ).map((key) => {
    const typedKey = key as Extract<keyof ModuleState, string>
    return {
      id: typedKey,
      type: 'selector',
      dependencies: [{ selector: MY_STATE }] as const,
      resultFunction: (selfState: Record<string, unknown>) => {
        return (selfState[typedKey] ?? initialState[typedKey]) as ModuleState[typeof typedKey]
      },
    }
  }) as InitialStateSelector<ModuleState>[]

  return {
    id: moduleId,
    type: 'redux-module',
    initialState,
    reducer,
    eventReducers,
    actionReducers,
    actionsDefinition,
    // one selector for each declared `initialState` field
    selectorDefinitions: [...selectorDefinitions, ...generatedInitialStateSelectors],
  }
}
