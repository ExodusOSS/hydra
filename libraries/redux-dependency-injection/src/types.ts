import type { Logger } from '@exodus/logger'
import type { Definition as DependencyDefinition } from '@exodus/dependency-types'
import type { AnyAction, Reducer as ReduxStoreReducer } from 'redux'

type ArrayValues<TArray extends readonly unknown[]> = TArray[number]

export type UnionToIntersection<UnionType> = (
  UnionType extends unknown ? (value: UnionType) => void : never
) extends (value: infer IntersectionType) => void
  ? IntersectionType
  : never

export type RootStateWithSlice<SliceId extends string, SliceState> = Record<string, unknown> & {
  [SliceKey in SliceId]: SliceState
}

type DependencyNodeDefinition = Pick<
  DependencyDefinition,
  'id' | 'type' | 'factory' | 'dependencies'
>

export type SelectorDependency = {
  selector: string
  module?: string
  optional?: boolean
}

export type Reducer<StateShape = unknown, Payload = unknown> = {
  bivarianceHack(state: StateShape, payload: Payload): StateShape
}['bivarianceHack']

export type ReduxReducerMap = Record<string, ReduxStoreReducer<unknown, AnyAction>>

type Selector<Args extends readonly unknown[] = readonly unknown[], Result = unknown> = {
  bivarianceHack(...args: Args): Result
}['bivarianceHack']

type SelectorFactory<
  Args extends readonly unknown[] = readonly unknown[],
  SelectorFn extends Selector = Selector,
> = {
  bivarianceHack(...args: Args): SelectorFn
}['bivarianceHack']

type SelectorDefinitionBase<
  Id extends string = string,
  DependencyList extends readonly SelectorDependency[] = readonly SelectorDependency[],
> = {
  id: Id
  dependencies: DependencyList
}

export type SelectorFactoryDefinition<
  Args extends readonly unknown[] = readonly unknown[],
  SelectorFn extends Selector = Selector,
  DependencyList extends readonly SelectorDependency[] = readonly SelectorDependency[],
  Id extends string = string,
> = SelectorDefinitionBase<Id, DependencyList> & {
  selectorFactory: SelectorFactory<Args, SelectorFn>
}

export type SelectorResultFuncDefinition<
  Args extends readonly unknown[] = readonly unknown[],
  Result = unknown,
  DependencyList extends readonly SelectorDependency[] = readonly SelectorDependency[],
  Id extends string = string,
> = SelectorDefinitionBase<Id, DependencyList> & {
  resultFunction: Selector<Args, Result>
}

export type SelectorDefinition<
  Args extends readonly unknown[] = readonly unknown[],
  SelectorFn extends Selector = Selector,
  Result = unknown,
  DependencyList extends readonly SelectorDependency[] = readonly SelectorDependency[],
> =
  | SelectorFactoryDefinition<Args, SelectorFn, DependencyList>
  | SelectorResultFuncDefinition<Args, Result, DependencyList>

export type ActionsDefinition = {
  dependencies: readonly string[]
  factory: (deps: Record<string, unknown>) => unknown
}

export type ReduxModuleDefinition<
  ModuleState extends Record<string, unknown> = Record<string, unknown>,
  SelectorDefs extends SelectorDefinition = SelectorDefinition,
  ModuleId extends string = string,
> = {
  id: ModuleId
  type: 'redux-module'
  initialState?: ModuleState
  eventReducers: Record<string, Reducer<ModuleState>>
  actionReducers?: Record<string, Reducer<ModuleState>>
  actionsDefinition?: ActionsDefinition
  selectorDefinitions: readonly SelectorDefs[]
}

type SelectorInstance<SelectorDef extends SelectorDefinition, RootState = unknown> =
  SelectorDef extends SelectorFactoryDefinition<infer _Args, infer SelectorFn>
    ? SelectorFn
    : SelectorDef extends SelectorResultFuncDefinition<infer _Args, infer Result>
      ? (state: RootState) => Result
      : never

type SelectorInstanceById<SelectorDefs extends SelectorDefinition, RootState = unknown> = {
  [SelectorId in SelectorDefs['id']]: SelectorInstance<
    Extract<SelectorDefs, { id: SelectorId }>,
    RootState
  >
}

// When initialState is optional (ModuleState | undefined), keyof resolves to never,
// so this mapped type produces {} — correct, since no initial-state selectors are generated.
type InitialStateSelectors<ModuleDef extends ReduxModuleDefinition, RootState = unknown> = {
  [StateKey in keyof ModuleDef['initialState']]: (
    state: RootState
  ) => ModuleDef['initialState'][StateKey]
}

type ReduxModuleSelectors<ModuleDef extends ReduxModuleDefinition, RootState = unknown> = {
  [ModuleId in ModuleDef['id']]: SelectorInstanceById<
    ArrayValues<Extract<ModuleDef, { id: ModuleId }>['selectorDefinitions']>,
    RootState
  > &
    InitialStateSelectors<Extract<ModuleDef, { id: ModuleId }>, RootState>
}

