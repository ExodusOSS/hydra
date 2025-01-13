import type { Logger } from '@exodus/logger'
import type { Definition } from '@exodus/dependency-types'

type Values<D extends any[]> = D[number]

export type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (
  x: infer I
) => void
  ? I
  : never

type Definition<I extends string, T extends string> = {
  id: I
  type?: T
  factory: (...args: any) => any
  dependencies?: readonly string[]
}

type Dependency = {
  selector: string
  module?: string
}

type Reducer<S> = (state: S, payload: any) => S
type Selector = (...args: any) => any
type SelectorFactory = (...args: any) => Selector

type SelectorDefinitionBase = {
  id: string
  dependencies: readonly Dependency[]
}

type SelectorFactoryDefinition = SelectorDefinitionBase & {
  selectorFactory: SelectorFactory
}

type SelectorResultFuncDefinition = SelectorDefinitionBase & {
  resultFunction: Selector
}

export type SelectorDefinition = SelectorFactoryDefinition | SelectorResultFuncDefinition

export type ReduxModuleDefinition<S = any> = {
  id: string
  type: 'redux-module'
  initialState?: S
  eventReducers: Record<string, Reducer<S>>
  selectorDefinitions: readonly SelectorDefinition[]
}

type State = any
type StateReceiver<T extends (...args: any[]) => any> = (state: State) => ReturnType<T>

type SelectorInstance<S extends SelectorDefinition> = S extends SelectorFactoryDefinition
  ? ReturnType<S['selectorFactory']>
  : StateReceiver<S['resultFunction']>

type SelectorInstanceById<D extends SelectorDefinition> = {
  [K in D['id']]: SelectorInstance<Extract<D, { id: K }>>
}

type InitialStateSelectors<M extends ReduxModuleDefinition> = {
  [K in keyof M['initialState']]: (state: State) => M['initialState'][K]
}

type ReduxModuleSelectors<M extends ReduxModuleDefinition> = {
  [K in M['id']]: SelectorInstanceById<Values<Extract<M, { id: K }>['selectorDefinitions']>> &
    InitialStateSelectors<Extract<M, { id: K }>>
}

export type Selectors<D extends ContainerDependency> = UnionToIntersection<
  D extends ReduxModuleDefinition ? ReduxModuleSelectors<D> : never
>

type ContainerDependency = ReduxModuleDefinition | Definition

type Params = {
  dependencies: ContainerDependency[]
  initialState?: Record<string, any>
  reducers?: { [slice: string]: Reducer }
  createLogger?: () => Logger
}

type ReduxModuleInitialState<M extends ReduxModuleDefinition> = {
  [K in M['id']]: Extract<M, { id: K }>['initialState']
}

type InitialState<D extends ContainerDependency> = UnionToIntersection<
  D extends ReduxModuleDefinition ? ReduxModuleInitialState<D> : never
>

export function setupRedux<P extends Params>(
  params: P
): {
  initialState: InitialState<P['dependencies'][number]> &
    (P['initialState'] extends undefined ? {} : P['initialState']) // eslint-disable-line @typescript-eslint/no-empty-object-type
  reducers: { [slice: string]: Reducer }
  resolvedDependencies: any
  selectors: Selectors<P['dependencies'][number]>
  ioc: any
  createHandleEvent: (store: any) => (event: any, payload: any) => void
}

type Action<T = any> = (payload: T) => State
type ActionDictionary<T = any> = Record<string, Action<T>>
type SetupActionsParams<T = any> = {
  actions: ActionDictionary<T>
  ioc: any
}

export function setupActions<T = any, P extends SetupActionsParams<T>>(
  params: P
): ActionDictionary<T>

declare const MY_STATE: string
declare const SELF: string

export { MY_STATE, SELF }
