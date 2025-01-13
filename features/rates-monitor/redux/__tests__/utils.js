import assetsRedux from '@exodus/assets-feature/redux'
import { combineReducers, createStore } from 'redux'
import { setupRedux } from '@exodus/redux-dependency-injection'
import ratesReduxDefinition from '../'
import localeRedux from '@exodus/locale/redux'
import { asset as bitcoin } from '@exodus/bitcoin-meta'
import { asset as ethereum, tokens as ethereumTokens } from '@exodus/ethereum-meta'
import { tokens as solanaTokens } from '@exodus/solana-meta'
import { connectAssets } from '@exodus/assets'
import combinedAssets from '@exodus/combined-assets-meta'

const usdcoin = ethereumTokens.find((a) => a.name === 'usdcoin')
// eslint-disable-next-line camelcase
const usdcoin_solana = solanaTokens.find((a) => a.name === 'usdcoin_solana')
const assets = connectAssets({
  bitcoin,
  ethereum,
  usdcoin,
  // eslint-disable-next-line camelcase
  usdcoin_solana,
  _usdcoin: combinedAssets.find((a) => a.name === '_usdcoin'),
})

export function setup({ dependencies = [] } = {}) {
  const allDependencies = [...dependencies, ratesReduxDefinition, localeRedux, assetsRedux]
  const enhancers = (createStore) => (reducers, initialState, enhancer) => {
    const reducer = combineReducers(reducers)
    return createStore(reducer, initialState, enhancer)
  }

  const redux = setupRedux({
    // override default deps with provided by de-duping
    dependencies: allDependencies.filter(
      (dep, i) => allDependencies.findIndex((other) => dep.id === other.id) === i
    ),
  })

  const { createHandleEvent, reducers, initialState } = redux
  const store = createStore(reducers, initialState, enhancers)
  const handleEvent = createHandleEvent(store)

  const emitRates = (rates) => handleEvent('rates', rates)
  const emitCurrencyChange = (currency) => handleEvent('currency', currency)
  handleEvent('assets', { assets })

  return { ...redux, store, emitRates, emitCurrencyChange }
}