export type ContainerDependency = ReduxModuleDefinition | DependencyNodeDefinition

export type Selectors<
  Dependencies extends ContainerDependency,
  RootState = unknown,
> = UnionToIntersection<
  Dependencies extends ReduxModuleDefinition ? ReduxModuleSelectors<Dependencies, RootState> : never
>

export type SetupReduxParams = {
  dependencies: ContainerDependency[]
  reducers?: ReduxReducerMap
  createLogger?: (scope: string) => Logger
}

// A widened `id: string` on any `selectorDefinitions` element collapses
// `setupRedux`'s per-key selector inference — `selectors.<module>.<name>`
// turns into a union of every selector shape plus `undefined`, defeating
// every downstream assertion. The helpers in `define-selector.ts` preserve
// literal ids via `const` type parameters; the types below force callers
// through those helpers by rejecting widened ids at the `setupRedux` call site.

// We short-circuit when `selectorDefinitions` is *exactly* the base array type
// `readonly SelectorDefinition[]` — that's the constraint fallback on a generic
// `Deps extends readonly ContainerDependency[]` passthrough, or a deliberate
// test-helper that accepts widened arrays from callers. Either way, no user
// concretely shipped a widened module here.
//
// A user who explicitly annotates a selector — `const sel: SelectorDefinition`
// inside `selectorDefinitions: [sel] as const` — produces a *tuple*
// `readonly [SelectorDefinition]`, which is narrower than the base array, fails
// this exact-match, and is correctly flagged as widened.
type IsExactly<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false

type HasWidenedSelectorId<Deps> = Deps extends readonly (infer Dep)[]
  ? Dep extends { selectorDefinitions: infer SelDefs }
    ? IsExactly<SelDefs, readonly SelectorDefinition[]> extends true
      ? never
      : SelDefs extends readonly (infer SelDef)[]
        ? SelDef extends { id: infer Id }
          ? string extends Id
            ? true
            : never
          : never
        : never
    : never
  : never

export type SetupReduxSecondArgIfWidenedSelectorIds<SetupParams extends SetupReduxParams> = [
  HasWidenedSelectorId<SetupParams['dependencies']>,
] extends [never]
  ? []
  : [
      error: 'One of your selectorDefinitions has a widened `id: string`. All IOC node definitions should be written with `as const` to prevent that',
    ]

// Distribute over the redux-module arms of the dependency union, build a
// per-module `{[id]: initialState}` slice for each, then intersect. Literal
// `id`s survive because each arm contributes its own object type with its
// own keys; widened-id arms (e.g. `as ContainerDependency` casts in test
// fixtures) contribute only an index signature, which the intersection
// keeps as a fallback without erasing the literal keys.
//
// When the dependency array contains no redux-module arms (only
// `DependencyNodeDefinition`s, or just empty), `UnionToIntersection<never>`
// widens to `unknown` and would leak that through to `initialState` and the
// reducer signature. Guard with an explicit `Record<string, never>` fallback
// so the state stays a (correctly empty) object type — matches the runtime,
// where `buildInitialState` returns an empty object in that case.
export type SetupReduxState<SetupParams extends SetupReduxParams> = [
  Extract<SetupParams['dependencies'][number], ReduxModuleDefinition>,
] extends [never]
  ? Record<string, never>
  : UnionToIntersection<
      SetupParams['dependencies'][number] extends infer Dep
        ? Dep extends ReduxModuleDefinition
          ? { [ModuleId in Dep['id']]: Extract<Dep, { id: ModuleId }>['initialState'] }
          : never
        : never
    >

export type SetupReduxReturn<SetupParams extends SetupReduxParams> = {
  initialState: SetupReduxState<SetupParams>
  reducers: ReduxReducerMap
  combinedReducer: ReduxStoreReducer<SetupReduxState<SetupParams>, AnyAction>
  resolvedDependencies: unknown
  selectors: Selectors<SetupParams['dependencies'][number], SetupReduxState<SetupParams>>
  ioc: unknown
  createHandleEvent: <
    Store extends { dispatch: (action: { type: string; payload?: unknown }) => void },
  >(
    store: Store
  ) => (event: string, payload: unknown) => void
}

export type SetupRedux = <SetupParams extends SetupReduxParams>(
  params: SetupParams,
  ..._rejectWidenedSelectorIds: SetupReduxSecondArgIfWidenedSelectorIds<SetupParams>
) => SetupReduxReturn<SetupParams>

type Action<Payload = unknown, Result = unknown> = (payload: Payload) => Result
export type ActionDictionary<Payload = unknown, Result = unknown> = Record<
  string,
  Action<Payload, Result>
>
export type SetupActionsParams<Payload = unknown, Result = unknown> = {
  actions?: ActionDictionary<Payload, Result>
  ioc: unknown
}

export type SetupActions = <Payload = unknown, Result = unknown>(
  params: SetupActionsParams<Payload, Result>
) => ActionDictionary<Payload, Result>
