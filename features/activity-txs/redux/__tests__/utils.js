import { connectAssetsList } from '@exodus/assets'
import assetsBase from '@exodus/assets-base'
import assetsReduxDefinition from '@exodus/assets-feature/redux/index.js'
import availableAssetsRedux from '@exodus/available-assets/redux/index.js'
import { keyBy } from '@exodus/basic-utils'
import connectedOriginsReduxDefinition from '@exodus/connected-origins/redux/index.js'
import { GEOLOCATION } from '@exodus/fiat-ramp/redux/__tests__/fixture.js'
import fiatReduxDefinition from '@exodus/fiat-ramp/redux/index.js'
import nftsReduxDefinition from '@exodus/nfts/redux/index.js'
import ordersRedux from '@exodus/orders/redux/index.js'
import personalNotesRedux from '@exodus/personal-notes/redux/index.js'
import { setupRedux } from '@exodus/redux-dependency-injection'
import walletAccountsRedux from '@exodus/wallet-accounts/redux/index.js'
import { combineReducers, createStore } from 'redux'

import activityTxsReduxDefinition from '../index.js'

const assets = connectAssetsList(Object.values(assetsBase))
export const { bitcoin, ethereum, algorand, flare } = assets
const isRestoringSelectorDefinition = {
  id: 'application.selectors.isRestoring',
  factory: () => () => false,
}

export function setup({ withPersonalNotes = true, withOrders = true } = {}) {
  const allDependencies = [
    activityTxsReduxDefinition,
    walletAccountsRedux(),
    assetsReduxDefinition,
    connectedOriginsReduxDefinition,
    availableAssetsRedux,
    isRestoringSelectorDefinition,
    nftsReduxDefinition,
    fiatReduxDefinition({}),
    {
      id: 'geolocation.selectors.data',
      factory: () => () => initialState.geolocation?.data ?? GEOLOCATION,
    },
  ]

  if (withPersonalNotes) {
    allDependencies.push(personalNotesRedux)
  }

  if (withOrders) {
    allDependencies.push(ordersRedux)
  }

  const enhancers = (createStore) => (reducers, initialState, enhancer) => {
    const reducer = combineReducers(reducers)
    return createStore(reducer, initialState, enhancer)
  }

  const redux = setupRedux({ dependencies: allDependencies })

  const { createHandleEvent, reducers, initialState } = redux

  const store = createStore(reducers, initialState, enhancers)

  const handleEvent = createHandleEvent(store)
  handleEvent('assets', {
    assets: keyBy([bitcoin, ethereum, flare, algorand], 'name'),
  })
  handleEvent('availableAssetNames', ['bitcoin', 'ethereum', 'algorand', 'flare'])
  return { ...redux, store, handleEvent, assets }
}
