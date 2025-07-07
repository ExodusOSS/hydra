import { setup } from '../utils.js'

describe('configs', () => {
  it('should return default configs', () => {
    const { store, selectors } = setup()

    expect(selectors.nfts.configs(store.getState())).toEqual({})
  })

  it('should return stored configs', () => {
    const { store, selectors, handleEvent } = setup()

    const configs = {
      'algorand:453046935': { hidden: false },
      'algorand:860213877': { customPrice: 2 },
    }

    handleEvent('nftsConfigs', configs)

    expect(selectors.nfts.configs(store.getState())).toEqual(configs)
  })
})
