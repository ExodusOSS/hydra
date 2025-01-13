import { setup } from '../utils'

const DEFAULT_PROFILE = { name: 'Test', nft: null }

describe('data', () => {
  it('should return default data', () => {
    const { store, selectors } = setup({ defaultProfile: DEFAULT_PROFILE })

    expect(selectors.profile.data(store.getState())).toEqual(DEFAULT_PROFILE)
  })

  it('should return current data', () => {
    const { store, selectors, handleEvent } = setup({ defaultProfile: DEFAULT_PROFILE })

    const newProfile = { name: 'Exodus', nft: 'someNft' }

    handleEvent('profile', newProfile)

    expect(selectors.profile.data(store.getState())).toEqual(newProfile)
  })
})
