import type { Selectors, ReduxModuleDefinition } from '@exodus/redux-dependency-injection'
import type { ActionCreatorsMapObject, StoreEnhancer, ReducersMapObject } from 'redux'
import type { Logger } from '@exodus/logger'

type ReduxIOCParams = {
  createLogger?: () => Logger
  enhancer?: StoreEnhancer<any, any>
  actionCreators: ActionCreatorsMapObject
  reducers: ReducersMapObject<any, any>
}

export default function createReduxIOC<P extends ReduxIOCParams>(
  params: P
): {
  resolve: () => {
    store: any
    selectors: Selectors<P['dependencies'][number]>
    actionCreators: ActionCreatorsMapObject
    handleEvent: (event: any, payload: any) => void
  }

  use(reduxModule: ReduxModuleDefinition): void
}
