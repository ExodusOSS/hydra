import { getUniqueTagForWalletAccount } from '../utils.js'

describe('getUniqueTagForWalletAccount', () => {
  it('produces distinct tags for different non-software-seed sources at the same index', () => {
    expect(getUniqueTagForWalletAccount({ source: 'polymarket', index: 0 })).not.toEqual(
      getUniqueTagForWalletAccount({ source: 'mpswaps', index: 0 })
    )
  })

  it('keeps software-seed sources colliding at the same seedId+index', () => {
    expect(getUniqueTagForWalletAccount({ source: 'exodus', seedId: 'A', index: 0 })).toEqual(
      getUniqueTagForWalletAccount({ source: 'seed', seedId: 'A', index: 0 })
    )
  })
})
