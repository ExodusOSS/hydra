import * as reduxLib from 'redux'
import type { AnyAction, Reducer as ReduxReducer, Store } from 'redux'
import type { SetupReduxParams, SetupReduxReturn } from './types.js'

// See setup-redux.ts: read through the CJS-interop default (which the redux
// types don't model) so redux resolves under the node:test ESM engine whether
// it hits real redux or a mock.
const redux = (reduxLib as unknown as { default?: typeof reduxLib }).default ?? reduxLib
const { combineReducers, createStore } = redux

type CreateReduxStoreParams<SetupParams extends SetupReduxParams> = Pick<
  SetupReduxReturn<SetupParams>,
  'reducers' | 'initialState'
>

export const createReduxStore = <SetupParams extends SetupReduxParams>({
  reducers,
  initialState,
}: CreateReduxStoreParams<SetupParams>): Store<SetupReduxReturn<SetupParams>['initialState']> => {
  type RootState = SetupReduxReturn<SetupParams>['initialState']
  const rootReducer = combineReducers(reducers) as unknown as ReduxReducer<RootState, AnyAction>
  // Keep compatibility across Redux type versions by avoiding preloadedState overload typing.
  const seededReducer: ReduxReducer<RootState, AnyAction> = (state, action) =>
    rootReducer((state ?? initialState) as RootState, action)

  return createStore(seededReducer)
}
