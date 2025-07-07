import { setup } from '../utils.js'

describe('loaded', () => {
  it('should return false when not loaded', () => {
    const { store, selectors } = setup()

    expect(selectors.nfts.loaded(store.getState())).toEqual(false)
  })

  it('should return true when loaded', () => {
    const { store, selectors, handleEvent } = setup()

    const bitcoinNfts = { exodus_0: { bitcoin: [{ id: 'someId1', owner: 'owner' }] } }
    const solanaNfts = { exodus_0: { solana: [{ id: 'someId2', owner: 'owner' }] } }

    handleEvent('nfts', bitcoinNfts)
    handleEvent('nfts', solanaNfts)

    expect(selectors.nfts.loaded(store.getState())).toEqual(true)
  })
})
