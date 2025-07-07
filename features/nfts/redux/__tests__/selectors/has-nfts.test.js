import { setup } from '../utils.js'

describe('hasNfts', () => {
  it('should return false if not loaded', () => {
    const { store, selectors } = setup()

    expect(selectors.nfts.hasNfts(store.getState())).toEqual(false)
  })

  it('should return stored hasNfts', () => {
    const { store, selectors, handleEvent } = setup()

    const nfts = { exodus_0: { bitcoin: [{ id: 'someId1', owner: 'owner' }] } }

    handleEvent('nfts', nfts)

    expect(selectors.nfts.hasNfts(store.getState())).toEqual(true)
  })
})
